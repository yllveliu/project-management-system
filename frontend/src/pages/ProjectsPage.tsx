import { useEffect, useState } from 'react';
import { getProjects, createProject } from '../api/api';

interface Project {
  id: number;
  title: string;
  description?: string;
  client_name?: string;
  start_date?: string;
  deadline?: string;
  priority: string;
  status: string;
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    getProjects().then((data) => setProjects(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject({
      title,
      description: description || undefined,
      client_name: clientName || undefined,
      start_date: startDate || undefined,
      deadline: deadline || undefined,
      priority,
      status,
    });
    const data = await getProjects();
    setProjects(data);
    setTitle('');
    setDescription('');
    setClientName('');
    setStartDate('');
    setDeadline('');
    setPriority('Medium');
    setStatus('Active');
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Projects</h1>

      {/* Project cards grid */}
      <section className="mb-8">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            No projects yet. Create one below.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-base font-semibold text-gray-900">{project.title}</h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      project.priority === 'High' ? 'bg-red-50 text-red-600' :
                      project.priority === 'Low' ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>{project.priority}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      project.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      project.status === 'Completed' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>{project.status}</span>
                  </div>
                </div>
                {project.description ? (
                  <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                ) : (
                  <p className="text-sm text-gray-300 mt-1 italic">No description</p>
                )}
                {project.client_name && (
                  <p className="text-xs text-gray-500 mt-2">Client: {project.client_name}</p>
                )}
                {(project.start_date || project.deadline) && (
                  <div className="flex items-center gap-3 mt-1">
                    {project.start_date && (
                      <p className="text-xs text-gray-400">Start: {project.start_date}</p>
                    )}
                    {project.deadline && (
                      <p className="text-xs text-gray-400">Deadline: {project.deadline}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create project form */}
      <section className="max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Project</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Client / Department</label>
              <input
                type="text"
                placeholder="Client or department name (optional)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
            >
              Create Project
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ProjectsPage;
