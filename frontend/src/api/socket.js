import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: true });
  }
  return socket;
}

export function useSocket(event, callback) {
  const s = getSocket();
  s.on(event, callback);
  return () => s.off(event, callback);
}
