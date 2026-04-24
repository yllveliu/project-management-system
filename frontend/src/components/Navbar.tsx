import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../App';

function Navbar({ user, setUser }: { user: User | null; setUser: (user: User | null) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900 tracking-tight select-none">
          ProjectFlow
        </span>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink to="/projects" className={linkClass}>
                  Projects
                </NavLink>
              )}
              <NavLink to="/tasks" className={linkClass}>
                Tasks
              </NavLink>
              <span className="text-sm text-gray-500">{user.full_name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `text-sm font-medium px-4 py-1.5 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
