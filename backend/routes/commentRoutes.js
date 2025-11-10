import express from 'express';
import {
  getCommentsByTask,
  createComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createComment);

router.route('/task/:taskId')
  .get(protect, getCommentsByTask);

router.route('/:id')
  .delete(protect, deleteComment);

export default router;
