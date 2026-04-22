import { useEffect, useState } from "react";
import { getTasks, updateTaskStatus } from "../api/api";

function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
  getTasks().then((data) => {
    setTasks(data);
    setLoading(false);
  }).catch(() => {
    setError("Failed to load tasks.");
    setLoading(false);
  });
}, []);

  const handleStatusChange = (taskId: number, newStatus: string) => {
  setUpdatingId(taskId);
  updateTaskStatus(taskId, { status: newStatus })
    .then(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setUpdatingId(null);
    })
    .catch(() => {
      setUpdatingId(null);
    });
};

  const todo = tasks.filter((t) => t.status === "To Do");
  const inProgress = tasks.filter((t) => t.status === "In Progress");
  const done = tasks.filter((t) => t.status === "Done");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Tasks Page</h1>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1, padding: "1rem", background: "#f9f9f9" }}>
          <h2>To Do</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {todo.map((task) => (
              <li key={task.id} style={{ marginBottom: "0.5rem" }}>
                {task.title}{" "}
                <button disabled={updatingId === task.id} onClick={() => handleStatusChange(task.id, "In Progress")}>Start</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, padding: "1rem", background: "#f9f9f9" }}>
          <h2>In Progress</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {inProgress.map((task) => (
              <li key={task.id} style={{ marginBottom: "0.5rem" }}>
                {task.title}{" "}
                <button disabled={updatingId === task.id} onClick={() => handleStatusChange(task.id, "To Do")}>Back</button>{" "}
                <button disabled={updatingId === task.id} onClick={() => handleStatusChange(task.id, "Done")}>Done</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, padding: "1rem", background: "#f9f9f9" }}>
          <h2>Done</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {done.map((task) => (
              <li key={task.id} style={{ marginBottom: "0.5rem" }}>
                {task.title}{" "}
                <button disabled={updatingId === task.id} onClick={() => handleStatusChange(task.id, "In Progress")}>Reopen</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
