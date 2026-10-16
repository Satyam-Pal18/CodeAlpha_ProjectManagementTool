import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { useTask } from '../context/TaskContext';

export const KanbanColumn = ({ statusKey, title, icon, color, tasks, onQuickAdd }) => {
  const { moveTaskStatus } = useTask();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskIdStr = e.dataTransfer.getData('taskId');
    if (taskIdStr) {
      const taskId = Number(taskIdStr);
      moveTaskStatus(taskId, statusKey);
    }
  };

  return (
    <div
      id={`col-${statusKey}`}
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-group">
          <span className="column-icon" style={{ color: color }}>
            <i className={icon}></i>
          </span>
          <h3 className="column-title">{title}</h3>
          <span className="column-count-badge" style={{ borderColor: color }}>
            {tasks.length}
          </span>
        </div>

        <button
          className="column-add-btn"
          onClick={() => onQuickAdd(statusKey)}
          title={`Add task to ${title}`}
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <div className="column-cards-container">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div className="column-empty-state">
            <i className="fa-regular fa-folder-open"></i>
            <span>No tasks in {title}</span>
          </div>
        )}
      </div>

      <button className="column-footer-add" onClick={() => onQuickAdd(statusKey)}>
        <i className="fa-solid fa-plus"></i> Add Card
      </button>
    </div>
  );
};
