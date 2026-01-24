// src/services/socket.js
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create single shared socket instance
const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  autoConnect: false // Don't auto-connect, we'll connect when authenticated
});

// Function to authenticate socket with token
export const authenticateSocket = (token) => {
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

// Function to disconnect socket
export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
