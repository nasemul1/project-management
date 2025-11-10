import Comment from '../models/Comment.js';
import Task from '../models/Task.js';

// Get comments by task
export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const comments = await Comment.find({ taskId })
      .populate('userId', 'name email profileImage')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create comment
export const createComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;
    
    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const comment = await Comment.create({
      taskId,
      userId: req.user._id,
      text
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email profileImage');
    
    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Only allow comment owner or admin to delete
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    await Comment.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
