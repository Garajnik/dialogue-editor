import type { Node } from '@xyflow/react';

export type DialogueNodeType = 'plain' | 'choice';

export interface Choice {
  id: string;
  text: string;
}

export interface DialogueNodeData {
  text: string;
  dialogueType: DialogueNodeType;
  choices: Choice[];
  [key: string]: unknown;
}

export type DialogueNode = Node<DialogueNodeData, 'dialogue'>;

export interface ExportedChoice {
  id: string;
  text: string;
  next: string | null;
}

export interface ExportedNode {
  id: string;
  type: DialogueNodeType;
  text: string;
  next?: string | null;
  choices?: ExportedChoice[];
  position: { x: number; y: number };
}

export interface ExportedDialogue {
  nodes: ExportedNode[];
  languages?: Languages;
  translations?: Translations;
}

// Ordered list of target language display names, e.g. ["Spanish", "French"]
export type Languages = string[];

// { [language]: { [textEntryId]: translatedText } }
// textEntryId is nodeId for NPC text, choiceId for choice text
export type Translations = Record<string, Record<string, string>>;
