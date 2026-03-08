# Chat Flow Frontend

React + Vite frontend for the Chat Flow app (authentication, chat, stories, and real-time updates via Socket.IO).

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Socket.IO Client
- Styled Components
- Framer Motion

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Running backend server

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the frontend root:

```env
VITE_BACKEND_URL=http://localhost:5000
```

3. Start development server:

```bash
npm run dev
```

App runs on the Vite default URL (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```text
src/
  Components/      # Auth, chat, and UI components
  context/         # Auth and socket providers
  pages/           # Page-level screens (Chat, Home)
  services/        # API + socket setup
  theme/           # Global styles and theme tokens
  utils/           # Validation/helpers
```

## API and Socket Configuration

- REST API base URL is configured in `src/services/api.js`.
- Socket connection URL is configured in `src/services/socket.js`.
- Both use `VITE_BACKEND_URL` and fallback to `http://localhost:5000`.
