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
    await createProject({ title, description, created_by: 1 });
    const data = await getProjects();
    setProjects(data);
    setTitle('');
    setDescription('');
  };

  return (
    <div>
      <h1>Projects Page</h1>
      <section>
        {projects.map((project) => (
          <div key={project.id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
          </div>
        ))}
      </section>
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit">Create Project</button>
        </form>
      </section>
    </div>
  );
}

export default ProjectsPage;
