import type { Edge } from '@xyflow/react';
import type {
  DialogueNode,
  DialogueNodeData,
  ExportedDialogue,
  ExportedNode,
  Languages,
  Translations,
} from '../types';

export function exportDialogue(
  nodes: DialogueNode[],
  edges: Edge[],
  languages: Languages = [],
  translations: Translations = {},
): ExportedDialogue {
  const exported: ExportedNode[] = nodes.map((node) => {
    const data = node.data as DialogueNodeData;
    const base: ExportedNode = {
      id: node.id,
      type: data.dialogueType,
      text: data.text,
      position: { x: node.position.x, y: node.position.y },
    };

    if (data.dialogueType === 'choice') {
      base.choices = data.choices.map((choice) => {
        const edge = edges.find(
          (e) => e.source === node.id && e.sourceHandle === choice.id,
        );
        return {
          id: choice.id,
          text: choice.text,
          next: edge ? edge.target : null,
        };
      });
    } else {
      const edge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === 'source',
      );
      base.next = edge ? edge.target : null;
    }

    return base;
  });

  return {
    nodes: exported,
    languages: languages.length > 0 ? languages : undefined,
    translations: Object.keys(translations).length > 0 ? translations : undefined,
  };
}

export function importDialogue(json: ExportedDialogue): {
  nodes: DialogueNode[];
  edges: Edge[];
  languages: Languages;
  translations: Translations;
} {
  const nodes: DialogueNode[] = [];
  const edges: Edge[] = [];

  for (const exported of json.nodes) {
    const choices =
      exported.type === 'choice' && exported.choices
        ? exported.choices.map((c) => ({ id: c.id, text: c.text }))
        : [{ id: crypto.randomUUID(), text: '' }];

    const node: DialogueNode = {
      id: exported.id,
      type: 'dialogue',
      position: exported.position,
      data: {
        text: exported.text,
        dialogueType: exported.type,
        choices,
      },
    };
    nodes.push(node);

    if (exported.type === 'choice' && exported.choices) {
      for (const choice of exported.choices) {
        if (choice.next) {
          edges.push({
            id: `e-${exported.id}-${choice.id}`,
            source: exported.id,
            sourceHandle: choice.id,
            target: choice.next,
            targetHandle: 'target',
          });
        }
      }
    } else if (exported.next) {
      edges.push({
        id: `e-${exported.id}-source`,
        source: exported.id,
        sourceHandle: 'source',
        target: exported.next,
        targetHandle: 'target',
      });
    }
  }

  return {
    nodes,
    edges,
    languages: json.languages ?? [],
    translations: json.translations ?? {},
  };
}

export function downloadJson(dialogue: ExportedDialogue, filename = 'dialogue.json') {
  const json = JSON.stringify(dialogue, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<ExportedDialogue> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportedDialogue;
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
