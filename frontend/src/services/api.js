const API_BASE = '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('pms_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Server returned status ${res.status}`);
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('pms_token');
        localStorage.removeItem('pms_user');
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const API = {
  // Auth
  register: (name, email, password, role) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProfile: () => request('/auth/profile'),
  getUsers: () => request('/auth/users'),

  // Projects
  getProjects: () => request('/projects'),
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  addProjectMember: (id, userId, role) =>
    request(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),

  // Tasks
  getTasks: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks/project/${projectId}${query ? `?${query}` : ''}`);
  },
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTaskStatus: (id, status, orderIndex) =>
    request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, orderIndex }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: (taskId) => request(`/comments/task/${taskId}`),
  createComment: (taskId, content) =>
    request(`/comments/task/${taskId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' })
};
