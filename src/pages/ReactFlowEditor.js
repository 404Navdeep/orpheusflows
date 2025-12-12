import React, { useState, useEffect, useRef } from "react";
import "../styles/ReactFlowEditor.css";
import Sidebar from "../components/Sidebar";
import DynamicNode from "../components/DynamicNode";
import DynamicFormModal from "../components/DynamicFormModal";
import nodeDefinitions from "../data/nodeDefinitions.json";

function ReactFlowEditor({ user, onBack }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [draggedFromSidebar, setDraggedFromSidebar] = useState(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const savedWorkflow = localStorage.getItem("workflow");
    if (savedWorkflow) {
      try {
        const { nodes: savedNodes, edges: savedEdges } =
          JSON.parse(savedWorkflow);
        setNodes(
          savedNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onEdit: () => handleNodeEdit(node.id),
            },
          }))
        );
        setEdges(savedEdges);
      } catch (err) {
        console.error("Error loading workflow:", err);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && connectingFrom) {
        setConnectingFrom(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [connectingFrom]);

  const hasTrigger = nodes.some((node) => {
    const def = nodeDefinitions.triggers.find(
      (t) => t.id === node.data.definitionId
    );
    return !!def;
  });

  const handleSidebarDragStart = (e, node) => {
    setDraggedFromSidebar(node);
  };

  const handleDragOverCanvas = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (canvasRef.current) {
      setMousePos({
        x: e.clientX - canvasRef.current.getBoundingClientRect().left,
        y: e.clientY - canvasRef.current.getBoundingClientRect().top,
      });
    }
  };

  const handleDropCanvas = (e) => {
    e.preventDefault();
    if (!draggedFromSidebar) return;

    const isTrigger = nodeDefinitions.triggers.find(
      (t) => t.id === draggedFromSidebar.id
    );
    if (isTrigger && hasTrigger) {
      alert("Only one trigger is allowed per workflow");
      return;
    }

    const bounds = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    };

    const newNodeId = `${draggedFromSidebar.id}_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: "dynamicNode",
      position,
      data: {
        label: draggedFromSidebar.label,
        definitionId: draggedFromSidebar.id,
        values: {},
        onEdit: () => handleNodeEdit(newNodeId),
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setDraggedFromSidebar(null);
  };

  const handleNodeMouseDown = (e, nodeId) => {
    if (e.button === 0) {
      e.preventDefault();
      const node = nodes.find((n) => n.id === nodeId);
      const bounds = canvasRef.current.getBoundingClientRect();
      setDraggedNodeId(nodeId);
      setDragOffset({
        x: e.clientX - bounds.left - node.position.x,
        y: e.clientY - bounds.top - node.position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNodeId && canvasRef.current) {
      const bounds = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - bounds.left - dragOffset.x;
      const y = e.clientY - bounds.top - dragOffset.y;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === draggedNodeId
            ? { ...node, position: { x, y } }
            : node
        )
      );
    }

    if (connectingFrom && canvasRef.current) {
      const bounds = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  const handleNodeEdit = (nodeId) => {
    setSelectedNodeId(nodeId);
    setModalOpen(true);
  };

  const handleModalSave = (formValues) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, values: formValues } }
          : node
      )
    );
  };

  const handleStartConnection = (e, nodeId) => {
    e.stopPropagation();
    // Toggle connection mode - click again to cancel
    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
    } else {
      setConnectingFrom(nodeId);
    }
  };

  const handleEndConnection = (e, targetNodeId) => {
    e.stopPropagation();
    if (!connectingFrom || connectingFrom === targetNodeId) {
      setConnectingFrom(null);
      return;
    }

    const sourceNode = nodes.find((n) => n.id === connectingFrom);
    const targetNode = nodes.find((n) => n.id === targetNodeId);

    const sourceTrigger = nodeDefinitions.triggers.find(
      (t) => t.id === sourceNode?.data.definitionId
    );
    const targetTrigger = nodeDefinitions.triggers.find(
      (t) => t.id === targetNode?.data.definitionId
    );

    // Trigger can only connect to steps
    if (sourceTrigger && targetTrigger) {
      alert("Trigger cannot connect to another trigger");
      setConnectingFrom(null);
      return;
    }

    // Steps cannot connect to triggers
    if (!sourceTrigger && targetTrigger) {
      alert("Steps cannot connect to triggers");
      setConnectingFrom(null);
      return;
    }

    // Only allow one connection from source (linear chain)
    const existingConnection = edges.find(
      (edge) => edge.source === connectingFrom
    );
    if (existingConnection) {
      alert("This node is already connected to another node");
      setConnectingFrom(null);
      return;
    }

    const newEdge = {
      id: `${connectingFrom}-${targetNodeId}`,
      source: connectingFrom,
      target: targetNodeId,
    };
    setEdges((prev) => [...prev, newEdge]);
    setConnectingFrom(null);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const getSelectedNodeData = () => {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const definition =
      nodeDefinitions.triggers.find(
        (t) => t.id === node.data.definitionId
      ) ||
      nodeDefinitions.steps.find((s) => s.id === node.data.definitionId);

    return { node, definition };
  };

  const selectedData = getSelectedNodeData();

  return (
    <div className="reactflow-editor" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <header className="editor-header">
        <div className="header-left-section">
          <button onClick={onBack} className="btn-back">
            ← Back
          </button>
          <h2>Workflow Builder</h2>
        </div>

        <div className="header-actions">
          <button
            onClick={() => {
              const saved = localStorage.getItem("workflow");
              if (saved) window.location.reload();
              else alert("No saved workflow");
            }}
            className="btn-action"
          >
            Load
          </button>
          <button
            onClick={() => {
              const workflow = {
                nodes: nodes.map((n) => ({
                  ...n,
                  data: {
                    label: n.data.label,
                    definitionId: n.data.definitionId,
                    values: n.data.values,
                  },
                })),
                edges,
              };
              localStorage.setItem("workflow", JSON.stringify(workflow));
              alert("Workflow saved!");
            }}
            className="btn-action"
          >
            Save
          </button>
        </div>

        <div className="user-badge">
          <img src={user.avatar} alt={user.name} className="small-avatar" />
          <span>{user.name}</span>
        </div>
      </header>

      <div className="editor-container">
        <Sidebar
          nodeDefinitions={nodeDefinitions}
          hasTrigger={hasTrigger}
          onDragStart={handleSidebarDragStart}
        />

        <div
          ref={canvasRef}
          className="editor-canvas"
          onDragOver={handleDragOverCanvas}
          onDrop={handleDropCanvas}
        >
          {nodes.length === 0 ? (
            <div className="empty-canvas">
              <p>Drag nodes from the sidebar to get started</p>
            </div>
          ) : (
            <>
              <svg className="canvas-svg" width="100%" height="100%">
                {/* Draw edges */}
                {edges.map((edge) => {
                  const source = nodes.find((n) => n.id === edge.source);
                  const target = nodes.find((n) => n.id === edge.target);
                  if (!source || !target) return null;

                  const x1 = source.position.x + 75;
                  const y1 = source.position.y + 60;
                  const x2 = target.position.x + 75;
                  const y2 = target.position.y;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#667eea"
                        strokeWidth="2"
                      />
                      <circle
                        cx={(x1 + x2) / 2}
                        cy={(y1 + y2) / 2}
                        r="8"
                        fill="#667eea"
                        cursor="pointer"
                        onClick={() => handleDeleteEdge(edge.id)}
                        style={{ opacity: 0.7 }}
                      />
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 + 3}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        cursor="pointer"
                        onClick={() => handleDeleteEdge(edge.id)}
                        pointerEvents="none"
                      >
                        ✕
                      </text>
                    </g>
                  );
                })}

                {connectingFrom && (
                  <>
                    {(() => {
                      const source = nodes.find((n) => n.id === connectingFrom);
                      if (!source) return null;
                      const x1 = source.position.x + 75;
                      const y1 = source.position.y + 60;
                      return (
                        <line
                          x1={x1}
                          y1={y1}
                          x2={mousePos.x}
                          y2={mousePos.y}
                          stroke="#667eea"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          pointerEvents="none"
                        />
                      );
                    })()}
                  </>
                )}
              </svg>

              {/* Render nodes */}
              <div className="nodes-container">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`node-wrapper ${
                      selectedNodeId === node.id ? "selected" : ""
                    } ${connectingFrom === node.id ? "connecting" : ""}`}
                    style={{
                      position: "absolute",
                      left: `${node.position.x}px`,
                      top: `${node.position.y}px`,
                      cursor: draggedNodeId === node.id ? "grabbing" : "grab",
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <DynamicNode data={node.data} selected={selectedNodeId === node.id} />

                    {selectedNodeId === node.id && (
                      <>
                        <button
                          className="btn-delete-node"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                        >
                          ✕
                        </button>

                        <button
                          className={`btn-connect-node ${
                            connectingFrom === node.id ? "active" : ""
                          }`}
                          onClick={(e) =>
                            handleStartConnection(e, node.id)
                          }
                          title={
                            connectingFrom === node.id
                              ? "Click again or press Escape to cancel"
                              : "Click to connect to another node"
                          }
                        >
                          {connectingFrom === node.id ? "✕" : "➜"}
                        </button>
                      </>
                    )}

                    {connectingFrom && connectingFrom !== node.id && (
                      <button
                        className="btn-accept-connection"
                        onClick={(e) => handleEndConnection(e, node.id)}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen && selectedData && (
        <DynamicFormModal
          nodeData={selectedData.node.data}
          definition={selectedData.definition}
          onSave={handleModalSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ReactFlowEditor;
