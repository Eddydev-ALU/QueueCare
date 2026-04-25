import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/doctors').then((res) => {
      setDoctors(res.data);
      if (res.data.length > 0) setForm((f) => ({ ...f, doctor: res.data[0].name }));
    }).catch(() => {});
  }, []);

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
        <h1 className="text-2xl font-bold text-charcoal">Book Appointment</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            {doctors.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5">
                No doctors available yet. Ask an admin to add doctors first.
              </p>
            ) : (
              <select
                required
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent bg-white"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}{d.specialty ? ` — ${d.specialty}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <input
              type="date"
              required
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent resize-none"
              placeholder="Describe the reason for your visit…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || doctors.length === 0}
              className="flex-1 bg-charcoal hover:bg-sage-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Booking…' : 'Book Appointment'}
            </button>
            <Link
              to="/appointments"
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
