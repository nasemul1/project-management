import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task reference is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
