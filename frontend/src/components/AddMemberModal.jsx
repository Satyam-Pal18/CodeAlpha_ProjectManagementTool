import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AddMemberModal = ({ isOpen, onClose }) => {
  const { activeProject, addMember } = useProject();
  const { teamUsers } = useAuth();
  const { showToast } = useToast();

  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('Developer');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !activeProject) return null;

  // Filter out existing members
  const existingMemberIds = (activeProject.members || []).map((m) => m.id);
  const availableUsers = teamUsers.filter((u) => !existingMemberIds.includes(u.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('Please select a team member', 'error');
      return;
    }

    setSubmitting(true);
    const success = await addMember(activeProject.id, Number(selectedUser), role);
    setSubmitting(false);

    if (success) {
      setSelectedUser('');
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-sm">
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-icon-badge" style={{ color: 'var(--primary)' }}>
              <i className="fa-solid fa-user-plus"></i>
            </span>
            <h3>Add Member to Project</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          <div className="form-group">
            <label>Select Team Member *</label>
            <select
              className="input-primary"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">-- Choose Member --</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role || u.email})
                </option>
              ))}
            </select>
            {availableUsers.length === 0 && (
              <span className="input-hint">All team members are already added to this project!</span>
            )}
          </div>

          <div className="form-group">
            <label>Project Role</label>
            <select
              className="input-primary"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Lead Developer">Lead Developer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Backend Architect">Backend Architect</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="QA Specialist">QA Specialist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Member">Member</option>
            </select>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || availableUsers.length === 0}
            >
              {submitting ? 'Adding...' : 'Add to Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
