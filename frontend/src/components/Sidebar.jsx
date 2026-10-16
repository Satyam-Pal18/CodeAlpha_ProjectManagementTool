import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';

export const Sidebar = ({ currentView, setCurrentView, onOpenAddMember, mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const { tasks, priorityFilter, setPriorityFilter, assigneeFilter, setAssigneeFilter } = useTask();

  const [collapsed, setCollapsed] = useState(false);

  if (!activeProject) return null;

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleViewClick = (view) => {
    setCurrentView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={'sidebar ' + (collapsed ? 'collapsed' : '') + ' ' + (mobileOpen ? 'mobile-open' : '')}>
      {/* Mobile-only Full-screen Drawer Header */}
      <div className="mobile-drawer-header mobile-only">
        <div className="drawer-brand">
          <div className="brand-icon">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <div className="drawer-brand-text">
            <span className="brand-name">CyberPulse</span>
            <div className="drawer-project-subtitle">
              <span className="project-dot" style={{ backgroundColor: activeProject.color || 'var(--primary)' }}></span>
              <span className="project-title-sub">{activeProject.title}</span>
            </div>
          </div>
        </div>
        <button
          className="mobile-close-btn"
          onClick={onCloseMobile}
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <i className="fa-solid fa-xmark"></i>
          <span className="close-text">Close</span>
        </button>
      </div>

      {/* Desktop-only Collapse Toggle */}
      <div className="sidebar-toggle-row desktop-only">
        <span className="sidebar-section-title">Views & Workspaces</span>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <i className={'fa-solid ' + (collapsed ? 'fa-angles-right' : 'fa-angles-left')}></i>
        </button>
      </div>

      {/* Navigation View Switcher */}
      <nav className="view-nav">
        <button
          className={'view-nav-btn ' + (currentView === 'board' ? 'active' : '')}
          onClick={() => handleViewClick('board')}
        >
          <i className="fa-solid fa-table-columns"></i>
          <span>Kanban Board</span>
          <span className="nav-badge">{tasks.length}</span>
        </button>

        <button
          className={'view-nav-btn ' + (currentView === 'list' ? 'active' : '')}
          onClick={() => handleViewClick('list')}
        >
          <i className="fa-solid fa-list-check"></i>
          <span>List Table</span>
        </button>

        <button
          className={'view-nav-btn ' + (currentView === 'analytics' ? 'active' : '')}
          onClick={() => handleViewClick('analytics')}
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Project Analytics</span>
        </button>
      </nav>

      {/* Project Health Progress */}
      <div className="project-progress-card">
        <div className="progress-card-header">
          <span>Project Progress</span>
          <strong className="progress-percent">{progressPercent}%</strong>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: progressPercent + '%' }}
          ></div>
        </div>
        <div className="progress-card-footer">
          <span>{completedCount} of {tasks.length} tasks done</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* Priority Filters */}
      <div className="filter-group">
        <span className="sidebar-section-title">Priority Filter</span>
        <div className="filter-chips">
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={'filter-chip chip-' + p + ' ' + (priorityFilter === p ? 'active' : '')}
              onClick={() => {
                setPriorityFilter(p);
                if (onCloseMobile) onCloseMobile();
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assignee Filter */}
      <div className="filter-group">
        <span className="sidebar-section-title">Assigned To</span>
        <div className="filter-chips">
          <button
            className={'filter-chip ' + (assigneeFilter === 'all' ? 'active' : '')}
            onClick={() => {
              setAssigneeFilter('all');
              if (onCloseMobile) onCloseMobile();
            }}
          >
            All
          </button>
          {user && (
            <button
              className={'filter-chip ' + (String(assigneeFilter) === String(user.id) ? 'active' : '')}
              onClick={() => {
                setAssigneeFilter(String(user.id));
                if (onCloseMobile) onCloseMobile();
              }}
            >
              Me
            </button>
          )}
          <button
            className={'filter-chip ' + (assigneeFilter === 'unassigned' ? 'active' : '')}
            onClick={() => {
              setAssigneeFilter('unassigned');
              if (onCloseMobile) onCloseMobile();
            }}
          >
            Unassigned
          </button>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* Team Members Section */}
      <div className="team-section">
        <div className="team-header">
          <span className="sidebar-section-title">Team Members ({activeProject.members?.length || 0})</span>
          <button
            className="add-member-mini-btn"
            onClick={() => {
              onOpenAddMember();
              if (onCloseMobile) onCloseMobile();
            }}
            title="Add Member"
          >
            <i className="fa-solid fa-user-plus"></i>
          </button>
        </div>

        <div className="team-members-list">
          {activeProject.members?.map((m) => (
            <div key={m.id} className="team-member-item">
              <img src={m.avatar} alt={m.name} className="member-avatar" />
              <div className="member-info">
                <span className="member-name">{m.name}</span>
                <span className="member-role">{m.project_role || m.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-only Bottom Return Button */}
      <div className="mobile-drawer-footer mobile-only">
        <button className="btn-secondary full-btn" onClick={onCloseMobile}>
          <i className="fa-solid fa-arrow-left"></i> Return to Board
        </button>
      </div>
    </aside>
  );
};
