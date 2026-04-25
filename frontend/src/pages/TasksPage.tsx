import { useEffect, useState } from "react";
import { getTasks, updateTaskStatus, createTask, updateTask, getUsers, archiveTask, getArchivedTasks, getProjects } from "../api/api";
import type { UserSummary } from "../api/api";
import type { User } from "../App";

interface Project {
  id: number;
  title: string;
  description?: string;
}

function TasksPage({ user }: { user: User | null }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);
  const [showArchivedView, setShowArchivedView] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [completionNote, setCompletionNote] = useState("");
  const [pendingDoneTaskId, setPendingDoneTaskId] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState<number | "">("");

  useEffect(() => {
    if (user?.role === "admin") {
      getProjects().then(setProjects);
      getUsers().then(setUsers);
      getArchivedTasks().then(setArchivedTasks).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedProjectId !== "" ? { project_id: selectedProjectId as number } : undefined;
    getTasks(params)
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tasks.");
        setLoading(false);
      });
  }, [selectedProjectId]);

  const handleStatusChange = (taskId: number, newStatus: string) => {
  if (newStatus === "Done") {
    setPendingDoneTaskId(taskId);
    setCompletionNote("");
    return;
  }
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

  const handleSubmitDone = (taskId: number) => {
  if (!completionNote.trim()) {
    alert("Please enter a completion note.");
    return;
  }
  setUpdatingId(taskId);
  updateTaskStatus(taskId, { status: "Done", completion_note: completionNote })
    .then((updated) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t))
      );
      setPendingDoneTaskId(null);
      setCompletionNote("");
      setUpdatingId(null);
    })
    .catch(() => {
      setUpdatingId(null);
    });
};

  const handleArchiveTask = async (id: number) => {
    await archiveTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    getArchivedTasks().then(setArchivedTasks).catch(() => {});
  };

  const handleStartEdit = (task: any) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "Medium");
    setEditDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    setEditAssignedTo(task.assigned_to ?? "");
  };

  const handleSaveEdit = async (taskId: number) => {
    const updated = await updateTask(taskId, {
      title: editTitle,
      description: editDescription || null,
      priority: editPriority,
      due_date: editDueDate || null,
      assigned_to: editAssignedTo !== "" ? (editAssignedTo as number) : null,
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)));
    setEditingTaskId(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (projectId === "") {
      alert("Please select a project first");
      return;
    }
    await createTask({
      title,
      description: description || undefined,
      project_id: projectId as number,
      assigned_to: selectedUserId !== "" ? selectedUserId : null,
      priority,
      due_date: dueDate || undefined,
    });
    const params = selectedProjectId !== "" ? { project_id: selectedProjectId as number } : undefined;
    const data = await getTasks(params);
    setTasks(data);
    setTitle("");
    setDescription("");
    setProjectId("");
    setSelectedUserId("");
    setPriority("Medium");
    setDueDate("");
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
                <p className="text-xs text-gray-500 mt-0.5">Project: {projects.find((p) => p.id === task.project_id)?.title ?? `#${task.project_id}`}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                )}
                {task.assigned_to && (
                  <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                )}
                {task.started_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Started: {new Date(task.started_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
                {task.completed_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Completed: {new Date(task.completed_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
                {task.completion_note && (
                  <p className="text-xs text-gray-500 mt-0.5">Work done: {task.completion_note}</p>
                )}
                {task.archived_at && (
                  <p className="text-xs text-gray-400 mt-0.5">Archived: {new Date(task.archived_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${task.priority === "High" ? "bg-red-100 text-red-600" : task.priority === "Low" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-600"}`}>{task.priority}</span>
                  {task.due_date && (
                    <span className={`text-xs ${task.due_date.split("T")[0] < new Date().toISOString().split("T")[0] ? "text-red-500" : "text-gray-400"}`}>Due: {new Date(task.due_date).toLocaleDateString("en-GB")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        {user?.role === "admin" && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value !== "" ? Number(e.target.value) : "")}
            className="ml-auto px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        )}
      </div>
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
              className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150 border ${editingTaskId === task.id ? "" : "flex items-center justify-between gap-2"} ${
                task.assigned_to === user?.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200"
              }`}
            >
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
                  />
                  <div className="flex gap-2">
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value !== "" ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-150"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                    <p className="text-xs text-gray-500 mt-0.5">Project: {projects.find((p) => p.id === task.project_id)?.title ?? `#${task.project_id}`}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    )}
                    {task.assigned_to && (
                      <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${task.priority === "High" ? "bg-red-100 text-red-600" : task.priority === "Low" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-600"}`}>{task.priority}</span>
                      {task.due_date && (
                        <span className={`text-xs ${task.due_date.split("T")[0] < new Date().toISOString().split("T")[0] ? "text-red-500" : "text-gray-400"}`}>Due: {new Date(task.due_date).toLocaleDateString("en-GB")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="text-xs font-medium px-3 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      disabled={updatingId === task.id}
                      onClick={() => handleStatusChange(task.id, "In Progress")}
                      className="text-xs font-medium px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Start
                    </button>
                  </div>
                </>
              )}
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
              className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150 border ${editingTaskId === task.id ? "" : "flex items-center justify-between gap-2"} ${
                task.assigned_to === user?.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200"
              }`}
            >
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
                  />
                  <div className="flex gap-2">
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value !== "" ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-150"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                    <p className="text-xs text-gray-500 mt-0.5">Project: {projects.find((p) => p.id === task.project_id)?.title ?? `#${task.project_id}`}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    )}
                    {task.assigned_to && (
                      <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                    )}
                    {task.started_at && (
                      <p className="text-xs text-gray-400 mt-0.5">Started: {new Date(task.started_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${task.priority === "High" ? "bg-red-100 text-red-600" : task.priority === "Low" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-600"}`}>{task.priority}</span>
                      {task.due_date && (
                        <span className={`text-xs ${task.due_date.split("T")[0] < new Date().toISOString().split("T")[0] ? "text-red-500" : "text-gray-400"}`}>Due: {new Date(task.due_date).toLocaleDateString("en-GB")}</span>
                      )}
                    </div>
                  </div>
                  {pendingDoneTaskId === task.id ? (
                    <div className="flex flex-col gap-1.5 shrink-0 w-44">
                      <textarea
                        placeholder="Describe what was done, changes made, or issues resolved..."
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-1">
                        <button
                          disabled={updatingId === task.id}
                          onClick={() => handleSubmitDone(task.id)}
                          className="flex-1 text-xs font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => { setPendingDoneTaskId(null); setCompletionNote(""); }}
                          className="flex-1 text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
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
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="text-xs font-medium px-3 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
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
                className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150 border ${editingTaskId === task.id ? "" : "flex items-center justify-between gap-2"} ${
                  task.assigned_to === user?.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white border-gray-200"
                }`}
              >
                {editingTaskId === task.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
                    />
                    <div className="flex gap-2">
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <select
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value !== "" ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-150"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="flex-1 text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-gray-500 font-medium line-through">{task.title}</span>
                      <p className="text-xs text-gray-500 mt-0.5">Project: {projects.find((p) => p.id === task.project_id)?.title ?? `#${task.project_id}`}</p>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                      )}
                      {task.assigned_to && (
                        <p className="text-xs text-gray-400 mt-0.5">Assigned to: {task.assigned_to === user?.id ? "You" : users.find((u) => u.id === task.assigned_to)?.full_name}</p>
                      )}
                      {task.started_at && (
                        <p className="text-xs text-gray-400 mt-0.5">Started: {new Date(task.started_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                      )}
                      {task.completed_at && (
                        <p className="text-xs text-gray-400 mt-0.5">Completed: {new Date(task.completed_at).toLocaleString("en-GB", { timeZone: "Europe/Belgrade", hour12: false })}</p>
                      )}
                      {task.completion_note && (
                        <p className="text-xs text-gray-500 mt-0.5">Work done: {task.completion_note}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${task.priority === "High" ? "bg-red-100 text-red-600" : task.priority === "Low" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-600"}`}>{task.priority}</span>
                        {task.due_date && (
                          <span className={`text-xs ${task.due_date.split("T")[0] < new Date().toISOString().split("T")[0] ? "text-red-500" : "text-gray-400"}`}>Due: {new Date(task.due_date).toLocaleDateString("en-GB")}</span>
                        )}
                      </div>
                    </div>
                    {user?.role === "admin" && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="text-xs font-medium px-3 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-150"
                        >
                          Edit
                        </button>
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
                  </>
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
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Task description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
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
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
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
