using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using Newtonsoft.Json;

/// <summary>
/// Reads a dialogue JSON file exported by the Dialogue Editor app and drives
/// a simple Unity UI dialogue system using legacy Text components.
///
/// Required Unity package: com.unity.nuget.newtonsoft-json
/// (Add via Package Manager → Add package by name)
///
/// Scene setup — create a Canvas with the following children and wire them up
/// in the inspector:
///
///   DialoguePanel
///   ├── DialogueText          (Text)          → dialogueText
///   ├── ContinueButton        (Button)        → continueButton
///   ├── ChoicesContainer      (GameObject)    → choicesContainer
///   │   └── (buttons spawned at runtime)
///   └── LanguageDropdown      (Dropdown)      → languageDropdown  [optional]
///
/// Also create a ChoiceButton prefab (Button with a child Text) and assign it
/// to choiceButtonPrefab.
///
/// Place your exported dialogue.json inside Assets/StreamingAssets/ and set
/// jsonFileName to match the file name.
/// </summary>
public class DialoguePlayer : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private Text dialogueText;
    [SerializeField] private Button continueButton;
    [SerializeField] private Transform choicesContainer;
    [SerializeField] private Button choiceButtonPrefab;

    [Tooltip("Optional. When assigned, a language selector dropdown is shown.")]
    [SerializeField] private Dropdown languageDropdown;

    [Header("Settings")]
    [Tooltip("File name inside Assets/StreamingAssets/.")]
    [SerializeField] private string jsonFileName = "dialogue.json";

    [Tooltip("Prefix added before every line of dialogue. Leave empty to omit.")]
    [SerializeField] private string speakerName = "";

    // -------------------------------------------------------------------------

    private DialogueFile _file;
    private Dictionary<string, DialogueNode> _nodeMap;
    private DialogueNode _currentNode;
    private string _currentLanguage;

    private readonly List<Button> _spawnedButtons = new List<Button>();

    // -------------------------------------------------------------------------
    // Unity lifecycle
    // -------------------------------------------------------------------------

    private void Start()
    {
        LoadDialogue();
        SetupLanguageDropdown();
        StartDialogue();
    }

    // -------------------------------------------------------------------------
    // Initialisation
    // -------------------------------------------------------------------------

    private void LoadDialogue()
    {
        string path = Path.Combine(Application.streamingAssetsPath, jsonFileName);

        if (!File.Exists(path))
        {
            Debug.LogError($"[DialoguePlayer] File not found: {path}\n" +
                           "Place the exported JSON inside Assets/StreamingAssets/.");
            return;
        }

        string json = File.ReadAllText(path);
        _file = JsonConvert.DeserializeObject<DialogueFile>(json);

        _nodeMap = new Dictionary<string, DialogueNode>();
        foreach (DialogueNode node in _file.nodes)
            _nodeMap[node.id] = node;
    }

    private void SetupLanguageDropdown()
    {
        if (languageDropdown == null) return;
        if (_file == null) return;

        var options = new List<string> { "Default" };
        if (_file.languages != null)
            options.AddRange(_file.languages);

        languageDropdown.ClearOptions();
        languageDropdown.AddOptions(options);
        languageDropdown.onValueChanged.AddListener(OnLanguageChanged);
    }

    /// <summary>
    /// Finds the entry node — the first node that no other node points to.
    /// Falls back to the first node in the array.
    /// </summary>
    private void StartDialogue()
    {
        if (_file == null || _file.nodes.Count == 0)
        {
            Debug.LogWarning("[DialoguePlayer] No dialogue data loaded.");
            return;
        }

        var referenced = new HashSet<string>();
        foreach (DialogueNode node in _file.nodes)
        {
            if (!string.IsNullOrEmpty(node.next))
                referenced.Add(node.next);

            if (node.choices != null)
                foreach (DialogueChoice c in node.choices)
                    if (!string.IsNullOrEmpty(c.next))
                        referenced.Add(c.next);
        }

        DialogueNode entry = _file.nodes.FirstOrDefault(n => !referenced.Contains(n.id))
                             ?? _file.nodes[0];

        DisplayNode(entry);
    }

    // -------------------------------------------------------------------------
    // Display
    // -------------------------------------------------------------------------

    private void DisplayNode(DialogueNode node)
    {
        if (node == null) return;
        _currentNode = node;

        string text = GetLocalizedText(node.id, node.text);
        dialogueText.text = string.IsNullOrEmpty(speakerName)
            ? text
            : $"{speakerName}: {text}";

        ClearChoiceButtons();

        bool isChoice = node.type == "choice"
                        && node.choices != null
                        && node.choices.Count > 0;

        if (isChoice)
        {
            continueButton.gameObject.SetActive(false);
            choicesContainer.gameObject.SetActive(true);
            SpawnChoiceButtons(node.choices);
        }
        else
        {
            continueButton.gameObject.SetActive(true);
            choicesContainer.gameObject.SetActive(false);

            continueButton.onClick.RemoveAllListeners();
            continueButton.onClick.AddListener(() => AdvanceTo(node.next));
        }
    }

    private void SpawnChoiceButtons(List<DialogueChoice> choices)
    {
        foreach (DialogueChoice choice in choices)
        {
            DialogueChoice captured = choice;
            Button btn = Instantiate(choiceButtonPrefab, choicesContainer);

            Text label = btn.GetComponentInChildren<Text>();
            if (label != null)
                label.text = GetLocalizedText(captured.id, captured.text);

            btn.onClick.AddListener(() => AdvanceTo(captured.next));
            _spawnedButtons.Add(btn);
        }
    }

    // -------------------------------------------------------------------------
    // Navigation
    // -------------------------------------------------------------------------

    private void AdvanceTo(string nextId)
    {
        if (string.IsNullOrEmpty(nextId) || !_nodeMap.ContainsKey(nextId))
        {
            EndDialogue();
            return;
        }

        DisplayNode(_nodeMap[nextId]);
    }

    private void EndDialogue()
    {
        ClearChoiceButtons();
        dialogueText.text = string.Empty;
        continueButton.gameObject.SetActive(false);
        choicesContainer.gameObject.SetActive(false);
        Debug.Log("[DialoguePlayer] Dialogue finished.");
    }

    // -------------------------------------------------------------------------
    // Language
    // -------------------------------------------------------------------------

    private void OnLanguageChanged(int index)
    {
        _currentLanguage = (index == 0 || _file?.languages == null)
            ? null
            : _file.languages[index - 1];

        DisplayNode(_currentNode);
    }

    private string GetLocalizedText(string id, string fallback)
    {
        if (_currentLanguage != null
            && _file?.translations != null
            && _file.translations.TryGetValue(_currentLanguage, out var langMap)
            && langMap.TryGetValue(id, out string translated)
            && !string.IsNullOrEmpty(translated))
        {
            return translated;
        }

        return fallback;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void ClearChoiceButtons()
    {
        foreach (Button btn in _spawnedButtons)
            if (btn != null) Destroy(btn.gameObject);
        _spawnedButtons.Clear();
    }
}
