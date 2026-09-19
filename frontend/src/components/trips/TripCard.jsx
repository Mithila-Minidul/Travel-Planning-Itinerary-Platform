import React from 'react';
import { CalendarToday, Delete, Edit, Visibility } from '@mui/icons-material';

const STATUS_STYLES = {
  Draft: 'bg-gray-100 text-gray-700',
  Generating: 'bg-indigo-50 text-indigo-700',
  PendingReview: 'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  RevisionRequested: 'bg-orange-100 text-orange-700',
};

const statusLabel = (status) => {
  if (typeof status === 'number') {
    return ['Draft', 'Generating', 'Pending Review', 'Approved', 'Rejected', 'Revision Requested'][status] || `Status ${status}`;
  }
  return String(status || 'Draft').replace(/([a-z])([A-Z])/g, '$1 $2');
};

const TripCard = ({ trip, onView, onEdit, onDelete }) => {
  const label = statusLabel(trip.status);
  const normalizedStatus = typeof trip.status === 'number'
    ? ['Draft', 'Generating', 'PendingReview', 'Approved', 'Rejected', 'RevisionRequested'][trip.status]
    : String(trip.status || 'Draft');
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.Draft;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="h-2 bg-indigo-600" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-900">{trip.title || 'Untitled trip'}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{trip.objective || 'No objective provided.'}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}>
            {label}
          </span>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarToday className="text-indigo-600" fontSize="small" />
            <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '—'} – {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '—'}</span>
          </div>
          {trip.constraints && <p className="mt-2 line-clamp-2 text-xs text-slate-500">Constraints: {trip.constraints}</p>}
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => onView(trip.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Visibility fontSize="small" /> View
          </button>
          {onEdit && (
            <button type="button" onClick={() => onEdit(trip.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50">
              <Edit fontSize="small" /> Edit
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={() => onDelete(trip)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
              <Delete fontSize="small" /> Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default TripCard;
