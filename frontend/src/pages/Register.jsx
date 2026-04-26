import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(ellipse at 15% 85%, rgba(74,124,94,0.55) 0%, transparent 55%), ' +
          'radial-gradient(ellipse at 85% 15%, rgba(28,43,43,0.45) 0%, transparent 45%), ' +
          'radial-gradient(ellipse at 75% 80%, rgba(92,144,112,0.35) 0%, transparent 50%), ' +
          'linear-gradient(145deg, #c8dfd0 0%, #a0c4b0 30%, #7aaf94 65%, #4a7c5e 100%)',
      }}
    >
      <div className="w-full max-w-225 rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT — Form Panel */}
        <div className="flex-1 bg-white flex flex-col px-12 py-10">
          <div className="text-xl font-bold tracking-tight text-charcoal">
            Queue<span className="text-sage-600">Care</span>
          </div>

          <div className="flex-1 flex flex-col justify-center mt-4">
            <h1 className="text-4xl font-bold text-charcoal">Join Us!</h1>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xs">
              Create your account to manage appointments and patient care.
            </p>

            {error && (
              <div data-testid="error-message" className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                data-testid="name-input"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-600 border-0"
                placeholder="Full name"
              />
              <input
                data-testid="email-input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-600 border-0"
                placeholder="Your email address"
              />
              <input
                data-testid="password-input"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-600 border-0"
                placeholder="Password (min. 6 characters)"
              />
              <select
                data-testid="role-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-600 border-0"
              >
                <option value="patient">Patient</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <button
                data-testid="submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal hover:bg-sage-800 disabled:opacity-60 text-white font-medium py-4 rounded-full mt-2 transition-colors cursor-pointer"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sage-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* RIGHT — Botanical Panel */}
        <div
          className="hidden md:flex flex-1 relative items-center justify-center p-8"
          style={{
            background:
              'radial-gradient(ellipse at 20% 80%, rgba(28,51,40,0.9) 0%, transparent 60%), ' +
              'radial-gradient(ellipse at 80% 20%, rgba(74,124,94,0.7) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 50% 50%, rgba(44,79,58,0.5) 0%, transparent 70%), ' +
              'linear-gradient(160deg, #1C3328 0%, #2C4F3A 40%, #3A6349 70%, #4A7C5E 100%)',
          }}
        >
          <div
            className="relative z-10 rounded-2xl p-8 text-center text-white max-w-xs"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <h2 className="text-xl font-semibold leading-snug">
              Join a smarter way to manage patient care
            </h2>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Streamline your clinic&apos;s appointment flow and deliver better outcomes, every day.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
