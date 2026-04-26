import { useEffect, useState } from "react";
import { getDashboardStats, getProjects } from "../api/api";
import type { User } from "../App";

interface Stats {
  total_tasks: number;
  todo: number;
  in_progress: number;
  completed: number;
  archived: number;
  overdue: number;
  completion_rate: number;
  overdue_tasks: { id: number; title: string; due_date: string | null }[];
}

function DashboardPage({ user }: { user: User | null }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ id: number; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");

  useEffect(() => {
    getProjects().then((data) => {
      if (Array.isArray(data)) setProjects(data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getDashboardStats(selectedProjectId !== "" ? selectedProjectId : undefined)
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard.");
        setLoading(false);
      });
  }, [selectedProjectId]);

  if (loading) return <div className="py-24 text-center text-sm text-gray-400">Loading...</div>;
  if (error) return <div className="py-24 text-center text-sm text-red-500">{error}</div>;
  if (!stats) return null;

  const cards = [
    { label: "Total Tasks", value: stats.total_tasks, color: "text-gray-900", cardClass: "" },
    { label: "To Do", value: stats.todo, color: "text-gray-600", cardClass: "" },
    { label: "In Progress", value: stats.in_progress, color: "text-yellow-600", cardClass: "" },
    { label: "Completed", value: stats.completed, color: "text-emerald-600", cardClass: "" },
    { label: "Archived", value: stats.archived, color: "text-gray-400", cardClass: "" },
    {
      label: "Overdue",
      value: stats.overdue,
      color: stats.overdue > 0 ? "text-red-600" : "text-gray-400",
      cardClass: stats.overdue > 0 ? "border-red-300 bg-red-50" : "",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value !== "" ? Number(e.target.value) : "")}
          className="ml-auto w-full sm:w-auto px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Overdue warning banner */}
      {stats.overdue > 0 && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <span className="text-sm font-semibold">⚠ You have {stats.overdue} overdue {stats.overdue === 1 ? "task" : "tasks"}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl border shadow-sm p-4 ${card.cardClass || "border-gray-200"}`}>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 w-full max-w-md">
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

      {/* Overdue tasks list */}
      {stats.overdue_tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full max-w-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Overdue Tasks</h2>
          <div className="flex flex-col gap-2">
            {stats.overdue_tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-800">{task.title}</span>
                <span className="text-xs text-red-500 shrink-0">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB") : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.overdue_tasks.length === 0 && (
        <p className="text-sm text-gray-400">No overdue tasks.</p>
      )}
    </div>
  );
}

export default DashboardPage;
