import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type OnConnect,
  type Edge,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DialogueNode as DialogueNodeComponent } from "./components/DialogueNode";
import { Toolbar } from "./components/Toolbar";
import { TranslationsTab } from "./components/TranslationsTab";
import type { DialogueNode, Languages, Translations } from "./types";

function createNode(position: { x: number; y: number }): DialogueNode {
  return {
    id: crypto.randomUUID(),
    type: "dialogue",
    position,
    data: {
      text: "",
      dialogueType: "plain",
      choices: [{ id: crypto.randomUUID(), text: "" }],
    },
  };
}

interface DialogueEditorProps {
  nodes: DialogueNode[];
  edges: Edge[];
  onNodesChange: ReturnType<typeof useNodesState<DialogueNode>>[2];
  onEdgesChange: ReturnType<typeof useEdgesState<Edge>>[2];
  setNodes: ReturnType<typeof useNodesState<DialogueNode>>[1];
  setEdges: ReturnType<typeof useEdgesState<Edge>>[1];
}

function DialogueEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
}: DialogueEditorProps) {
  const nodeCountRef = useRef(0);
  const { screenToFlowPosition } = useReactFlow();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    flowX: number;
    flowY: number;
  } | null>(null);

  const nodeTypes = useMemo(() => ({ dialogue: DialogueNodeComponent }), []);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const targetId = connection.target ?? "";
        const sourceHandle = connection.sourceHandle ?? null;
        // Remove existing incoming edge to target, and any existing outgoing from same handle
        const withoutConflicts = eds.filter(
          (e) =>
            e.target !== targetId &&
            !(
              e.source === connection.source &&
              (e.sourceHandle ?? null) === sourceHandle
            ),
        );
        return addEdge(connection, withoutConflicts);
      });
    },
    [setEdges],
  );

  const onPaneContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition],
  );

  const handleAddNodeAtPosition = useCallback(
    (flowX: number, flowY: number) => {
      nodeCountRef.current += 1;
      const newNode = createNode({ x: flowX, y: flowY });
      setNodes((nds) => [...nds, newNode]);
      setContextMenu(null);
    },
    [setNodes],
  );

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu]);

  const isValidConnection = useCallback(
    (connection: { source: string | null; target: string | null }) =>
      connection.source !== connection.target,
    [],
  );

  return (
    <div className="canvas-wrapper">
      <ReactFlow<DialogueNode, Edge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        fitView
        deleteKeyCode="Delete"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="context-menu-item"
            onClick={() =>
              handleAddNodeAtPosition(contextMenu.flowX, contextMenu.flowY)
            }
          >
            Add Node
          </button>
        </div>
      )}
    </div>
  );
}

function AppInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<DialogueNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "translations">(
    "editor",
  );
  const [languages, setLanguages] = useState<Languages>([]);
  const [translations, setTranslations] = useState<Translations>({});

  const handleImport = useCallback(
    (
      importedNodes: DialogueNode[],
      importedEdges: Edge[],
      importedLanguages: Languages,
      importedTranslations: Translations,
    ) => {
      setNodes(importedNodes);
      setEdges(importedEdges);
      setLanguages(importedLanguages);
      setTranslations(importedTranslations);
    },
    [setNodes, setEdges, setLanguages, setTranslations],
  );

  return (
    <div className="editor-container">
      <Toolbar
        nodes={nodes as DialogueNode[]}
        edges={edges}
        languages={languages}
        translations={translations}
        onImport={handleImport}
      />
      <div className="tab-bar">
        <button
          className={`tab-btn${activeTab === "editor" ? " tab-btn--active" : ""}`}
          onClick={() => setActiveTab("editor")}
        >
          Editor
        </button>
        <button
          className={`tab-btn${activeTab === "translations" ? " tab-btn--active" : ""}`}
          onClick={() => setActiveTab("translations")}
        >
          Translations
        </button>
      </div>
      {activeTab === "editor" ? (
        <DialogueEditor
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      ) : (
        <TranslationsTab
          nodes={nodes as DialogueNode[]}
          languages={languages}
          translations={translations}
          onLanguagesChange={setLanguages}
          onTranslationsChange={setTranslations}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}
