import api from './api';

export const getBugReports = () => {
  return api.get('/bug-reports');
};

export const getBugReportsByProject = (projectId) => {
  return api.get(`/bug-reports/project/${projectId}`);
};

export const getBugReport = (id) => {
  return api.get(`/bug-reports/${id}`);
};

export const createBugReport = (bugReportData) => {
  return api.post('/bug-reports', bugReportData);
};

export const updateBugReport = (id, updateData) => {
  return api.put(`/bug-reports/${id}`, updateData);
};

export const deleteBugReport = (id) => {
  return api.delete(`/bug-reports/${id}`);
};
