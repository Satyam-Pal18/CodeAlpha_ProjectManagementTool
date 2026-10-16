import React from 'react';
import { useTask } from '../context/TaskContext';

export const ListView = ({ onOpenNewTask }) => {
  const { filteredTasks, openTaskModal, moveTaskStatus, updateTask, deleteTask } = useTask();

  const handleStatusChange = (taskId, newStatus) => {
    moveTaskStatus(taskId, newStatus);
  };

  const handlePriorityChange = (taskId, newPriority) => {
    updateTask(taskId, { priority: newPriority });
  };

  return (
    <div className="list-view-container">
      <div className="list-view-header">
        <div className="list-header-title">
          <h3>Task List ({filteredTasks.length})</h3>
          <p>Structured table overview with inline status & priority adjustments</p>
        </div>
        <button className="btn-primary" onClick={() => onOpenNewTask()}>
          <i className="fa-solid fa-plus"></i> Add Task
        </button>
      </div>

      <div className="table-responsive">
        <table className="tasks-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Task Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Comments</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} onClick={() => openTaskModal(task)} className="task-table-row">
                <td>
                  <div className="table-task-cell">
                    <span className="task-name">{task.title}</span>
                    {task.description && (
                      <span className="task-subtext">{task.description}</span>
                    )}
                  </div>
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className={`table-select status-select status-${task.status}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Completed</option>
                  </select>
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className={`table-select priority-select priority-${task.priority}`}
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </td>

                <td>
                  {task.assignee_name ? (
                    <div className="table-assignee">
                      <img src={task.assignee_avatar} alt={task.assignee_name} className="table-avatar" />
                      <span>{task.assignee_name}</span>
                    </div>
                  ) : (
                    <span className="unassigned-text">Unassigned</span>
                  )}
                </td>

                <td>
                  {task.due_date ? (
                    <span className="table-date">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>

                <td>
                  <span className="table-comments">
                    <i className="fa-regular fa-comment"></i> {task.comment_count || 0}
                  </span>
                </td>

                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div className="table-actions">
                    <button
                      className="table-action-btn"
                      onClick={() => openTaskModal(task)}
                      title="Edit Task"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => deleteTask(task.id)}
                      title="Delete Task"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="7" className="table-empty-cell">
                  <i className="fa-regular fa-folder-open"></i>
                  <p>No matching tasks found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
