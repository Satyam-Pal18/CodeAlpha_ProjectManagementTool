import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';

import './styles/theme.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
