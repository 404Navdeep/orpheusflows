import React from "react";
import "../styles/DynamicNode.css";

function DynamicNode({ data, selected }) {
  const handleEditClick = () => {
    if (data.onEdit) {
      data.onEdit();
    }
  };

  return (
    <div className={`dynamic-node ${selected ? "selected" : ""}`}>
      <div className="node-content">
        <div className="node-label">{data.label}</div>
        <button onClick={handleEditClick} className="btn-edit">
Settings        
        </button>
      </div>
    </div>
  );
}

export default DynamicNode;
