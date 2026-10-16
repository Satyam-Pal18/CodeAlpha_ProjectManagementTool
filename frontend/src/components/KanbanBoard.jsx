import React, { useState, useRef, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext';

const COLUMNS = [
  { key: 'backlog', title: 'Backlog', icon: 'fa-solid fa-inbox', color: 'var(--status-backlog)' },
  { key: 'todo', title: 'To Do', icon: 'fa-solid fa-circle-notch', color: 'var(--status-todo)' },
  { key: 'in_progress', title: 'In Progress', icon: 'fa-solid fa-clock-rotate-left', color: 'var(--status-in-progress)' },
  { key: 'review', title: 'In Review', icon: 'fa-solid fa-eye', color: 'var(--status-review)' },
  { key: 'done', title: 'Completed', icon: 'fa-solid fa-circle-check', color: 'var(--status-done)' }
];

export const KanbanBoard = ({ onOpenNewTask }) => {
  const { filteredTasks, loading } = useTask();
  const { activeProject } = useProject();
  const [activeColTab, setActiveColTab] = useState('backlog');
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollLeft = 0;
    }
  }, [activeProject?.id]);

  const handleGridScroll = () => {
    if (!gridRef.current || !gridRef.current.children.length) return;
    const scrollLeft = gridRef.current.scrollLeft;
    const firstCol = gridRef.current.children[0];
    const colWidth = (firstCol?.offsetWidth || 300) + 14;
    const index = Math.min(
      COLUMNS.length - 1,
      Math.max(0, Math.round(scrollLeft / colWidth))
    );
    if (COLUMNS[index] && COLUMNS[index].key !== activeColTab) {
      setActiveColTab(COLUMNS[index].key);
    }
  };

  const scrollToCol = (colKey) => {
    setActiveColTab(colKey);
    const target = document.getElementById('col-' + colKey);
    if (target && gridRef.current) {
      const colLeft = target.offsetLeft - gridRef.current.offsetLeft;
      gridRef.current.scrollTo({ left: colLeft, behavior: 'smooth' });
    }
  };

  if (!activeProject) {
    return (
      <div className="board-no-project">
        <div className="no-project-box">
          <i className="fa-solid fa-folder-open"></i>
          <h3>No Project Selected</h3>
          <p>Please select an existing project from the top bar or create a new one to start managing tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-board-wrapper">
      <div className="board-header">
        <div className="board-header-left">
          <div className="board-title-row">
            <span
              className="board-color-indicator"
              style={{ backgroundColor: activeProject.color || 'var(--primary)' }}
            ></span>
            <h2 className="board-title">{activeProject.title}</h2>
            <span className="board-status-tag">{activeProject.status}</span>
          </div>
          {activeProject.description && (
            <p className="board-desc">{activeProject.description}</p>
          )}
        </div>

        <div className="board-header-right">
          <button className="btn-primary" onClick={() => onOpenNewTask()}>
            <i className="fa-solid fa-plus"></i> New Task
          </button>
        </div>
      </div>

      {/* Mobile Column Switcher Tabs */}
      <div className="mobile-column-tabs">
        {COLUMNS.map((col) => {
          const count = filteredTasks.filter((t) => t.status === col.key).length;
          return (
            <button
              key={col.key}
              type="button"
              className={'mobile-col-tab ' + (activeColTab === col.key ? 'active' : '')}
              onClick={() => scrollToCol(col.key)}
            >
              <span className="col-tab-dot" style={{ backgroundColor: col.color }}></span>
              <span className="col-tab-title">{col.title}</span>
              <span className="col-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="board-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Loading tasks...</span>
        </div>
      ) : (
        <div
          ref={gridRef}
          onScroll={handleGridScroll}
          className="kanban-columns-grid"
        >
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <KanbanColumn
                key={col.key}
                statusKey={col.key}
                title={col.title}
                icon={col.icon}
                color={col.color}
                tasks={columnTasks}
                onQuickAdd={(status) => onOpenNewTask(status)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
