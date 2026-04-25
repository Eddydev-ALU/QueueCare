import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  served: 'bg-sage-100 text-sage-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function QueueArchive() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [dateQueues, setDateQueues] = useState({});
  const [fetching, setFetching] = useState(null);

  useEffect(() => {
    api.get('/queue/dates')
      .then((res) => setDates(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (date) => {
    if (expanded === date) {
      setExpanded(null);
      return;
    }
    setExpanded(date);
    if (dateQueues[date]) return;
    setFetching(date);
    try {
      const { data } = await api.get(`/queue/date/${date}`);
      setDateQueues((prev) => ({ ...prev, [date]: data }));
    } catch {
      setDateQueues((prev) => ({ ...prev, [date]: [] }));
    } finally {
      setFetching(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/queue" className="text-gray-400 hover:text-gray-600 text-sm">← Back to Queue</Link>
        <h1 className="text-2xl font-bold text-charcoal">Queue Archive</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-400 text-sm">Loading…</div>
      ) : dates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No past queue records yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map((d) => (
            <div key={d.date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Date header row */}
              <button
                onClick={() => toggle(d.date)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-charcoal text-sm">{formatDate(d.date)}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>{d.total} total</span>
                    <span className="text-sage-700">{d.served} served</span>
                    {d.pending > 0 && <span className="text-amber-600">{d.pending} pending</span>}
                    {d.cancelled > 0 && <span className="text-red-500">{d.cancelled} cancelled</span>}
                  </div>
                </div>
                <span className="text-gray-400 text-sm ml-4">
                  {expanded === d.date ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded queue */}
              {expanded === d.date && (
                <div className="border-t border-gray-100">
                  {fetching === d.date ? (
                    <div className="px-6 py-6 text-center text-gray-400 text-sm">Loading…</div>
                  ) : !dateQueues[d.date] || dateQueues[d.date].length === 0 ? (
                    <div className="px-6 py-6 text-center text-gray-400 text-sm">No records for this day.</div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {dateQueues[d.date].map((a) => (
                        <li key={a.id} className="px-6 py-3 flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-sage-50 text-sage-700 text-sm font-bold flex items-center justify-center shrink-0">
                            {a.queue_number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{a.patient_name}</p>
                            <p className="text-xs text-gray-500 truncate">{a.doctor} · {a.reason}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[a.status]}`}>
                            {a.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
