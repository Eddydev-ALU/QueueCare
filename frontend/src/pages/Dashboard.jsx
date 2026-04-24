import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  served: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/appointments'), api.get('/queue/today')])
      .then(([apptRes, queueRes]) => {
        setAppointments(apptRes.data);
        setQueue(queueRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    served: appointments.filter((a) => a.status === 'served').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  const recent = [...appointments].slice(0, 5);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Loading…</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
          <p className="text-gray-500 mt-0.5 capitalize">{user.role} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link
          to="/appointments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Served', value: counts.served, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
            <Link to="/appointments" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No appointments yet.</p>
            ) : recent.map((a) => (
              <div key={a.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.doctor}</p>
                  <p className="text-xs text-gray-500">{a.date}{user.role !== 'patient' && ` · ${a.patient_name}`}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Today's Queue</h2>
            <Link to="/queue" className="text-blue-600 text-sm hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {queue.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No patients in queue today.</p>
            ) : queue.map((a) => (
              <div key={a.id} className="px-6 py-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {a.queue_number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.patient_name}</p>
                  <p className="text-xs text-gray-500 truncate">{a.doctor} · {a.reason}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
