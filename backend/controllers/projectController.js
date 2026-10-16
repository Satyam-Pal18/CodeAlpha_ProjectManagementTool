const { dbQuery, dbGet, dbRun } = require('../config/db');

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT DISTINCT p.*, u.name as owner_name, u.avatar as owner_avatar,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.updated_at DESC
    `;

    const projects = await dbQuery(sql, [userId, userId]);

    // Fetch member avatars for each project
    for (const project of projects) {
      const members = await dbQuery(`
        SELECT u.id, u.name, u.email, u.avatar, pm.role
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
      `, [project.id]);
      project.members = members;
    }

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await dbGet(`
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const members = await dbQuery(`
      SELECT u.id, u.name, u.email, u.avatar, u.role as user_role, pm.role as project_role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [id]);

    const activity = await dbQuery(`
      SELECT a.*, u.name as user_name, u.avatar as user_avatar
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      WHERE a.project_id = ?
      ORDER BY a.created_at DESC
      LIMIT 15
    `, [id]);

    project.members = members;
    project.activity = activity;

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, color, memberIds } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const projectColor = color || '#8b5cf6';

    const result = await dbRun(
      'INSERT INTO projects (title, description, status, owner_id, color) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), description ? description.trim() : '', 'Active', userId, projectColor]
    );

    const projectId = result.insertId;

    // Add owner as Owner member
    await dbRun(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, 'Owner']
    );

    // Add other members if provided
    if (memberIds && Array.isArray(memberIds)) {
      for (const mId of memberIds) {
        if (mId !== userId) {
          await dbRun(
            'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [projectId, mId, 'Member']
          );
        }
      }
    }

    // Log Activity
    await dbRun(
      'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [projectId, userId, 'created_project', `Created project "${title.trim()}"`]
    );

    const newProject = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      project: newProject
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, color } = req.body;

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await dbRun(
      'UPDATE projects SET title = ?, description = ?, status = ?, color = ? WHERE id = ?',
      [
        title || project.title,
        description !== undefined ? description : project.description,
        status || project.status,
        color || project.color,
        id
      ]
    );

    const updated = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);

    res.json({ success: true, message: 'Project updated successfully!', project: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only project owner can delete this project.' });
    }

    await dbRun('DELETE FROM projects WHERE id = ?', [id]);

    res.json({ success: true, message: 'Project deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    await dbRun(
      'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [id, userId, role || 'Member']
    );

    const user = await dbGet('SELECT id, name, email, avatar, role FROM users WHERE id = ?', [userId]);

    await dbRun(
      'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [id, req.user.id, 'added_member', `Added ${user.name} to project`]
    );

    res.status(201).json({ success: true, message: 'Member added to project!', user });
  } catch (error) {
    next(error);
  }
};
