import { useEffect, useState } from 'react';
import api from '../api';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', specialty: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/doctors')
      .then((res) => setDoctors(res.data))
      .catch(() => setError('Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      const { data } = await api.post('/doctors', form);
      setDoctors((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', specialty: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add doctor');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id, name) => {
    if (!confirm(`Remove Dr. ${name} from the system?`)) return;
    try {
      await api.delete(`/doctors/${id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove doctor');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Manage Doctors</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Add or remove doctors available for appointments.</p>
      </div>

      {/* Add doctor form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-charcoal mb-4">Add New Doctor</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent"
            placeholder="Doctor name (e.g. Dr. Sarah Johnson)"
          />
          <input
            type="text"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            className="w-48 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent"
            placeholder="Specialty (optional)"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 bg-charcoal hover:bg-sage-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shrink-0"
          >
            {adding ? 'Adding…' : 'Add Doctor'}
          </button>
        </form>
      </div>

      {/* Doctor list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-charcoal">
            Registered Doctors
            <span className="ml-2 text-sm font-normal text-gray-400">({doctors.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No doctors added yet. Add the first one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {doctors.map((doc) => (
              <li key={doc.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                  {doc.specialty && (
                    <p className="text-xs text-gray-500 mt-0.5">{doc.specialty}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(doc.id, doc.name)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
