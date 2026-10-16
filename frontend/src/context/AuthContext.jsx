import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pms_token'));
  const [teamUsers, setTeamUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Validate token & load profile on mount
  useEffect(() => {
    if (token) {
      API.getProfile()
        .then((res) => {
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('pms_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  // Load team users for task assignment
  const fetchTeamUsers = async () => {
    if (!token) return;
    try {
      const res = await API.getUsers();
      if (res.success) {
        setTeamUsers(res.users);
      }
    } catch (e) {
      console.warn('Failed to load team users:', e.message);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchTeamUsers();
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await API.login(email, password);
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('pms_token', data.token);
        localStorage.setItem('pms_user', JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await API.register(name, email, password, role);
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('pms_token', data.token);
        localStorage.setItem('pms_user', JSON.stringify(data.user));
        showToast(`Account created! Welcome, ${data.user.name}.`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pms_token');
    localStorage.removeItem('pms_user');
    showToast('Logged out', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        teamUsers,
        loading,
        login,
        register,
        logout,
        fetchTeamUsers,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
