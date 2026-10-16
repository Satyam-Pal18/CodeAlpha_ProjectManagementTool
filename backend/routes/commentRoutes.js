const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/task/:taskId', commentController.getCommentsByTask);
router.post('/task/:taskId', commentController.createComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
