const BASE_URL = "https://project-management-system-lxx8.onrender.com";

function getToken(): string {
  return localStorage.getItem("token") ?? "";
}

export async function registerUser(
  full_name: string,
  email: string,
  password: string
) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password }),
  });
  return response.json();
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    localStorage.removeItem("token");
    return null;
  }
  return response.json();
}

export async function getProjects() {
  const response = await fetch(`${BASE_URL}/projects/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function createProject(data: {
  title: string;
  description?: string;
  client_name?: string;
  start_date?: string;
  deadline?: string;
  priority?: string;
  status?: string;
}) {
  const response = await fetch(`${BASE_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getTasks(params?: { project_id?: number }) {
  const query = new URLSearchParams();
  if (params?.project_id !== undefined) {
    query.set("project_id", String(params.project_id));
  }
  const queryString = query.toString();
  const url = `${BASE_URL}/tasks/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function createTask(data: {
  title: string;
  description?: string;
  project_id: number;
  assigned_to?: number | null;
  priority?: string;
  due_date?: string;
}) {
  const response = await fetch(`${BASE_URL}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function updateTask(id: number, data: {
  title?: string;
  description?: string | null;
  priority?: string;
  due_date?: string | null;
  assigned_to?: number | null;
}) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function updateTaskStatus(id: number, data: object) {
  const response = await fetch(`${BASE_URL}/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function deleteTaskPermanent(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/tasks/${id}/permanent`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function deleteProject(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function archiveTask(id: number) {
  const response = await fetch(`${BASE_URL}/tasks/${id}/archive`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function getArchivedTasks() {
  const response = await fetch(`${BASE_URL}/tasks/archived`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export interface UserSummary {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export async function getUsers(): Promise<UserSummary[]> {
  const response = await fetch(`${BASE_URL}/users/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function getTaskComments(taskId: number) {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/comments`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function createComment(data: { content: string; task_id: number }) {
  const response = await fetch(`${BASE_URL}/comments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getTaskActivity(taskId: number) {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/activity`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function getDashboardStats(projectId?: number) {
  const url = projectId !== undefined
    ? `${BASE_URL}/dashboard/stats?project_id=${projectId}`
    : `${BASE_URL}/dashboard/stats`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function getProjectDetails(id: number) {
  const response = await fetch(`${BASE_URL}/projects/${id}/details`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function exportProject(id: number) {
  const response = await fetch(`${BASE_URL}/projects/${id}/export`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}