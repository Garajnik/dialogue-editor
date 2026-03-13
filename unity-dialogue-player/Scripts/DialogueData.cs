using System;
using System.Collections.Generic;

/// <summary>
/// Root object matching the JSON exported by the Dialogue Editor application.
/// </summary>
[Serializable]
public class DialogueFile
{
    public List<DialogueNode> nodes = new List<DialogueNode>();

    /// <summary>Ordered list of target language display names, e.g. ["Spanish", "French"].</summary>
    public List<string> languages = new List<string>();

    /// <summary>
    /// Nested translation map: { language: { textEntryId: translatedText } }
    /// textEntryId is the node id for NPC text, or the choice id for choice text.
    /// </summary>
    public Dictionary<string, Dictionary<string, string>> translations
        = new Dictionary<string, Dictionary<string, string>>();
}

[Serializable]
public class DialogueNode
{
    public string id;

    /// <summary>"plain" for linear dialogue, "choice" for branching.</summary>
    public string type;

    public string text;

    /// <summary>Id of the next node. Only set on plain nodes.</summary>
    public string next;

    /// <summary>Choices available to the player. Only populated on choice nodes.</summary>
    public List<DialogueChoice> choices = new List<DialogueChoice>();

    public NodePosition position;
}

[Serializable]
public class DialogueChoice
{
    public string id;
    public string text;

    /// <summary>Id of the node this choice leads to, or null if it ends the dialogue.</summary>
    public string next;
}

[Serializable]
public class NodePosition
{
    public float x;
    public float y;
}
