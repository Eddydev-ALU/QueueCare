import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/appointments', form);
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/appointments" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <input
              type="text"
              required
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dr. Sarah Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <input
              type="date"
              required
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe the reason for your visit…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Booking…' : 'Book Appointment'}
            </button>
            <Link
              to="/appointments"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
