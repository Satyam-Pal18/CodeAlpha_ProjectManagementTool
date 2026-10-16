import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';

export const Navbar = ({ onOpenAuth, onOpenNewProject, theme, toggleTheme, onToggleMobileSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { projects, activeProject, selectProject } = useProject();
  const { searchQuery, setSearchQuery } = useTask();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Mobile Hamburger Menu Button */}
        {isAuthenticated && (
          <button
            className="mobile-menu-btn"
            onClick={onToggleMobileSidebar}
            title="Open Menu"
            aria-label="Toggle navigation menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        )}

        <div className="brand">
          <div className="brand-icon">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <div className="brand-text">
            <span className="brand-name">CyberPulse</span>
            <span className="brand-tag">PMS</span>
          </div>
        </div>

        {/* Project Switcher */}
        {isAuthenticated && (
          <div className="project-selector-container">
            <button
              className="project-selector-btn"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            >
              <span
                className="project-dot"
                style={{ backgroundColor: activeProject?.color || 'var(--primary)' }}
              ></span>
              <span className="project-title-label">
                {activeProject ? activeProject.title : 'Select Project'}
              </span>
              <i className="fa-solid fa-chevron-down dropdown-arrow"></i>
            </button>

            {showProjectDropdown && (
              <div className="project-dropdown-menu">
                <div className="dropdown-header">Projects ({projects.length})</div>
                <div className="dropdown-list">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className={`dropdown-item ${activeProject?.id === p.id ? 'active' : ''}`}
                      onClick={() => {
                        selectProject(p);
                        setShowProjectDropdown(false);
                      }}
                    >
                      <span className="project-dot" style={{ backgroundColor: p.color }}></span>
                      <span className="item-title">{p.title}</span>
                      {activeProject?.id === p.id && (
                        <i className="fa-solid fa-check check-icon"></i>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="dropdown-footer-btn"
                  onClick={() => {
                    setShowProjectDropdown(false);
                    onOpenNewProject();
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Create New Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-center">
        {isAuthenticated && activeProject && (
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search tasks, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Real-time Socket Indicator */}
        <div className="socket-badge" title="Real-time WebSockets Connected">
          <span className="socket-pulse"></span>
          <span className="socket-label">Live Sync</span>
        </div>

        {/* Theme Toggle Button */}
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? (
            <i className="fa-solid fa-sun" style={{ color: '#f59e0b' }}></i>
          ) : (
            <i className="fa-solid fa-moon" style={{ color: 'var(--primary)' }}></i>
          )}
        </button>

        {/* User Auth Profile */}
        {isAuthenticated ? (
          <div className="user-profile-wrapper">
            <button
              className="user-profile-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div className="user-info-text">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <i className="fa-solid fa-chevron-down profile-arrow"></i>
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <strong>{user.name}</strong>
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="user-menu-divider"></div>
                <button
                  className="user-menu-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenNewProject();
                  }}
                >
                  <i className="fa-solid fa-folder-plus"></i> New Project
                </button>
                <button
                  className="user-menu-item logout-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            <i className="fa-solid fa-right-to-bracket"></i> Sign In
          </button>
        )}
      </div>
    </header>
  );
};
