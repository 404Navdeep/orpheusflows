import React from "react";
import "../styles/Sidebar.css";

function Sidebar({ nodeDefinitions, hasTrigger, onDragStart }) {
  const nodesToShow = hasTrigger
    ? nodeDefinitions.steps
    : nodeDefinitions.triggers;

  const sidebarTitle = hasTrigger ? "Steps" : "Triggers";

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">{sidebarTitle}</h3>
      <p className="sidebar-subtitle">
        {hasTrigger
          ? "Drag steps to add them to your workflow"
          : "Drag a trigger to start your workflow"}
      </p>

      <div className="node-list">
        {nodesToShow.map((node) => (
          <div
            key={node.id}
            className="node-item"
            draggable
            onDragStart={(e) => onDragStart(e, node)}
          >
            <div className="node-item-header">
              <span className="node-item-label">{node.label}</span>
              {!hasTrigger && <span className="trigger-badge">Trigger</span>}
            </div>
            <p className="node-item-description">{node.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
