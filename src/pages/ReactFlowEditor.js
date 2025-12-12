import React from "react";
import "../styles/ReactFlowEditor.css";

function ReactFlowEditor({ user, onBack }) {
  return (
    <div className="reactflow-editor">
      <header className="editor-header">
        <button onClick={onBack} className="btn-back">
          ← Back
        </button>
        <h2>React Flow Editor</h2>
        <div className="user-badge">
          <img src={user.avatar} alt={user.name} className="small-avatar" />
          <span>{user.name}</span>
        </div>
      </header>

      <div className="editor-container">
        <div className="editor-canvas">
          <p>React Flow canvas placeholder</p>
          <p>Install reactflow: npm install reactflow</p>
        </div>

        <div className="editor-sidebar">
          <h3>Nodes</h3>
          <p>Add nodes here</p>
        </div>
      </div>
    </div>
  );
}

export default ReactFlowEditor;
