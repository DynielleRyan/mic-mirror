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

