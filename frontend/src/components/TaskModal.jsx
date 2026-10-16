import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';
import { useToast } from '../context/ToastContext';

export const TaskModal = () => {
  const { activeTaskModal, closeTaskModal, updateTask, deleteTask } = useTask();
  const { activeProject } = useProject();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (activeTaskModal) {
      setTitle(activeTaskModal.title || '');
      setDescription(activeTaskModal.description || '');
      setStatus(activeTaskModal.status || 'todo');
      setPriority(activeTaskModal.priority || 'medium');
      setAssignedTo(activeTaskModal.assigned_to ? String(activeTaskModal.assigned_to) : '');
      setDueDate(activeTaskModal.due_date ? activeTaskModal.due_date.split('T')[0] : '');

      // Load comments
      fetchComments(activeTaskModal.id);
    }
  }, [activeTaskModal]);

  const fetchComments = async (taskId) => {
    setLoadingComments(true);
    try {
      const res = await API.getComments(taskId);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (e) {
      console.warn('Failed to fetch comments:', e.message);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!activeTaskModal) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title cannot be empty', 'error');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo: assignedTo ? Number(assignedTo) : null,
      dueDate: dueDate || null
    };

    const success = await updateTask(activeTaskModal.id, payload);
    if (success) {
      closeTaskModal();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const success = await deleteTask(activeTaskModal.id);
      if (success) {
        closeTaskModal();
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await API.createComment(activeTaskModal.id, newComment.trim());
      if (res.success) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment('');
        showToast('Comment posted', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await API.deleteComment(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        showToast('Comment deleted', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeTaskModal()}>
      <div className="modal-container task-detail-modal">
        <div className="modal-header">
          <div className="modal-header-left">
            <span className={`priority-badge badge-${priority}`}>
              <i className="fa-solid fa-circle-dot"></i> {priority.toUpperCase()}
            </span>
            <span className="task-id-badge">#{activeTaskModal.id}</span>
          </div>

          <button className="modal-close-btn" onClick={closeTaskModal} title="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body-layout">
          {/* Main Info */}
          <div className="task-main-col">
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                className="input-primary title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="input-primary desc-textarea"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add rich description, checklist, or acceptance criteria..."
              ></textarea>
            </div>

            {/* Comment Thread Section */}
            <div className="comments-section">
              <h4 className="section-title">
                <i className="fa-regular fa-comments"></i> Discussion & Comments ({comments.length})
              </h4>

              <div className="comments-list">
                {loadingComments ? (
                  <div className="comments-loading">Loading comments...</div>
                ) : comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c.id} className="comment-bubble">
                      <img src={c.user_avatar} alt={c.user_name} className="comment-avatar" />
                      <div className="comment-content">
                        <div className="comment-meta">
                          <span className="comment-author">{c.user_name}</span>
                          <span className="comment-time">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {user && user.id === c.user_id && (
                            <button
                              type="button"
                              className="comment-del-btn"
                              onClick={() => handleDeleteComment(c.id)}
                              title="Delete comment"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">No discussion yet. Leave the first comment!</div>
                )}
              </div>

              {/* Add Comment Input */}
              <div className="add-comment-row">
                <textarea
                  className="input-primary comment-input"
                  rows="2"
                  placeholder="Write a comment or mention team members..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                  type="button"
                  className="btn-primary post-comment-btn"
                  disabled={submittingComment || !newComment.trim()}
                  onClick={handleAddComment}
                >
                  <i className="fa-solid fa-paper-plane"></i> Post
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar / Meta Settings Col */}
          <div className="task-side-col">
            <div className="meta-card">
              <div className="form-group">
                <label>Status</label>
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

              <div className="form-group">
                <label>Assignee</label>
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

              <div className="meta-actions">
                <button type="submit" className="btn-primary full-btn">
                  <i className="fa-solid fa-check"></i> Save Changes
                </button>
                <button
                  type="button"
                  className="btn-danger full-btn"
                  onClick={handleDelete}
                >
                  <i className="fa-solid fa-trash"></i> Delete Task
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
