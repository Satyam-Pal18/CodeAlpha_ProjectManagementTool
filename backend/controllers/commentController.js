const { dbQuery, dbGet, dbRun } = require('../config/db');
const { getIO } = require('../sockets/socketHandler');

exports.getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const sql = `
      SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `;

    const comments = await dbQuery(sql, [taskId]);

    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const result = await dbRun(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, userId, content.trim()]
    );

    const comment = await dbGet(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    // Emit real-time WebSocket event!
    try {
      const io = getIO();
      if (io) {
        io.to(`project:${task.project_id}`).emit('comment:added', { taskId: Number(taskId), comment });
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully!',
      comment
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await dbGet('SELECT * FROM comments WHERE id = ?', [id]);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
    }

    await dbRun('DELETE FROM comments WHERE id = ?', [id]);

    res.json({ success: true, message: 'Comment deleted successfully!' });
  } catch (error) {
    next(error);
  }
};
