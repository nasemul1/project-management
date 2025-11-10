import BugReport from '../models/BugReport.js';

// Get all bug reports
export const getBugReports = async (req, res) => {
  try {
    const bugReports = await BugReport.find()
      .populate('projectId', 'title')
      .populate('taskId', 'title')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bugReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get bug reports by project
export const getBugReportsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const bugReports = await BugReport.find({ projectId })
      .populate('taskId', 'title')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: bugReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single bug report
export const getBugReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bugReport = await BugReport.findById(id)
      .populate('projectId', 'title')
      .populate('taskId', 'title')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!bugReport) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bugReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create bug report
export const createBugReport = async (req, res) => {
  try {
    const { title, description, projectId, taskId, severity } = req.body;
    
    const bugReport = await BugReport.create({
      title,
      description,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      reportedBy: req.user._id,
      severity
    });
    
    const populatedBugReport = await BugReport.findById(bugReport._id)
      .populate('projectId', 'title')
      .populate('taskId', 'title')
      .populate('reportedBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: populatedBugReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update bug report
export const updateBugReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, assignedTo } = req.body;
    
    const bugReport = await BugReport.findById(id);
    
    if (!bugReport) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    // Update fields
    if (status) bugReport.status = status;
    if (severity) bugReport.severity = severity;
    if (assignedTo !== undefined) bugReport.assignedTo = assignedTo || undefined;
    
    await bugReport.save();
    
    const updatedBugReport = await BugReport.findById(id)
      .populate('projectId', 'title')
      .populate('taskId', 'title')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedBugReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete bug report
export const deleteBugReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bugReport = await BugReport.findById(id);
    
    if (!bugReport) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    await BugReport.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Bug report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
