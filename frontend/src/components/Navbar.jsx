import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-sage-100 text-sage-800',
  patient: 'bg-sage-50 text-sage-700',
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
    `px-3 text-sm font-medium transition-colors h-full flex items-center border-b-2 ${
      pathname === path
        ? 'text-white border-white'
        : 'text-white/60 border-transparent hover:text-white'
    }`;

  return (
    <nav className="bg-charcoal shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 relative">
          {/* Logo — left */}
          <Link to="/" className="font-bold text-xl tracking-tight shrink-0">
            <span className="text-white">Queue</span>
            <span className="text-sage-600">Care</span>
          </Link>

          {/* Nav links — absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex h-full">
            <Link to="/" className={linkClass('/')}>Dashboard</Link>
            <Link to="/appointments" className={linkClass('/appointments')}>Appointments</Link>
            <Link to="/queue" className={linkClass('/queue')}>Today&apos;s Queue</Link>
            {(user.role === 'staff' || user.role === 'admin') && (
              <Link to="/queue/archive" className={linkClass('/queue/archive')}>Archive</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/doctors" className={linkClass('/doctors')}>Doctors</Link>
            )}
          </div>

          {/* User info — right */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-white/70 text-sm">{user.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-md transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
