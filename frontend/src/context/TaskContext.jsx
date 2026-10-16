import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { API } from '../services/api';
import { useProject } from './ProjectContext';
import { useToast } from './ToastContext';
import { getSocket } from '../services/socket';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { activeProject } = useProject();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    if (!activeProject) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const res = await API.getTasks(activeProject.id);
      if (res.success) {
        // Deduplicate on fetch
        const map = new Map();
        res.tasks.forEach((t) => map.set(Number(t.id), t));
        setTasks(Array.from(map.values()));
      }
    } catch (err) {
      console.warn('Failed to load tasks:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Setup WebSocket Listeners for Real-time Team Sync
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeProject) return;

    const handleTaskCreated = ({ task }) => {
      setTasks((prev) => {
        if (prev.some((t) => Number(t.id) === Number(task.id))) return prev;
        return [task, ...prev];
      });
      showToast(`⚡ Real-time: New task "${task.title}" added`, 'socket');
    };

    const handleTaskUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => (Number(t.id) === Number(task.id) ? task : t)));
      setActiveTaskModal((prev) => (prev && Number(prev.id) === Number(task.id) ? task : prev));
    };

    const handleTaskMoved = ({ taskId, toStatus, task }) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (Number(t.id) === Number(taskId)) {
            return task ? task : { ...t, status: toStatus };
          }
          return t;
        })
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => Number(t.id) !== Number(taskId)));
      setActiveTaskModal((prev) => (prev && Number(prev.id) === Number(taskId) ? null : prev));
    };

    const handleCommentAdded = ({ taskId, comment }) => {
      setTasks((prev) =>
        prev.map((t) =>
          Number(t.id) === Number(taskId)
            ? { ...t, comment_count: (t.comment_count || 0) + 1 }
            : t
        )
      );
      showToast(`💬 New comment on task #${taskId}`, 'socket');
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('comment:added', handleCommentAdded);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('comment:added', handleCommentAdded);
    };
  }, [activeProject, showToast]);

  // Task Operations
  const createTask = async (data) => {
    if (!activeProject) return false;
    try {
      const res = await API.createTask({ ...data, projectId: activeProject.id });
      if (res.success) {
        showToast('Task created successfully!', 'success');
        setTasks((prev) => {
          if (prev.some((t) => Number(t.id) === Number(res.task.id))) return prev;
          return [res.task, ...prev];
        });
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      return false;
    }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await API.updateTask(id, data);
      if (res.success) {
        showToast('Task updated', 'success');
        setTasks((prev) => prev.map((t) => (Number(t.id) === Number(id) ? res.task : t)));
        setActiveTaskModal(res.task);
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
      return false;
    }
  };

  // Optimistic Move for super responsive Drag & Drop
  const moveTaskStatus = async (taskId, newStatus) => {
    const original = tasks.find((t) => Number(t.id) === Number(taskId));
    if (!original || original.status === newStatus) return;

    // Optimistic state change
    setTasks((prev) =>
      prev.map((t) => (Number(t.id) === Number(taskId) ? { ...t, status: newStatus } : t))
    );

    try {
      await API.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (Number(t.id) === Number(taskId) ? original : t))
      );
      showToast('Failed to move task status', 'error');
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await API.deleteTask(id);
      if (res.success) {
        showToast('Task deleted', 'info');
        setTasks((prev) => prev.filter((t) => Number(t.id) !== Number(id)));
        if (activeTaskModal && Number(activeTaskModal.id) === Number(id)) {
          setActiveTaskModal(null);
        }
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
      return false;
    }
  };

  // Filtered Tasks with strict ID deduplication
  const filteredTasks = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (t && t.id) map.set(Number(t.id), t);
    });
    const unique = Array.from(map.values());

    return unique.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !task.assigned_to) ||
        String(task.assigned_to) === String(assigneeFilter);

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        loading,
        fetchTasks,
        createTask,
        updateTask,
        moveTaskStatus,
        deleteTask,
        activeTaskModal,
        openTaskModal: setActiveTaskModal,
        closeTaskModal: () => setActiveTaskModal(null),
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        assigneeFilter,
        setAssigneeFilter
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);
