import React, { useEffect, useMemo, useState } from 'react';
import { Add, ChevronLeft, ChevronRight, Refresh, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripAPI } from '../api/trips';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/trips/TripCard';

const statusValue = (status) => {
  if (typeof status === 'number') return ['Draft', 'Generating', 'PendingReview', 'Approved', 'Rejected', 'RevisionRequested'][status] || String(status);
  return String(status || 'Draft');
};

const TripsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('startAsc');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const loadTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tripAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data?.items || [];
      setTrips(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  const filtered = useMemo(() => {
    const result = trips.filter((trip) => {
      const haystack = `${trip.title || ''} ${trip.objective || ''} ${trip.constraints || ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (status === 'All' || statusValue(trip.status) === status);
    });
    return result.sort((a, b) => {
      if (sort === 'titleAsc') return String(a.title || '').localeCompare(String(b.title || ''));
      if (sort === 'titleDesc') return String(b.title || '').localeCompare(String(a.title || ''));
      if (sort === 'startDesc') return new Date(b.startDate || 0) - new Date(a.startDate || 0);
      return new Date(a.startDate || 0) - new Date(b.startDate || 0);
    });
  }, [trips, query, status, sort]);

  useEffect(() => { setPage(1); }, [query, status, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedTrips = filtered.slice((page - 1) * pageSize, page * pageSize);

  const remove = async (trip) => {
    if (!window.confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    try {
      await tripAPI.remove(trip.id);
      setTrips((current) => current.filter((item) => item.id !== trip.id));
      toast.success('Trip deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete trip.');
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-slate-500">Loading trips...</div>;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'All Trips' : 'My Trips'}</h1>
          <p className="mt-1 text-sm text-gray-500">Plan, review and validate your travel itineraries.</p>
        </div>
        <button type="button" onClick={() => navigate('/trips/new')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          <Add fontSize="small" /> Create Trip
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trips..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All</option><option>Draft</option><option>Generating</option><option>PendingReview</option><option>Approved</option><option>Rejected</option><option>RevisionRequested</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="startAsc">Start date ↑</option>
          <option value="startDesc">Start date ↓</option>
          <option value="titleAsc">Title A–Z</option>
          <option value="titleDesc">Title Z–A</option>
        </select>
        <button type="button" onClick={loadTrips} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Refresh fontSize="small" /> Refresh</button>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="font-medium text-slate-700">{trips.length ? 'No trips match your filters.' : 'No trips found.'}</p>
          <p className="mt-1 text-sm text-slate-500">Create a trip to start building your itinerary.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {pagedTrips.map((trip) => <TripCard key={trip.id} trip={trip} onView={(id) => navigate(`/trips/${id}`)} onEdit={trip.status === 0 || trip.status === 'Draft' || !trip.status ? (id) => navigate(`/trips/${id}/edit`) : undefined} onDelete={() => remove(trip)} />)}
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="mt-5 flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft fontSize="small" /></button>
            <span className="text-xs font-medium text-slate-600">Page {page} of {pageCount}</span>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight fontSize="small" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
