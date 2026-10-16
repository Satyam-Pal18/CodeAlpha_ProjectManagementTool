const { Server } = require('socket.io');

let io = null;

function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ [WebSocket] Client connected: ${socket.id}`);

    // Join Project Room for focused real-time updates
    socket.on('project:join', (projectId) => {
      const room = `project:${projectId}`;
      socket.join(room);
      console.log(`🔌 [WebSocket] Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('project:leave', (projectId) => {
      const room = `project:${projectId}`;
      socket.leave(room);
      console.log(`👋 [WebSocket] Socket ${socket.id} left room: ${room}`);
    });

    // Real-time cursor/user active indicator
    socket.on('user:active', (data) => {
      if (data && data.projectId) {
        socket.to(`project:${data.projectId}`).emit('user:active_peer', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocketServer,
  getIO
};
