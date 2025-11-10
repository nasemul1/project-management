import express from 'express';
import {
  getBugReports,
  getBugReportsByProject,
  getBugReport,
  createBugReport,
  updateBugReport,
  deleteBugReport
} from '../controllers/bugReportController.js';
import { protect, projectManagerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBugReports)
  .post(protect, createBugReport);

router.route('/project/:projectId')
  .get(protect, getBugReportsByProject);

router.route('/:id')
  .get(protect, getBugReport)
  .put(protect, projectManagerOrAdmin, updateBugReport)
  .delete(protect, projectManagerOrAdmin, deleteBugReport);

export default router;
