const { dbQuery, dbGet, dbRun } = require('../config/db');
const { getIO } = require('../sockets/socketHandler');

exports.getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee } = req.query;

    let sql = `
      SELECT t.*,
        u.name as assignee_name, u.email as assignee_email, u.avatar as assignee_avatar,
        c.name as creator_name, c.avatar as creator_avatar,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.project_id = ?
    `;

    const params = [projectId];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }
    if (assignee) {
      sql += ' AND t.assigned_to = ?';
      params.push(assignee);
    }

    sql += ' ORDER BY t.order_index ASC, t.created_at DESC';

    const tasks = await dbQuery(sql, params);

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!projectId || !title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project ID and task title are required.' });
    }

    const taskStatus = status || 'todo';
    const taskPriority = priority || 'medium';

    // Get maximum order_index in target column
    const maxOrderRow = await dbGet(
      'SELECT MAX(order_index) as max_order FROM tasks WHERE project_id = ? AND status = ?',
      [projectId, taskStatus]
    );
    const nextOrder = (maxOrderRow && maxOrderRow.max_order !== null) ? maxOrderRow.max_order + 1 : 0;

    const result = await dbRun(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        title.trim(),
        description ? description.trim() : '',
        taskStatus,
        taskPriority,
        assignedTo || null,
        userId,
        dueDate || null,
        nextOrder
      ]
    );

    const taskId = result.insertId;

    // Fetch complete inserted task with relations
    const task = await dbGet(`
      SELECT t.*,
        u.name as assignee_name, u.email as assignee_email, u.avatar as assignee_avatar,
        c.name as creator_name, c.avatar as creator_avatar,
        0 as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `, [taskId]);

    // Log Activity
    await dbRun(
      'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [projectId, userId, 'created_task', `Created task "${title.trim()}" in ${taskStatus}`]
    );

    // Emit Socket Event for real-time multi-client sync!
    try {
      const io = getIO();
      if (io) {
        io.to(`project:${projectId}`).emit('task:created', { task });
      }
    } catch (e) {
      console.warn('Socket emit warning:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const existing = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await dbRun(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        description !== undefined ? description : existing.description,
        status || existing.status,
        priority || existing.priority,
        assignedTo !== undefined ? assignedTo : existing.assigned_to,
        dueDate !== undefined ? dueDate : existing.due_date,
        id
      ]
    );

    const updatedTask = await dbGet(`
      SELECT t.*,
        u.name as assignee_name, u.email as assignee_email, u.avatar as assignee_avatar,
        c.name as creator_name, c.avatar as creator_avatar,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `, [id]);

    // Emit socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`project:${existing.project_id}`).emit('task:updated', { task: updatedTask });
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Task updated successfully!',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, orderIndex } = req.body;

    const existing = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const newStatus = status || existing.status;
    const newOrder = orderIndex !== undefined ? orderIndex : existing.order_index;

    await dbRun(
      'UPDATE tasks SET status = ?, order_index = ? WHERE id = ?',
      [newStatus, newOrder, id]
    );

    // Log Activity
    await dbRun(
      'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [existing.project_id, req.user.id, 'moved_task', `Moved "${existing.title}" to ${newStatus}`]
    );

    const updatedTask = await dbGet(`
      SELECT t.*,
        u.name as assignee_name, u.email as assignee_email, u.avatar as assignee_avatar,
        c.name as creator_name, c.avatar as creator_avatar,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `, [id]);

    // Emit live socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`project:${existing.project_id}`).emit('task:moved', {
          taskId: Number(id),
          fromStatus: existing.status,
          toStatus: newStatus,
          task: updatedTask
        });
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Task status updated!',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await dbRun('DELETE FROM tasks WHERE id = ?', [id]);

    // Emit socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`project:${existing.project_id}`).emit('task:deleted', { taskId: Number(id) });
      }
    } catch (e) {}

    res.json({ success: true, message: 'Task deleted successfully!' });
  } catch (error) {
    next(error);
  }
};
