# Dialogue Editor

A visual node-based editor for creating branching dialogue trees. Build conversations with plain text or multiple-choice nodes, add translations, and export JSON for use in games or other applications.

## Running the App

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## How to Use

### Editor Tab

- **Add nodes** — Right-click on the canvas → **Add Node**.
- **Edit dialogue** — Click a node and type in the **NPC Text** field. This is the text the character says.
- **Connect nodes** — Drag from a node's right handle to another node's left handle to define the flow.
- **Node type** — Use the **Type** dropdown:
  - **Plain Text** — Single line of dialogue with one continuation. Connect the right handle to the next node.
  - **Multiple Choice** — Several player options. Add options with **+ Add Option**, edit each option's text, then connect each option's handle (right side) to the node it leads to. Remove options with **−** (at least one is required).
- **Delete nodes** — Click the × button on a node, or select it and press `Delete`.
- **Pan & zoom** — Drag the canvas to pan; use the controls in the bottom-left or scroll to zoom.

### Translations Tab

- **Add languages** — Click the **+** button and enter a language name (e.g. Spanish, French).
- **Translate text** — Expand a dialogue entry and fill in the translation for each language.
- Translations are stored in the exported JSON and can be used by your game for localization.

### Export & Import

- **Export JSON** — Toolbar → **Export JSON** — downloads the dialogue graph plus languages and translations as a `.json` file.
- **Import JSON** — Toolbar → **Import JSON** — loads a previously exported file and replaces the current graph.

The exported JSON can be used with the Unity scripts in the `unity-dialogue-player` folder.

---

## Using in Unity

The `unity-dialogue-player` folder contains C# scripts that read the exported JSON and display dialogue in Unity using the legacy Text component.

### Quick setup

1. **Add Newtonsoft.Json** — Unity’s built-in JSON parser cannot handle translations. In Package Manager → Add package by name → enter `com.unity.nuget.newtonsoft-json`.

2. **Copy the scripts** — Copy `DialogueData.cs` and `DialoguePlayer.cs` into your project’s `Assets/` folder.

3. **Place the JSON file** — Put your exported `dialogue.json` in `Assets/StreamingAssets/dialogue.json`.

4. **Build the UI** — Create a Canvas with:
   - A **Text** component for the NPC dialogue
   - A **Button** for “Continue” (plain nodes)
   - An empty **GameObject** as the parent for choice buttons
   - An optional **Dropdown** for language selection

5. **Create a ChoiceButton prefab** — A Button with a child Text. Save it as a prefab.

6. **Wire up DialoguePlayer** — Add the DialoguePlayer component to a GameObject, then assign the Text, Continue Button, Choices Container, and Choice Button Prefab in the inspector.

### Canvas hierarchy

Create a Canvas with this structure:

```
Canvas
└── DialoguePanel (Panel / Image)
    ├── DialogueText          ← Text component (displays NPC dialogue)
    ├── ContinueButton        ← Button (shown on plain nodes)
    │   └── Text  "Continue"
    ├── ChoicesContainer      ← Empty GameObject (parent for choice buttons)
    └── LanguageDropdown      ← Dropdown (optional, for translations)
```

### Inspector fields

| Field | Assign to |
|-------|-----------|
| Dialogue Text | `DialogueText` Text component |
| Continue Button | `ContinueButton` Button |
| Choices Container | `ChoicesContainer` Transform |
| Choice Button Prefab | Your Button prefab with child Text |
| Language Dropdown | `LanguageDropdown` Dropdown *(optional)* |
| Json File Name | `dialogue.json` or your file name |

### Behaviour

- **Plain nodes** — NPC text and a Continue button; clicking advances to the next node.
- **Choice nodes** — Buttons are spawned per option; each choice can lead to a different node.
- **Entry node** — The script auto-detects the first node (no incoming `next` reference).
- **Translations** — If you use the dropdown, text is looked up in `translations[language][id]` before falling back to the default.

For the full JSON schema and further details, see `unity-dialogue-player/README.md`.

---

## Tech Stack

This project uses React + TypeScript + Vite.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```
