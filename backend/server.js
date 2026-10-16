const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { initDatabase } = require('./config/db');
const { initSocketServer } = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// 1. Initialize WebSockets (Socket.io)
initSocketServer(server);

// 2. Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'CodeAlpha Project Management Tool',
    database: 'MySQL (codealpha_project_management_db)',
    websockets: 'Active',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if in production
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) res.status(200).send('Project Management API Server is running. Access frontend on http://localhost:5173');
    });
  } else {
    next();
  }
});

// Global Error Handler
app.use(errorHandler);

// 4. Initialize Database and Start Server
initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log('================================================================');
      console.log(`🚀 CodeAlpha Project Management Tool Server is running!`);
      console.log(`🌐 Backend API:  http://localhost:${PORT}`);
      console.log(`⚡ WebSockets:   ws://localhost:${PORT} (Socket.io Active)`);
      console.log(`🗄️  Database:     MySQL Connected successfully`);
      console.log('================================================================');
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server due to Database error:', err.message);
    process.exit(1);
  });
