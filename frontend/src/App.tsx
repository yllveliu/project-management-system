import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { getMe } from './api/api';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

function ProtectedRoute({
  user,
  loading,
  children,
}: {
  user: User | null;
  loading: boolean;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((data) => {
      setUser(data ?? null);
      setLoading(false);
    });
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Navbar user={user} setUser={setUser} />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route
              path="/projects"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  {user?.role === "admin" ? <ProjectsPage /> : <Navigate to="/tasks" replace />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <TasksPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  {user?.role === "admin" ? <ProjectDetailsPage /> : <Navigate to="/tasks" replace />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  {user?.role === "admin" ? <DashboardPage user={user} /> : <Navigate to="/tasks" replace />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={loading ? null : user ? <Navigate to={user.role === "admin" ? "/projects" : "/tasks"} replace /> : <LoginPage setUser={setUser} />}
            />
            <Route
              path="/register"
              element={loading ? null : user ? <Navigate to={user.role === "admin" ? "/projects" : "/tasks"} replace /> : <RegisterPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;