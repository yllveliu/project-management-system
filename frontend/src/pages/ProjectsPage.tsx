import { useEffect, useState } from 'react';
import { getProjects, createProject } from '../api/api';

interface Project {
  id: number;
  title: string;
  description?: string;
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getProjects().then((data) => setProjects(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject({ title, description });
    const data = await getProjects();
    setProjects(data);
    setTitle('');
    setDescription('');
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
                <h2 className="text-base font-semibold text-gray-900">{project.title}</h2>
                {project.description ? (
                  <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                ) : (
                  <p className="text-sm text-gray-300 mt-1 italic">No description</p>
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
              <input
                type="text"
                placeholder="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
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
