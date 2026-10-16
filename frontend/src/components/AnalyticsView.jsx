import React from 'react';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext';

export const AnalyticsView = () => {
  const { tasks } = useTask();
  const { activeProject } = useProject();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const backlog = tasks.filter((t) => t.status === 'backlog').length;

  const urgent = tasks.filter((t) => t.priority === 'urgent').length;
  const high = tasks.filter((t) => t.priority === 'high').length;
  const medium = tasks.filter((t) => t.priority === 'medium').length;
  const low = tasks.filter((t) => t.priority === 'low').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Workload per member
  const memberWorkload = {};
  if (activeProject && activeProject.members) {
    activeProject.members.forEach((m) => {
      memberWorkload[m.id] = { name: m.name, avatar: m.avatar, count: 0, done: 0 };
    });
  }
  tasks.forEach((t) => {
    if (t.assigned_to && memberWorkload[t.assigned_to]) {
      memberWorkload[t.assigned_to].count += 1;
      if (t.status === 'done') memberWorkload[t.assigned_to].done += 1;
    }
  });

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h3>Project Health & Analytics</h3>
          <p>Real-time performance metrics and team velocity for {activeProject?.title}</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Tasks</span>
            <h2 className="metric-value">{total}</h2>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-done)' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="metric-details">
            <span className="metric-label">Completed</span>
            <h2 className="metric-value">{completed}</h2>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-in-progress)' }}>
            <i className="fa-solid fa-spinner fa-spin-pulse"></i>
          </div>
          <div className="metric-details">
            <span className="metric-label">In Progress</span>
            <h2 className="metric-value">{inProgress}</h2>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'var(--crimson-subtle)', color: 'var(--crimson)' }}>
            <i className="fa-solid fa-fire"></i>
          </div>
          <div className="metric-details">
            <span className="metric-label">Urgent Priority</span>
            <h2 className="metric-value">{urgent}</h2>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown */}
      <div className="analytics-details-grid">
        {/* Completion Progress Gauge */}
        <div className="analytics-panel">
          <h4 className="panel-title">
            <i className="fa-solid fa-gauge-high"></i> Completion Rate
          </h4>
          <div className="completion-gauge-box">
            <div className="gauge-number">{completionRate}%</div>
            <p className="gauge-subtext">Overall Sprint Progress</p>
            <div className="gauge-bar-track">
              <div className="gauge-bar-fill" style={{ width: `${completionRate}%` }}></div>
            </div>
            <div className="gauge-stats-row">
              <span>{completed} tasks finished</span>
              <span>{total - completed} remaining</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="analytics-panel">
          <h4 className="panel-title">
            <i className="fa-solid fa-bars-progress"></i> Status Distribution
          </h4>
          <div className="distribution-list">
            <div className="dist-item">
              <div className="dist-label-row">
                <span>Completed</span>
                <strong>{completed} ({total > 0 ? Math.round((completed / total) * 100) : 0}%)</strong>
              </div>
              <div className="dist-bar"><div className="dist-fill" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%`, background: 'var(--status-done)' }}></div></div>
            </div>

            <div className="dist-item">
              <div className="dist-label-row">
                <span>In Review</span>
                <strong>{review} ({total > 0 ? Math.round((review / total) * 100) : 0}%)</strong>
              </div>
              <div className="dist-bar"><div className="dist-fill" style={{ width: `${total > 0 ? (review / total) * 100 : 0}%`, background: 'var(--status-review)' }}></div></div>
            </div>

            <div className="dist-item">
              <div className="dist-label-row">
                <span>In Progress</span>
                <strong>{inProgress} ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)</strong>
              </div>
              <div className="dist-bar"><div className="dist-fill" style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%`, background: 'var(--status-in-progress)' }}></div></div>
            </div>

            <div className="dist-item">
              <div className="dist-label-row">
                <span>To Do</span>
                <strong>{todo} ({total > 0 ? Math.round((todo / total) * 100) : 0}%)</strong>
              </div>
              <div className="dist-bar"><div className="dist-fill" style={{ width: `${total > 0 ? (todo / total) * 100 : 0}%`, background: 'var(--status-todo)' }}></div></div>
            </div>

            <div className="dist-item">
              <div className="dist-label-row">
                <span>Backlog</span>
                <strong>{backlog} ({total > 0 ? Math.round((backlog / total) * 100) : 0}%)</strong>
              </div>
              <div className="dist-bar"><div className="dist-fill" style={{ width: `${total > 0 ? (backlog / total) * 100 : 0}%`, background: 'var(--status-backlog)' }}></div></div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="analytics-panel">
          <h4 className="panel-title">
            <i className="fa-solid fa-triangle-exclamation"></i> Tasks by Priority
          </h4>
          <div className="priority-stats-grid">
            <div className="priority-stat-box box-urgent">
              <span className="p-count">{urgent}</span>
              <span className="p-title">Urgent</span>
            </div>
            <div className="priority-stat-box box-high">
              <span className="p-count">{high}</span>
              <span className="p-title">High</span>
            </div>
            <div className="priority-stat-box box-medium">
              <span className="p-count">{medium}</span>
              <span className="p-title">Medium</span>
            </div>
            <div className="priority-stat-box box-low">
              <span className="p-count">{low}</span>
              <span className="p-title">Low</span>
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="analytics-panel">
          <h4 className="panel-title">
            <i className="fa-solid fa-users"></i> Team Workload
          </h4>
          <div className="workload-list">
            {Object.values(memberWorkload).map((m, idx) => (
              <div key={idx} className="workload-row">
                <img src={m.avatar} alt={m.name} className="workload-avatar" />
                <div className="workload-info">
                  <div className="workload-name-row">
                    <span className="workload-name">{m.name}</span>
                    <span className="workload-numbers">{m.done}/{m.count} done</span>
                  </div>
                  <div className="workload-track">
                    <div
                      className="workload-fill"
                      style={{ width: `${m.count > 0 ? (m.done / m.count) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
