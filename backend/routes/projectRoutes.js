import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { protect, adminOnly, projectManagerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, projectManagerOrAdmin, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

export default router;
