# Orpheusflows

A React app with Slack OTP authentication and ReactFlow integration.

## Features

- 🔐 Slack ID + OTP Authentication
- 👤 User profile with avatar display
- ⚡ React Flow integration for creating workflows
- 📱 Responsive design

## Project Structure

```
Orpheusflows/
├── src/
│   ├── pages/
│   │   ├── LoginPage.js      # Slack OTP login UI
│   │   └── Dashboard.js      # Main dashboard with user info
│   ├── styles/
│   │   ├── LoginPage.css
│   │   └── Dashboard.css
│   ├── api/
│   │   └── authApi.js        # API client functions
│   ├── App.js                # Main app component
│   └── index.js
├── backend/
│   ├── server.js             # Express server with Slack auth
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup

### Frontend

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Add your Slack bot token:
   - Go to https://api.slack.com/apps
   - Create new app or select existing
   - Go to OAuth & Permissions
   - Copy your Bot User OAuth Token
   - Add it to `.env` as `SLACK_BOT_TOKEN`

5. Start the server:
```bash
npm run dev  # with nodemon for auto-reload
# or
npm start    # production
```

Server will run on `http://localhost:5000`

## Authentication Flow

1. User enters their Slack ID
2. Click "Send OTP"
3. Bot sends OTP via Slack DM (expires in 5 minutes)
4. User enters OTP in the app
5. App verifies OTP and logs user in
6. User sees their profile (name + avatar) in header
7. Button available to create React Flow

## Environment Variables

### Frontend
- No additional env vars needed (uses backend at http://localhost:5000)

### Backend
- `SLACK_BOT_TOKEN` - Your Slack bot's OAuth token
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Slack App Configuration

Your Slack app needs these permissions:
- `users:read` - To get user info
- `users:read.email` - To get user email (optional)
- `chat:write` - To send messages

## Next Steps

- [ ] Integrate ReactFlow library for workflow editor
- [ ] Add database for storing flows
- [ ] Implement flow execution
- [ ] Add user preferences/settings
- [ ] Deploy to production

## Tech Stack

- **Frontend**: React 19, CSS3
- **Backend**: Express.js, @slack/web-api
- **Auth**: Slack OTP
- **Future**: ReactFlow for workflow visualization
