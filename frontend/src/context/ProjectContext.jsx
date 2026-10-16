import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { joinProjectRoom, leaveProjectRoom } from '../services/socket';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.getProjects();
      if (res.success) {
        setProjects(res.projects);
        // Set active project if none selected or not in list
        if (res.projects.length > 0) {
          const currentId = activeProject ? activeProject.id : null;
          const found = res.projects.find((p) => p.id === currentId);
          if (found) {
            setActiveProject(found);
          } else {
            setActiveProject(res.projects[0]);
          }
        } else {
          setActiveProject(null);
        }
      }
    } catch (e) {
      console.warn('Failed to load projects:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProject(null);
    }
  }, [user, token]);

  // Handle Socket Room join on active project change
  useEffect(() => {
    if (activeProject) {
      joinProjectRoom(activeProject.id);
      return () => {
        leaveProjectRoom(activeProject.id);
      };
    }
  }, [activeProject]);

  const selectProject = (project) => {
    setActiveProject(project);
  };

  const createProject = async (data) => {
    try {
      const res = await API.createProject(data);
      if (res.success) {
        showToast(`Project "${res.project.title}" created!`, 'success');
        await fetchProjects();
        setActiveProject(res.project);
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
      return false;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const res = await API.deleteProject(projectId);
      if (res.success) {
        showToast('Project deleted successfully', 'info');
        await fetchProjects();
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
      return false;
    }
  };

  const addMember = async (projectId, userId, role) => {
    try {
      const res = await API.addProjectMember(projectId, userId, role);
      if (res.success) {
        showToast('Member added to project', 'success');
        fetchProjects();
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        loading,
        fetchProjects,
        selectProject,
        createProject,
        deleteProject,
        addMember
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
