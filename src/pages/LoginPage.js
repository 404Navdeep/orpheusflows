import React, { useState } from "react";
import "../styles/LoginPage.css";

function LoginPage({ onLoginSuccess }) {
  const [step, setStep] = useState("slack-id"); // slack-id, otp
  const [slackId, setSlackId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSlackIdSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // send OTP
      const response = await fetch("http://OrphuesOTP.navdeep.hackclub.app/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slackId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setStep("otp");
    } catch (err) {
      setError("Error connecting to server. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // verify OTP
      const response = await fetch("http://OrphuesOTP.navdeep.hackclub.app/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slackId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      // login done
      onLoginSuccess({
        slackId: data.slackId,
        name: data.name,
        avatar: data.avatar,
        token: data.token,
      });
    } catch (err) {
      setError("Error verifying OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("slack-id");
    setOtp("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Orpheusflows</h1>
          <p>Authenticate with Slack OTP</p>
        </div>

        {step === "slack-id" && (
          <form onSubmit={handleSlackIdSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="slack-id">Slack ID</label>
              <input
                id="slack-id" type="text" placeholder="Enter your Slack ID" value={slackId} onChange={(e) => setSlackId(e.target.value)} required disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <p className="otp-hint">Check your Slack DM for the OTP</p>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength="6"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="btn-secondary"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
