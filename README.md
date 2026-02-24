# Mic Mirror
Need to test your devices for an important meeting? MicMirror's got you covered!
## Features

- **Device detection** – Lists all connected microphones and cameras
- **Microphone testing** – Select a mic, see live waveform, hear yourself
- **Output device selection** – Choose speakers/headphones for playback
- **Camera preview** – Toggle camera on/off to see yourself
- **Audio recording** – Record and download short clips
- **Light/dark mode** – Theme toggle with persistence
- **Mobile-first** – Responsive design optimized for phones and tablets

## Tech Stack

- **MERN** – MongoDB, Express, React, Node.js (TypeScript)
- **Tailwind CSS** – Styling
- **shadcn/ui** – UI components

## Setup

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

## Development

```bash
# From project root - runs both server and client
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:5000

For client-only development (media APIs work in browser):

```bash
cd client && npm run dev
```

## Production Build & Deploy

Single deployment—one build, one server:

```bash
npm run build
npm start
```

Builds the client, bundles it into the server, and serves everything from one process. Deploy the entire project; the server serves the React app at `/` and the API at `/api/health`.

## Deployment (Railway, Render, etc.)

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Root directory:** project root

Set `PORT` in your platform's environment if needed.

## Environment

- `PORT` – Server port (default: 5000)
- `MONGODB_URI` – Optional MongoDB connection string (app works without it)

## Browser Support

Requires a modern browser with:
- `navigator.mediaDevices.getUserMedia`
- `navigator.mediaDevices.enumerateDevices`
- `MediaRecorder` API

**HTTPS or localhost required** for media device access.

## License

© Dynielle Ryan. All rights reserved.
