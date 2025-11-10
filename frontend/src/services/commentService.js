import api from './api';

export const getCommentsByTask = (taskId) => {
  return api.get(`/comments/task/${taskId}`);
};

export const createComment = (commentData) => {
  return api.post('/comments', commentData);
};

export const deleteComment = (id) => {
  return api.delete(`/comments/${id}`);
};
