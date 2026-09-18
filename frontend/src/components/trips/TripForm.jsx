import React, { useEffect, useState } from 'react';

const emptyForm = { title: '', objective: '', startDate: '', endDate: '', constraints: '' };

const toInputDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const TripForm = ({ initialValues, loading, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        objective: initialValues.objective || '',
        startDate: toInputDateTime(initialValues.startDate),
        endDate: toInputDateTime(initialValues.endDate),
        constraints: initialValues.constraints || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (form.title.length > 200) next.title = 'Title must be 200 characters or fewer.';
    if (!form.startDate) next.startDate = 'Start date is required.';
    if (!form.endDate) next.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      next.endDate = 'End date must be after the start date.';
    }
    if (form.objective.length > 1000) next.objective = 'Objective must be 1000 characters or fewer.';
    if (form.constraints.length > 2000) next.constraints = 'Constraints must be 2000 characters or fewer.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      objective: form.objective.trim() || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      constraints: form.constraints.trim() || null,
    });
  };

  const fieldClass = (name) => `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 ${errors[name] ? 'border-red-300' : 'border-slate-200'}`;

  return (
    <form onSubmit={submit} className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{initialValues ? 'Edit Trip' : 'Create a New Trip'}</h2>
        <p className="mt-1 text-sm text-slate-500">Set the objective and dates first. Stops can be added after the trip is created.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="trip-title" className="mb-1 block text-sm font-medium text-gray-700">Trip title *</label>
          <input id="trip-title" name="title" value={form.title} onChange={change} maxLength={200} className={fieldClass('title')} placeholder="e.g. Cultural Triangle Weekend" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="trip-objective" className="mb-1 block text-sm font-medium text-gray-700">Objective</label>
          <textarea id="trip-objective" name="objective" value={form.objective} onChange={change} maxLength={1000} rows={3} className={fieldClass('objective')} placeholder="What should this trip achieve?" />
          {errors.objective && <p className="mt-1 text-xs text-red-600">{errors.objective}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="trip-start" className="mb-1 block text-sm font-medium text-gray-700">Start date *</label>
            <input id="trip-start" type="datetime-local" name="startDate" value={form.startDate} onChange={change} className={fieldClass('startDate')} />
            {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="trip-end" className="mb-1 block text-sm font-medium text-gray-700">End date *</label>
            <input id="trip-end" type="datetime-local" name="endDate" value={form.endDate} onChange={change} className={fieldClass('endDate')} />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="trip-constraints" className="mb-1 block text-sm font-medium text-gray-700">Constraints</label>
          <textarea id="trip-constraints" name="constraints" value={form.constraints} onChange={change} maxLength={2000} rows={3} className={fieldClass('constraints')} placeholder="Budget, accessibility, travel preferences, timing limits..." />
          {errors.constraints && <p className="mt-1 text-xs text-red-600">{errors.constraints}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Saving...' : initialValues ? 'Save Changes' : 'Create Trip'}</button>
      </div>
    </form>
  );
};

export default TripForm;
