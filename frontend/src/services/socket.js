import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io Client] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 [Socket.io Client] Disconnected');
    });
  }
  return socket;
}

export function joinProjectRoom(projectId) {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('project:join', projectId);
  } else if (s) {
    s.on('connect', () => {
      s.emit('project:join', projectId);
    });
  }
}

export function leaveProjectRoom(projectId) {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('project:leave', projectId);
  }
}
