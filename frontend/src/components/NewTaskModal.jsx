import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';

export const NewTaskModal = ({ isOpen, onClose, initialStatus = 'todo' }) => {
  const { createTask } = useTask();
  const { activeProject } = useProject();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const success = await createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo ? Number(assignedTo) : null,
        dueDate: dueDate || null
      });

      if (success) {
        setTitle('');
        setDescription('');
        setAssignedTo('');
        setDueDate('');
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-sm">
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-icon-badge" style={{ color: 'var(--primary)' }}>
              <i className="fa-solid fa-plus"></i>
            </span>
            <h3>Create New Task</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              className="input-primary"
              placeholder="e.g., Integrate Stripe Payment Webhooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input-primary"
              rows="3"
              placeholder="Add details, instructions, or subtasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Status Column</label>
              <select
                className="input-primary"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                className="input-primary"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Assign To</label>
              <select
                className="input-primary"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {activeProject?.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.project_role || m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="input-primary"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
