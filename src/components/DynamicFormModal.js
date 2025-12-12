import React, { useState } from "react";
import "../styles/DynamicFormModal.css";

function DynamicFormModal({ nodeData, definition, onSave, onClose }) {
  const [formValues, setFormValues] = useState(nodeData.values || {});

  const handleInputChange = (fieldId, value) => {
    setFormValues({
      ...formValues,
      [fieldId]: value,
    });
  };

  const handleSave = () => {
    onSave(formValues);
    onClose();
  };

  if (!definition) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{definition.label}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {definition.fields && definition.fields.length > 0 ? (
            definition.fields.map((field) => (
              <div key={field.id} className="form-field">
                <label htmlFor={field.id}>{field.label}</label>

                {field.type === "text" && (
                  <input
                    id={field.id}
                    type="text"
                    value={formValues[field.id] || field.defaultValue || ""}
                    onChange={(e) =>
                      handleInputChange(field.id, e.target.value)
                    }
                    disabled={field.isReadOnly}
                    placeholder={field.placeholder}
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    id={field.id}
                    value={formValues[field.id] || ""}
                    onChange={(e) =>
                      handleInputChange(field.id, e.target.value)
                    }
                    rows="4"
                  />
                )}

                {field.type === "select" && (
                  <select
                    id={field.id}
                    value={formValues[field.id] || ""}
                    onChange={(e) =>
                      handleInputChange(field.id, e.target.value)
                    }
                  >
                    <option value="">-- Select {field.label} --</option>
                    {field.options &&
                      field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            ))
          ) : (
            <p className="no-fields">No fields to configure</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default DynamicFormModal;
