const BASE_URL = "http://127.0.0.1:8000";

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
  if (!response.ok) return null;
  return response.json();
}

export async function getProjects() {
  const response = await fetch(`${BASE_URL}/projects/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function createProject(data: object) {
  const response = await fetch(`${BASE_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.json();
}

export async function createTask(data: object) {
  const response = await fetch(`${BASE_URL}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateTaskStatus(id: number, data: object) {
  const response = await fetch(`${BASE_URL}/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  return response.json();
}