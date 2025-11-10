import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';
import * as userService from '../services/userService';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  });
  const { isAdmin, canManageProjects, isProjectManager, user } = useAuth();

  useEffect(() => {
    fetchProjectAndTasks();
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasksByProject(id)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTask({ ...formData, projectId: id });
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchProjectAndTasks();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const canUpdateTask = (task) => {
    if (isAdmin()) return true;
    return task.assignedTo?._id === user._id;
  };

  const canUpdateStatus = (task) => {
    // Project managers cannot update status, only admins and assigned members
    if (isProjectManager()) return false;
    return canUpdateTask(task);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Project not found</p>
            <Link to="/dashboard" className="mt-4 inline-block btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Projects
          </Link>
          
          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Manager: {project.managerId?.name}</span>
                  <span>•</span>
                  <span>Team: {project.teamMembers?.length || 0} members</span>
                  <span>•</span>
                  <span className={`badge ${project.status === 'completed' ? 'badge-done' : project.status === 'in-progress' ? 'badge-in-progress' : 'badge-todo'}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tasks Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            {canManageProjects() && (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                + Add Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks yet</p>
              {canManageProjects() && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 btn btn-primary"
                >
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {task.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {canUpdateStatus(task) ? (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <span className={`badge badge-${task.status}`}>
                            {task.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="px-6 py-4">
                        {canManageProjects() && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
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
              rows="3"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To (Optional)
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="input"
            >
              <option value="">-- Unassigned --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 btn btn-primary">
              Create Task
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

export default ProjectDetail;
