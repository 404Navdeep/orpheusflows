import React, { useState } from "react";
import "../styles/Dashboard.css";
import ReactFlowEditor from "./ReactFlowEditor";

function Dashboard({ user, onLogout }) {
  const [showReactFlow, setShowReactFlow] = useState(false);

  if (showReactFlow) {
    return (
      <ReactFlowEditor
        user={user}
        onBack={() => setShowReactFlow(false)}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Orpheusflows</h1>
        </div>

        <div className="header-right">
          <div className="user-info">
            <img
              src={user.avatar}
              alt={user.name}
              className="avatar"
            />
            <div className="user-details">
              <p className="user-name">{user.name}</p>
              <p className="user-id">{user.slackId}</p>
            </div>
          </div>

          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome, {user.name}!</h2>
          <p>Ready to create your workflow?</p>
        </div>

        <button
          onClick={() => setShowReactFlow(true)}
          className="btn-react-flow"
        >
          Create Workflow
        </button>
      </main>
    </div>
  );
}

export default Dashboard;
