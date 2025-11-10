import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import * as bugReportService from '../services/bugReportService';
import * as projectService from '../services/projectService';

const BugReports = () => {
  const [bugReports, setBugReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, in-progress, resolved, closed
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    severity: 'medium'
  });
  const { canManageProjects } = useAuth();

  useEffect(() => {
    fetchBugReports();
    fetchProjects();
  }, []);

  const fetchBugReports = async () => {
    try {
      setLoading(true);
      const response = await bugReportService.getBugReports();
      const bugReportsData = response.data?.data || response.data || [];
      setBugReports(Array.isArray(bugReportsData) ? bugReportsData : []);
    } catch (err) {
      setError('Failed to load bug reports');
      setBugReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjects();
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to load projects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bugReportService.createBugReport(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', projectId: '', severity: 'medium' });
      fetchBugReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bug report');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await bugReportService.updateBugReport(id, { status: newStatus });
      fetchBugReports();
    } catch (err) {
      setError('Failed to update bug report status');
    }
  };

  const getSeverityBadgeClass = (severity) => {
    const classes = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold'
    };
    return classes[severity] || 'badge-medium';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      open: 'badge-todo',
      'in-progress': 'badge-in-progress',
      resolved: 'badge-done',
      closed: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    };
    return classes[status] || 'badge-todo';
  };

  const filteredBugReports = filter === 'all' 
    ? (Array.isArray(bugReports) ? bugReports : [])
    : (Array.isArray(bugReports) ? bugReports.filter(bug => bug.status === filter) : []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Bug Reports</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-danger flex items-center space-x-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Report Bug</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Bug Reports List */}
        {filteredBugReports.length === 0 ? (
          <div className="text-center py-20 card-gradient">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No bugs found!</h3>
            <p className="text-gray-500 text-lg">Everything is running smoothly</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBugReports.map((bug, index) => (
              <div 
                key={bug._id} 
                className="card-gradient hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Severity Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                        bug.severity === 'critical' ? 'bg-gradient-to-br from-red-600 to-rose-600' :
                        bug.severity === 'high' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                        bug.severity === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                        'bg-gradient-to-br from-green-500 to-emerald-500'
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{bug.title}</h3>
                        <p className="text-gray-600 mb-4">{bug.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`badge ${getSeverityBadgeClass(bug.severity)}`}>
                            {bug.severity}
                          </span>
                          
                          {canManageProjects() ? (
                            <select
                              value={bug.status}
                              onChange={(e) => handleStatusChange(bug._id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-semibold"
                            >
                              <option value="open">Open</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          ) : (
                            <span className={`badge ${getStatusBadgeClass(bug.status)}`}>
                              {bug.status}
                            </span>
                          )}

                          {bug.projectId && (
                            <Link
                              to={`/projects/${bug.projectId._id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span>{bug.projectId.title}</span>
                            </Link>
                          )}

                          <span className="text-gray-500">
                            Reported by <span className="font-semibold">{bug.reportedBy?.name}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Bug Report Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Report a Bug"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Brief description of the bug"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="4"
              placeholder="Detailed description of the bug and steps to reproduce"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Project (Optional)
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="input"
            >
              <option value="">-- No Project --</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 btn btn-danger">
              Submit Bug Report
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BugReports;
