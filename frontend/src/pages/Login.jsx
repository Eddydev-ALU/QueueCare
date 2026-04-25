import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
      <div className="w-full max-w-225 min-h-135 rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT — Form Panel */}
        <div className="flex-1 bg-white flex flex-col px-12 py-10">
          <div className="text-xl font-bold tracking-tight text-charcoal">
            Queue<span className="text-sage-600">Care</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-charcoal mt-2">Hello!</h1>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xs">
              To log in to your account, enter your email address and password.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-600 border-0"
                placeholder="Your email address"
              />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-100 rounded-xl px-4 py-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-600 border-0"
                placeholder="Your password"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal hover:bg-sage-800 disabled:opacity-60 text-white font-medium py-4 rounded-full mt-2 transition-colors cursor-pointer"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-sage-600 font-medium hover:underline">
              Register
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
              Efficient care starts with a well-managed queue
            </h2>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Reduce patient wait times and improve appointment flow for better healthcare outcomes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
