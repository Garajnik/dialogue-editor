import { useCallback } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import type { DialogueNode as DialogueNodeType, DialogueNodeData, DialogueNodeType as DType } from '../types';

export function DialogueNode({ id, data }: NodeProps<DialogueNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow();

  const { text, dialogueType, choices } = data as DialogueNodeData;

  const updateField = useCallback(
    (updates: Partial<DialogueNodeData>) => {
      updateNodeData(id, updates);
    },
    [id, updateNodeData],
  );

  const handleTypeChange = useCallback(
    (newType: DType) => {
      updateField({ dialogueType: newType });
    },
    [updateField],
  );

  const addChoice = useCallback(() => {
    updateField({
      choices: [...choices, { id: crypto.randomUUID(), text: '' }],
    });
  }, [choices, updateField]);

  const removeChoice = useCallback(
    (choiceId: string) => {
      if (choices.length <= 1) return;
      updateField({ choices: choices.filter((c) => c.id !== choiceId) });
    },
    [choices, updateField],
  );

  const updateChoiceText = useCallback(
    (choiceId: string, newText: string) => {
      updateField({
        choices: choices.map((c) =>
          c.id === choiceId ? { ...c, text: newText } : c,
        ),
      });
    },
    [choices, updateField],
  );

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    <div className="dialogue-node">
      <Handle type="target" position={Position.Left} id="target" />

      <div className="dialogue-node-header">
        <span className="dialogue-node-title">Dialogue</span>
        <button
          className="dialogue-node-delete"
          onClick={handleDelete}
          title="Delete node"
        >
          ×
        </button>
      </div>

      <div className="dialogue-node-body">
        <label className="dialogue-node-label">NPC Text</label>
        <textarea
          className="dialogue-node-textarea nodrag nowheel"
          value={text}
          onChange={(e) => updateField({ text: e.target.value })}
          placeholder="Enter NPC dialogue..."
          rows={3}
        />

        <label className="dialogue-node-label">Type</label>
        <select
          className="dialogue-node-select nodrag"
          value={dialogueType}
          onChange={(e) => handleTypeChange(e.target.value as DType)}
        >
          <option value="plain">Plain Text</option>
          <option value="choice">Multiple Choice</option>
        </select>

        {dialogueType === 'choice' && (
          <div className="dialogue-node-choices">
            <label className="dialogue-node-label">Response Options</label>
            {choices.map((choice, index) => (
              <div key={choice.id} className="dialogue-node-choice">
                <input
                  className="dialogue-node-input nodrag nowheel"
                  type="text"
                  value={choice.text}
                  onChange={(e) => updateChoiceText(choice.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  className="dialogue-node-choice-remove"
                  onClick={() => removeChoice(choice.id)}
                  title="Remove option"
                  disabled={choices.length <= 1}
                >
                  −
                </button>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={choice.id}
                />
              </div>
            ))}
            <button className="dialogue-node-add-choice" onClick={addChoice}>
              + Add Option
            </button>
          </div>
        )}
      </div>

      {dialogueType === 'plain' && (
        <Handle type="source" position={Position.Right} id="source" />
      )}
    </div>
  );
}
