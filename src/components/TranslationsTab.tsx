import { useCallback, useRef, useState } from 'react';
import type { DialogueNode, Languages, Translations } from '../types';

interface TextEntry {
  id: string;
  nodeIndex: number;
  label: string;
  sourceText: string;
}

function buildTextEntries(nodes: DialogueNode[]): TextEntry[] {
  const entries: TextEntry[] = [];
  nodes.forEach((node, nodeIndex) => {
    const num = nodeIndex + 1;
    entries.push({
      id: node.id,
      nodeIndex,
      label: `Node ${num} — NPC Text`,
      sourceText: node.data.text,
    });
    if (node.data.dialogueType === 'choice') {
      node.data.choices.forEach((choice, choiceIndex) => {
        entries.push({
          id: choice.id,
          nodeIndex,
          label: `Node ${num} — Choice ${choiceIndex + 1}`,
          sourceText: choice.text,
        });
      });
    }
  });
  return entries;
}

interface TranslationEntryProps {
  entry: TextEntry;
  languages: Languages;
  translations: Translations;
  onTranslationChange: (lang: string, id: string, value: string) => void;
}

function TranslationEntry({
  entry,
  languages,
  translations,
  onTranslationChange,
}: TranslationEntryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`translation-entry${expanded ? ' translation-entry--expanded' : ''}`}>
      <button
        className="translation-entry-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={`translation-chevron${expanded ? ' translation-chevron--open' : ''}`}>
          ▶
        </span>
        <span className="translation-entry-label">{entry.label}</span>
        <span className="translation-entry-source">
          {entry.sourceText || <em className="translation-entry-empty">No text</em>}
        </span>
      </button>
      {expanded && (
        <div className="translation-entry-body">
          {languages.length === 0 ? (
            <p className="translation-no-langs">No languages added yet. Add a language above.</p>
          ) : (
            languages.map((lang) => (
              <div key={lang} className="translation-field">
                <label className="translation-field-label">{lang}</label>
                <textarea
                  className="translation-field-input"
                  rows={2}
                  value={translations[lang]?.[entry.id] ?? ''}
                  onChange={(e) => onTranslationChange(lang, entry.id, e.target.value)}
                  placeholder={`${lang} translation…`}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface TranslationsTabProps {
  nodes: DialogueNode[];
  languages: Languages;
  translations: Translations;
  onLanguagesChange: (langs: Languages) => void;
  onTranslationsChange: (t: Translations) => void;
}

export function TranslationsTab({
  nodes,
  languages,
  translations,
  onLanguagesChange,
  onTranslationsChange,
}: TranslationsTabProps) {
  const [addingLang, setAddingLang] = useState(false);
  const [newLangInput, setNewLangInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = buildTextEntries(nodes);

  const handleAddLanguageStart = useCallback(() => {
    setAddingLang(true);
    setNewLangInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleConfirmLanguage = useCallback(() => {
    const name = newLangInput.trim();
    if (name && !languages.includes(name)) {
      onLanguagesChange([...languages, name]);
    }
    setAddingLang(false);
    setNewLangInput('');
  }, [newLangInput, languages, onLanguagesChange]);

  const handleNewLangKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleConfirmLanguage();
      if (e.key === 'Escape') {
        setAddingLang(false);
        setNewLangInput('');
      }
    },
    [handleConfirmLanguage],
  );

  const handleRemoveLanguage = useCallback(
    (lang: string) => {
      onLanguagesChange(languages.filter((l) => l !== lang));
      const updated = { ...translations };
      delete updated[lang];
      onTranslationsChange(updated);
    },
    [languages, translations, onLanguagesChange, onTranslationsChange],
  );

  const handleTranslationChange = useCallback(
    (lang: string, id: string, value: string) => {
      onTranslationsChange({
        ...translations,
        [lang]: {
          ...translations[lang],
          [id]: value,
        },
      });
    },
    [translations, onTranslationsChange],
  );

  return (
    <div className="translations-tab">
      <div className="lang-bar">
        <span className="lang-bar-label">Languages</span>
        <div className="lang-chips">
          {languages.map((lang) => (
            <span key={lang} className="lang-chip">
              {lang}
              <button
                className="lang-chip-remove"
                onClick={() => handleRemoveLanguage(lang)}
                title={`Remove ${lang}`}
                aria-label={`Remove ${lang}`}
              >
                ×
              </button>
            </span>
          ))}
          {addingLang ? (
            <span className="lang-input-wrapper">
              <input
                ref={inputRef}
                className="lang-input"
                value={newLangInput}
                onChange={(e) => setNewLangInput(e.target.value)}
                onKeyDown={handleNewLangKeyDown}
                onBlur={handleConfirmLanguage}
                placeholder="Language name…"
              />
            </span>
          ) : (
            <button
              className="lang-add-btn"
              onClick={handleAddLanguageStart}
              title="Add language"
              aria-label="Add language"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="translation-list">
        {entries.length === 0 ? (
          <div className="translations-empty">
            <p>No dialogue nodes yet.</p>
            <p>Switch to the Editor tab and add some nodes to get started.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <TranslationEntry
              key={entry.id}
              entry={entry}
              languages={languages}
              translations={translations}
              onTranslationChange={handleTranslationChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
