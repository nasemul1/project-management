import express from 'express';
import {
  getTasksByProject,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks
} from '../controllers/taskController.js';
import { protect, adminOnly, projectManagerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, projectManagerOrAdmin, createTask);

router.route('/my-tasks')
  .get(protect, getMyTasks);

router.route('/project/:projectId')
  .get(protect, getTasksByProject);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, projectManagerOrAdmin, deleteTask);

export default router;
