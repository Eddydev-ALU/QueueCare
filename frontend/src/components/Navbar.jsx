import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  patient: 'bg-green-100 text-green-800',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white font-bold text-xl tracking-tight">
              QueueCare
            </Link>
            <div className="flex gap-1">
              <Link to="/" className={linkClass('/')}>Dashboard</Link>
              <Link to="/appointments" className={linkClass('/appointments')}>Appointments</Link>
              <Link to="/queue" className={linkClass('/queue')}>Today's Queue</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-100 text-sm">{user.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-sm rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
