import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/tasks">Tasks</NavLink>
    </nav>
  );
}

export default Navbar;
