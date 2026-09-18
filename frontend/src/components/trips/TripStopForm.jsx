import React, { useEffect, useState } from 'react';

const emptyForm = { destinationId: '', experienceId: '', stopOrder: '', plannedArrival: '', plannedDeparture: '', notes: '' };

const toInputDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const TripStopForm = ({ initialValues, destinations, experiences, loading, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setForm({
        destinationId: initialValues.destinationId || '',
        experienceId: initialValues.experienceId || '',
        stopOrder: initialValues.stopOrder ?? '',
        plannedArrival: toInputDateTime(initialValues.plannedArrival),
        plannedDeparture: toInputDateTime(initialValues.plannedDeparture),
        notes: initialValues.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.destinationId) {
      setError('Destination is required.');
      return;
    }
    if (form.plannedArrival && form.plannedDeparture && new Date(form.plannedArrival) >= new Date(form.plannedDeparture)) {
      setError('Planned departure must be after planned arrival.');
      return;
    }
    if (form.notes.length > 1000) {
      setError('Notes must be 1000 characters or fewer.');
      return;
    }
    setError('');
    onSubmit({
      destinationId: form.destinationId,
      experienceId: form.experienceId || null,
      stopOrder: form.stopOrder === '' ? null : Number(form.stopOrder),
      plannedArrival: form.plannedArrival ? new Date(form.plannedArrival).toISOString() : null,
      plannedDeparture: form.plannedDeparture ? new Date(form.plannedDeparture).toISOString() : null,
      notes: form.notes.trim() || null,
    });
  };

  const input = 'w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <form onSubmit={submit} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{initialValues ? 'Edit Stop' : 'Add Stop'}</h3>
          <p className="mt-1 text-xs text-slate-500">The backend performs the final itinerary validation.</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Destination *</label>
          <select name="destinationId" value={form.destinationId} onChange={change} className={input}>
            <option value="">Select destination</option>
            {destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Experience</label>
          <select name="experienceId" value={form.experienceId} onChange={change} className={input}>
            <option value="">No specific experience</option>
            {experiences.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Stop order</label>
          <input type="number" min="1" name="stopOrder" value={form.stopOrder} onChange={change} className={input} placeholder="1" />
        </div>
        <div />
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Planned arrival</label>
          <input type="datetime-local" name="plannedArrival" value={form.plannedArrival} onChange={change} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Planned departure</label>
          <input type="datetime-local" name="plannedDeparture" value={form.plannedDeparture} onChange={change} className={input} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
          <textarea name="notes" value={form.notes} onChange={change} maxLength={1000} rows={2} className={input} />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Saving...' : initialValues ? 'Save Stop' : 'Add Stop'}</button>
      </div>
    </form>
  );
};

export default TripStopForm;
