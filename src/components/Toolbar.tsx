import { useCallback, useRef } from 'react';
import type { Edge } from '@xyflow/react';
import type { DialogueNode, Languages, Translations } from '../types';
import { exportDialogue, downloadJson, readJsonFile, importDialogue } from '../utils/exportImport';

interface ToolbarProps {
  nodes: DialogueNode[];
  edges: Edge[];
  languages: Languages;
  translations: Translations;
  onImport: (
    nodes: DialogueNode[],
    edges: Edge[],
    languages: Languages,
    translations: Translations,
  ) => void;
}

export function Toolbar({
  nodes,
  edges,
  languages,
  translations,
  onImport,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const dialogue = exportDialogue(nodes, edges, languages, translations);
    downloadJson(dialogue);
  }, [nodes, edges, languages, translations]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const json = await readJsonFile(file);
        const {
          nodes: importedNodes,
          edges: importedEdges,
          languages: importedLanguages,
          translations: importedTranslations,
        } = importDialogue(json);
        onImport(
          importedNodes,
          importedEdges,
          importedLanguages,
          importedTranslations,
        );
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import dialogue. Please check the JSON file format.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onImport],
  );

  return (
    <div className="toolbar">
      <span className="toolbar-title">Dialogue Editor</span>
      <div className="toolbar-actions">
        <button className="toolbar-btn" onClick={handleExport}>
          Export JSON
        </button>
        <button className="toolbar-btn" onClick={handleImportClick}>
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
