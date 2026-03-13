# Unity Dialogue Player

Parses the JSON exported by the Dialogue Editor app and drives a simple
in-game dialogue UI using Unity's legacy **Text** component.

---

## File overview

| File | Purpose |
|------|---------|
| `Scripts/DialogueData.cs` | Plain C# data classes that mirror the exported JSON schema |
| `Scripts/DialoguePlayer.cs` | MonoBehaviour that loads, traverses, and displays the dialogue |

---

## Prerequisites

### Newtonsoft.Json (required)

Unity's built-in `JsonUtility` cannot deserialise nested dictionaries, which
are used for translations.  Add the official Unity port via the Package Manager:

1. **Window → Package Manager**
2. **+ → Add package by name**
3. Enter `com.unity.nuget.newtonsoft-json` and click **Add**

---

## Scene setup

### 1 – Copy the scripts

Drop both `.cs` files into your Unity project's `Assets/` folder (any subfolder is fine).

### 2 – Place the JSON file

Copy your exported `dialogue.json` into:

```
Assets/StreamingAssets/dialogue.json
```

Create the `StreamingAssets` folder if it doesn't exist.  
The file name can be changed in the inspector (`Json File Name` field).

### 3 – Build the Canvas hierarchy

Create a **Canvas** and build the following UI structure inside it:

```
Canvas
└── DialoguePanel (Panel / Image)
    ├── DialogueText          ← Text component (displays NPC dialogue)
    ├── ContinueButton        ← Button (shown on plain/linear nodes)
    │   └── Text  "Continue"
    ├── ChoicesContainer      ← Empty GameObject (parent for choice buttons)
    └── LanguageDropdown      ← Dropdown (optional, shows language selector)
```

### 4 – Create the ChoiceButton prefab

1. Create a **Button** in the scene and add a child **Text** inside it.
2. Style it however you like.
3. Drag it into `Assets/` to make it a **Prefab**, then delete it from the scene.

### 5 – Add DialoguePlayer to the scene

1. Create an empty **GameObject** (e.g. `DialogueManager`).
2. Attach the **DialoguePlayer** component.
3. Wire up the inspector fields:

| Inspector field | Scene object |
|-----------------|-------------|
| Dialogue Text | `DialogueText` Text component |
| Continue Button | `ContinueButton` Button component |
| Choices Container | `ChoicesContainer` Transform |
| Choice Button Prefab | The prefab you created in step 4 |
| Language Dropdown | `LanguageDropdown` Dropdown *(optional)* |
| Json File Name | `dialogue.json` *(or your custom name)* |
| Speaker Name | *(optional)* prepends `"Name: "` before every line |

---

## JSON schema reference

```jsonc
{
  "nodes": [
    {
      "id": "<uuid>",
      "type": "plain",          // "plain" = linear, "choice" = branching
      "text": "Hello, traveller!",
      "next": "<uuid>",         // id of next node (null = end of dialogue)
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "<uuid>",
      "type": "choice",
      "text": "What do you want?",
      "choices": [
        { "id": "<uuid>", "text": "Tell me more.", "next": "<uuid>" },
        { "id": "<uuid>", "text": "Goodbye.",      "next": null }
      ],
      "position": { "x": 200, "y": 0 }
    }
  ],
  "languages": ["Spanish", "French"],
  "translations": {
    "Spanish": {
      "<nodeId>":   "Hola, viajero!",
      "<choiceId>": "Dime más."
    }
  }
}
```

---

## How it works

1. **Entry detection** — on `Start()` the script finds the node that no other
   node references as a `next` target; that becomes the first node shown.
2. **Plain nodes** — the NPC text is displayed and a *Continue* button advances
   to `next`.
3. **Choice nodes** — a button is spawned per choice.  Clicking one advances to
   that choice's `next`, or ends the dialogue if `next` is `null`.
4. **Translations** — when a language is selected in the dropdown, every text
   lookup first checks `translations[language][id]` before falling back to the
   default text.
5. **Dialogue end** — when a node has no `next` (or the id is not found), all
   UI elements are hidden and a log message is printed.
