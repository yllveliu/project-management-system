import { useEffect, useState } from "react";
import { getTasks, updateTaskStatus, createTask, getUsers, archiveTask, getArchivedTasks } from "../api/api";
import type { UserSummary } from "../api/api";
import type { User } from "../App";

function TasksPage({ user }: { user: User | null }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);
  const [showArchivedView, setShowArchivedView] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");

  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
        setLoading(false);
        if (user?.role === "admin") {
          getUsers().then(setUsers);
          getArchivedTasks().then(setArchivedTasks).catch(() => {});
        }
      })
      .catch(() => {
        setError("Failed to load tasks.");
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (taskId: number, newStatus: string) => {
  setUpdatingId(taskId);
  updateTaskStatus(taskId, { status: newStatus })
    .then((updated) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t))
      );
      setUpdatingId(null);
    })
    .catch(() => {
      setUpdatingId(null);
    });
};

  const handleArchiveTask = async (id: number) => {
    await archiveTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;
    await createTask({
      title,
      project_id: Number(projectId),
      assigned_to: selectedUserId !== "" ? selectedUserId : null,
    });
    const data = await getTasks();
    setTasks(data);
    setTitle("");
    setProjectId("");
    setSelectedUserId("");
  };

  const todo = tasks.filter((t) => t.status === "To Do");
  const inProgress = tasks.filter((t) => t.status === "In Progress");
  const done = tasks.filter((t) => t.status === "Done");

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-sm text-gray-400">Loading...</div>
  );
  if (error) return (
    <div className="flex items-center justify-center py-24 text-sm text-red-500">{error}</div>
  );

  if (showArchivedView && user?.role === "admin") {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowArchivedView(false)}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150"
          >
            ← Back to Tasks
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Archived Tasks</h1>
          <span className="text-xs text-gray-400 font-medium">{archivedTasks.length}</span>
        </div>
        {archivedTasks.length === 0 ? (
          <p className="text-sm text-gray-400">No archived tasks.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {archivedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg p-3 shadow-sm border bg-white border-gray-200"
              >
                <span className="text-sm text-gray-400 font-medium line-through">{task.title}</span>
                {task.assigned_to && (
                  <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                )}
                {task.started_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Started: {new Date(task.started_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
                {task.completed_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Completed: {new Date(task.completed_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
                {task.archived_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Archived: {new Date(task.archived_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* To Do */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">To Do</h2>
            <span className="ml-auto text-xs text-gray-400 font-medium">{todo.length}</span>
          </div>
          {todo.map((task) => (
            <div
              key={task.id}
              className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150 flex items-center justify-between gap-2 border ${
                task.assigned_to === user?.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div>
                <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                {task.assigned_to && (
                  <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                )}
              </div>
              <button
                disabled={updatingId === task.id}
                onClick={() => handleStatusChange(task.id, "In Progress")}
                className="shrink-0 text-xs font-medium px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start
              </button>
            </div>
          ))}
          {todo.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
          )}
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Progress</h2>
            <span className="ml-auto text-xs text-gray-400 font-medium">{inProgress.length}</span>
          </div>
          {inProgress.map((task) => (
            <div
              key={task.id}
              className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150 flex items-center justify-between gap-2 border ${
                task.assigned_to === user?.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div>
                <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                {task.assigned_to && (
                  <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                )}
                {task.started_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Started: {new Date(task.started_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={updatingId === task.id}
                  onClick={() => handleStatusChange(task.id, "To Do")}
                  className="text-xs font-medium px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  disabled={updatingId === task.id}
                  onClick={() => handleStatusChange(task.id, "Done")}
                  className="text-xs font-medium px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Done
                </button>
              </div>
            </div>
          ))}
          {inProgress.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
          )}
        </div>

      </div>

      {/* Completed Tasks */}
      {done.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed Tasks</h2>
            <span className="ml-2 text-xs text-gray-400 font-medium">{done.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {done.map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150 flex items-center justify-between gap-2 border ${
                  task.assigned_to === user?.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <span className="text-sm text-gray-500 font-medium line-through">{task.title}</span>
                  {task.assigned_to && (
                    <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                  )}
                  {task.started_at && (
                    <p className="text-xs text-gray-400 mt-0.5">Started: {new Date(task.started_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                  )}
                  {task.completed_at && (
                    <p className="text-xs text-gray-400 mt-0.5">Completed: {new Date(task.completed_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                  )}
                </div>
                {user?.role === "admin" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={updatingId === task.id}
                      onClick={() => handleStatusChange(task.id, "In Progress")}
                      className="text-xs font-medium px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Reopen
                    </button>
                    <button
                      onClick={() => handleArchiveTask(task.id)}
                      className="text-xs font-medium px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150"
                    >
                      Archive
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {user?.role === "admin" && (
        <div className="mt-6">
          <button
            onClick={() => setShowArchivedView(true)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors duration-150"
          >
            View Archived Tasks ({archivedTasks.length})
          </button>
        </div>
      )}

      {user?.role === "admin" && (
        <section className="mt-8 max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">New Task</h2>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Project ID</label>
                <input
                  type="number"
                  placeholder="Project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Assign to</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full mt-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
              >
                Create Task
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

export default TasksPage;
