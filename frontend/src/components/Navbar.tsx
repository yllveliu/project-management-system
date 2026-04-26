import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { User } from '../App';

function Navbar({ user, setUser }: { user: User | null; setUser: (user: User | null) => void }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900 tracking-tight select-none">
          ProjectFlow
        </span>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-x-4 ml-auto">
          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
              )}
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="sm:hidden text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150"
          aria-label="Toggle menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
                  Dashboard
                </NavLink>
              )}
              {user.role === "admin" && (
                <NavLink to="/projects" className={linkClass} onClick={closeMenu}>
                  Projects
                </NavLink>
              )}
              <NavLink to="/tasks" className={linkClass} onClick={closeMenu}>
                Tasks
              </NavLink>
              <span className="text-sm text-gray-500">{user.full_name}</span>
              <button
                onClick={handleLogout}
                className="text-left text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `text-sm font-medium px-4 py-1.5 rounded-lg transition-colors duration-150 text-center ${
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
      )}
    </nav>
  );
}

export default Navbar;
