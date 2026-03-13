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
