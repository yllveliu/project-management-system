import { useEffect, useState } from "react";
import { getTasks } from "../api/api";

function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    getTasks().then((data) => setTasks(data));
  }, []);

  const todo = tasks.filter((t) => t.status === "To Do");
  const inProgress = tasks.filter((t) => t.status === "In Progress");
  const done = tasks.filter((t) => t.status === "Done");

  return (
    <div>
      <h1>Tasks Page</h1>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <h2>To Do</h2>
          <ul>
            {todo.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h2>In Progress</h2>
          <ul>
            {inProgress.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Done</h2>
          <ul>
            {done.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
