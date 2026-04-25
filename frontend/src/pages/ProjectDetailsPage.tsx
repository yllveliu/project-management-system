import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectDetails, deleteProject, exportProject } from "../api/api";

interface ProjectDetail {
  id: number;
  title: string;
  description?: string;
  client_name?: string;
  start_date?: string;
  deadline?: string;
  priority: string;
  status: string;
  created_at?: string;
}

interface TaskItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to?: number;
  started_at?: string;
  completed_at?: string;
  archived_at?: string;
  completion_note?: string;
  is_archived: boolean;
  project_id: number;
}

interface Stats {
  total_tasks: number;
  todo: number;
  in_progress: number;
  completed: number;
  archived: number;
  completion_rate: number;
}

interface ProjectDetailsData {
  project: ProjectDetail;
  stats: Stats;
  tasks: {
    active: TaskItem[];
    completed: TaskItem[];
    archived: TaskItem[];
  };
}

function TaskRow({ task }: { task: TaskItem }) {
  return (
    <div className="rounded-lg p-3 border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-sm font-medium ${task.is_archived ? "line-through text-gray-400" : task.status === "Done" ? "line-through text-gray-500" : "text-gray-800"}`}>
            {task.title}
          </span>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
          )}
          {task.completion_note && (
            <p className="text-xs text-gray-500 mt-0.5">Work done: {task.completion_note}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              task.priority === "High" ? "bg-red-100 text-red-600" :
              task.priority === "Low" ? "bg-gray-100 text-gray-500" :
              "bg-yellow-100 text-yellow-600"
            }`}>{task.priority}</span>
            {task.status !== "Done" && !task.is_archived && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                task.status === "In Progress" ? "bg-yellow-50 text-yellow-600" : "bg-gray-100 text-gray-500"
              }`}>{task.status}</span>
            )}
            {task.due_date && (
              <span className={`text-xs ${task.due_date.split("T")[0] < new Date().toISOString().split("T")[0] && task.status !== "Done" ? "text-red-500" : "text-gray-400"}`}>
                Due: {new Date(task.due_date).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-gray-400">
          {task.started_at && (
            <span>Started: {new Date(task.started_at).toLocaleDateString("en-GB")}</span>
          )}
          {task.completed_at && (
            <span>Done: {new Date(task.completed_at).toLocaleDateString("en-GB")}</span>
          )}
          {task.archived_at && (
            <span>Archived: {new Date(task.archived_at).toLocaleDateString("en-GB")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProjectDetails(Number(id))
      .then((res) => {
        if (res?.project) {
          setData(res);
        } else {
          setError("Project not found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load project.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="py-24 text-center text-sm text-gray-400">Loading...</div>;
  if (error) return <div className="py-24 text-center text-sm text-red-500">{error}</div>;
  if (!data) return null;

  const { project, stats, tasks } = data;

  const statCards = [
    { label: "Total Tasks", value: stats.total_tasks, color: "text-gray-900" },
    { label: "To Do", value: stats.todo, color: "text-gray-600" },
    { label: "In Progress", value: stats.in_progress, color: "text-yellow-600" },
    { label: "Completed", value: stats.completed, color: "text-emerald-600" },
    { label: "Archived", value: stats.archived, color: "text-gray-400" },
  ];

  return (
    <div>
      {/* Back button + title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/projects")}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
        <div className="flex items-center gap-1.5 ml-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            project.priority === "High" ? "bg-red-50 text-red-600" :
            project.priority === "Low" ? "bg-gray-100 text-gray-500" :
            "bg-yellow-50 text-yellow-600"
          }`}>{project.priority}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            project.status === "Active" ? "bg-emerald-50 text-emerald-600" :
            project.status === "Completed" ? "bg-blue-50 text-blue-600" :
            "bg-gray-100 text-gray-500"
          }`}>{project.status}</span>
        </div>
        <button
          onClick={() => {
            exportProject(Number(id)).then((exportData) => {
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `project-${id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            });
          }}
          className="ml-auto text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150"
        >
          Export JSON
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete project and all tasks permanently?")) {
              deleteProject(Number(id)).then(() => navigate("/projects"));
            }
          }}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors duration-150"
        >
          Delete Project
        </button>
      </div>

      {/* Project info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        {project.description && (
          <p className="text-sm text-gray-700 mb-3">{project.description}</p>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          {project.client_name && <span>Client: <span className="text-gray-700 font-medium">{project.client_name}</span></span>}
          {project.start_date && <span>Start: <span className="text-gray-700">{project.start_date}</span></span>}
          {project.deadline && <span>Deadline: <span className="text-gray-700">{project.deadline}</span></span>}
          {project.created_at && <span>Created: <span className="text-gray-700">{new Date(project.created_at).toLocaleDateString("en-GB")}</span></span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 max-w-md">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Completion Rate</p>
          <p className="text-sm font-semibold text-gray-900">{stats.completion_rate}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(stats.completion_rate, 100)}%` }}
          />
        </div>
      </div>

      {/* Active Tasks */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Tasks</h2>
          <span className="text-xs text-gray-400 font-medium">{tasks.active.length}</span>
        </div>
        {tasks.active.length === 0 ? (
          <p className="text-xs text-gray-400">No active tasks.</p>
        ) : (
          <div className="flex flex-col gap-2 max-w-2xl">
            {tasks.active.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        )}
      </section>

      {/* Completed Tasks */}
      {tasks.completed.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed Tasks</h2>
            <span className="text-xs text-gray-400 font-medium">{tasks.completed.length}</span>
          </div>
          <div className="flex flex-col gap-2 max-w-2xl">
            {tasks.completed.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        </section>
      )}

      {/* Archived Tasks */}
      {tasks.archived.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Archived Tasks</h2>
            <span className="text-xs text-gray-400 font-medium">{tasks.archived.length}</span>
          </div>
          <div className="flex flex-col gap-2 max-w-2xl">
            {tasks.archived.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProjectDetailsPage;
