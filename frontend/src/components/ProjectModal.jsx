import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PROJECT_COLORS = [
  '#8b5cf6', // Violet
  '#f43f5e', // Crimson
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#a855f7'  // Purple
];

export const ProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProject();
  const { teamUsers, user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }

    setSubmitting(true);
    const success = await createProject({
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      memberIds: selectedMembers
    });

    setSubmitting(false);
    if (success) {
      setTitle('');
      setDescription('');
      setSelectedMembers([]);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-sm">
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-icon-badge" style={{ color: selectedColor }}>
              <i className="fa-solid fa-folder-plus"></i>
            </span>
            <h3>Create New Project</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              className="input-primary"
              placeholder="e.g., Nexus AI Architecture v1.0"
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
              placeholder="Goal of this project, milestones, or sprint overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Project Brand Color</label>
            <div className="color-swatches-row">
              {PROJECT_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  className={`color-swatch-btn ${selectedColor === col ? 'selected' : ''}`}
                  style={{ backgroundColor: col }}
                  onClick={() => setSelectedColor(col)}
                >
                  {selectedColor === col && <i className="fa-solid fa-check"></i>}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Team Members to Add</label>
            <div className="members-select-list">
              {teamUsers
                .filter((u) => u.id !== user?.id)
                .map((u) => (
                  <label key={u.id} className="member-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                    />
                    <img src={u.avatar} alt={u.name} className="member-avatar-mini" />
                    <span className="member-name-label">{u.name}</span>
                    <span className="member-role-label">{u.role}</span>
                  </label>
                ))}
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
