import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  served: 'bg-sage-100 text-sage-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/appointments')
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">
          {user.role === 'patient' ? 'My Appointments' : 'All Appointments'}
        </h1>
        <Link
          data-testid="new-appointment-btn"
          to="/appointments/new"
          className="bg-charcoal hover:bg-sage-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Appointment
        </Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No appointments found.</p>
          <Link to="/appointments/new" className="mt-3 inline-block text-sage-600 hover:underline text-sm">
            Book your first appointment
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table data-testid="appointments-table" className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                {user.role !== 'patient' && <th className="px-4 py-3 text-left font-medium text-gray-600">Patient</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-600">Doctor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Queue</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a, i) => (
                <tr key={a.id} data-testid="appointment-row" data-appointment-id={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  {user.role !== 'patient' && <td className="px-4 py-3 font-medium text-gray-900">{a.patient_name}</td>}
                  <td className="px-4 py-3 text-gray-700">{a.doctor}</td>
                  <td className="px-4 py-3 text-gray-700">{a.date}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.reason}</td>
                  <td className="px-4 py-3">
                    <span data-testid="appointment-status" className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">#{a.queue_number}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {a.status === 'pending' && (
                        <>
                          <button
                            data-testid="edit-btn"
                            onClick={() => navigate(`/appointments/${a.id}/edit`)}
                            className="text-sage-600 hover:text-sage-800 text-xs font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            data-testid="cancel-btn"
                            onClick={() => handleDelete(a.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
