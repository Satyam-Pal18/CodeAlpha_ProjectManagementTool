import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { NewTaskModal } from './components/NewTaskModal';
import { ProjectModal } from './components/ProjectModal';
import { AddMemberModal } from './components/AddMemberModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useProject } from './context/ProjectContext';

export function App() {
  const { isAuthenticated } = useAuth();
  const { activeProject } = useProject();

  const [theme, setTheme] = useState(() => localStorage.getItem('pms_theme') || 'dark');
  const [currentView, setCurrentView] = useState('board'); // 'board' | 'list' | 'analytics'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState('todo');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pms_theme', theme);
  }, [theme]);

    useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenNewTask = (status = 'todo') => {
    setNewTaskInitialStatus(status);
    setShowNewTaskModal(true);
  };

  return (
    <div className="app-layout">
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenNewProject={() => setShowProjectModal(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />

      <div className="main-content-layout">
        {/* Backdrop for mobile drawer */}
        {mobileSidebarOpen && (
          <div
            className="sidebar-backdrop active"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}

        <Sidebar
          currentView={currentView}
          setCurrentView={(view) => {
            setCurrentView(view);
            setMobileSidebarOpen(false);
          }}
          onOpenAddMember={() => {
            setShowAddMemberModal(true);
            setMobileSidebarOpen(false);
          }}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="app-main-viewport">
          {currentView === 'board' && (
            <KanbanBoard onOpenNewTask={handleOpenNewTask} />
          )}

          {currentView === 'list' && (
            <ListView onOpenNewTask={() => handleOpenNewTask('todo')} />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal />

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        initialStatus={newTaskInitialStatus}
      />

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;
