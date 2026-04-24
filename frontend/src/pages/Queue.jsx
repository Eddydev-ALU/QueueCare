import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  served: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Queue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(null);

  const load = () => {
    api.get('/queue/today')
      .then((res) => setQueue(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleServe = async (id) => {
    setServing(id);
    try {
      await api.patch(`/queue/${id}/serve`);
      setQueue((prev) => prev.map((a) => a.id === id ? { ...a, status: 'served' } : a));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setServing(null);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const pending = queue.filter((a) => a.status === 'pending').length;
  const served = queue.filter((a) => a.status === 'served').length;

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Queue</h1>
        <p className="text-gray-500 mt-0.5">{today}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{queue.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Waiting</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pending}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Served</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{served}</p>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No appointments scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
                a.status === 'served' ? 'border-green-200 opacity-75' : 'border-gray-100 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold ${
                a.status === 'served' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-700'
              }`}>
                {a.queue_number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{a.patient_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{a.doctor}</p>
                <p className="text-sm text-gray-400">{a.reason}</p>
              </div>

              {(user.role === 'staff' || user.role === 'admin') && a.status === 'pending' && (
                <button
                  onClick={() => handleServe(a.id)}
                  disabled={serving === a.id}
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {serving === a.id ? 'Marking…' : 'Mark Served'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
