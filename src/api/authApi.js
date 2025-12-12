
export const sendOTP = async (slackId) => {
  const response = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slackId }),
  });
  return response.json();
};

export const verifyOTP = async (slackId, otp) => {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slackId, otp }),
  });
  return response.json();
};
