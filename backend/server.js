const express = require("express");
const cors = require("cors");
const { WebClient } = require("@slack/web-api");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { slackId } = req.body;

    if (!slackId) {
      return res.status(400).json({ message: "Slack ID is required" });
    }

    const otp = generateOTP();

    otpStore.set(slackId, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    try {
      const userInfo = await slack.users.info({ user: slackId });
      
      await slack.chat.postMessage({
        channel: slackId,
        text: `Your OrpheusFlows login OTP is: *${otp}*\n\nThis code expires in 5 minutes.`,
      });

      res.json({
        success: true,
        message: "OTP sent to your Slack DM",
      });
    } catch (slackError) {
      console.error("Slack error:", slackError);
      res.status(400).json({
        message: "Could not find Slack user or send message",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { slackId, otp } = req.body;

    if (!slackId || !otp) {
      return res
        .status(400)
        .json({ message: "Slack ID and OTP are required" });
    }

    const storedData = otpStore.get(slackId);

    if (!storedData) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(slackId);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const userInfo = await slack.users.info({ user: slackId });
    const user = userInfo.user;

    otpStore.delete(slackId);

    const token = Buffer.from(slackId + Date.now()).toString("base64");

    res.json({
      token,
      slackId: user.id,
      name: user.real_name || user.name,
      avatar: user.profile?.image_512 || user.profile?.image_192,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
