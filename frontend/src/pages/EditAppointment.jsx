import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ doctor: '', date: '', reason: '' });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/appointments/${id}`),
      api.get('/doctors'),
    ]).then(([apptRes, docRes]) => {
      const { doctor, date, reason } = apptRes.data;
      setForm({ doctor, date, reason });
      setDoctors(docRes.data);
    }).catch(() => setError('Failed to load appointment'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/appointments/${id}`, form);
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center items-center h-64 text-gray-500">Loading…</div>;

  // If the current doctor isn't in the doctors list (e.g. was removed), add it as an option
  const doctorOptions = doctors.some((d) => d.name === form.doctor)
    ? doctors
    : [{ id: 0, name: form.doctor, specialty: 'Previous doctor' }, ...doctors];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/appointments" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-charcoal">Edit Appointment</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              required
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent bg-white"
            >
              {doctorOptions.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}{d.specialty ? ` — ${d.specialty}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <input
              type="date"
              required
              value={form.date}
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
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-charcoal hover:bg-sage-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Saving…' : 'Save Changes'}
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
