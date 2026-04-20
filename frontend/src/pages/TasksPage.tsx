import { useEffect, useState } from "react";
import { getTasks } from "../api/api";

function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    getTasks().then((data) => setTasks(data));
  }, []);

  return (
    <div>
      <h1>Tasks Page</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TasksPage;
