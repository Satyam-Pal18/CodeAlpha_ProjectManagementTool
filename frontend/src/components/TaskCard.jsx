import React from 'react';
import { useTask } from '../context/TaskContext';

const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'review', 'done'];

export const TaskCard = ({ task }) => {
  const { openTaskModal, moveTaskStatus } = useTask();

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const currentIdx = STATUS_ORDER.indexOf(task.status);

  const movePrev = (e) => {
    e.stopPropagation();
    if (currentIdx > 0) {
      moveTaskStatus(task.id, STATUS_ORDER[currentIdx - 1]);
    }
  };

  const moveNext = (e) => {
    e.stopPropagation();
    if (currentIdx < STATUS_ORDER.length - 1) {
      moveTaskStatus(task.id, STATUS_ORDER[currentIdx + 1]);
    }
  };

  // Check if overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div
      className={`task-card priority-border-${task.priority}`}
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => openTaskModal(task)}
    >
      <div className="task-card-header">
        <span className={`priority-badge badge-${task.priority}`}>
          <i className="fa-solid fa-circle-dot"></i>
          {task.priority.toUpperCase()}
        </span>

        {/* Quick Shift buttons for mobile or instant click move */}
        <div className="card-quick-actions">
          {currentIdx > 0 && (
            <button className="move-arrow-btn" onClick={movePrev} title="Move Left">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}
          {currentIdx < STATUS_ORDER.length - 1 && (
            <button className="move-arrow-btn" onClick={moveNext} title="Move Right">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="footer-left">
          {task.due_date && (
            <span className={`due-date-badge ${isOverdue ? 'overdue' : ''}`}>
              <i className="fa-regular fa-calendar"></i>
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}

          {task.comment_count > 0 && (
            <span className="comments-badge">
              <i className="fa-regular fa-comment-dots"></i>
              {task.comment_count}
            </span>
          )}
        </div>

        <div className="footer-right">
          {task.assignee_name ? (
            <div className="assignee-avatar-wrapper" title={`Assigned to ${task.assignee_name}`}>
              {task.assignee_avatar ? (
                <img src={task.assignee_avatar} alt={task.assignee_name} className="assignee-avatar" />
              ) : (
                <div className="assignee-initials">
                  {task.assignee_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <span className="unassigned-badge" title="Unassigned">
              <i className="fa-regular fa-user"></i>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
