import React, { useEffect, useMemo, useState } from 'react';
import { Add, ArrowBack, Delete, Edit, FactCheck, LocationOn, SmartToy } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripAPI } from '../api/trips';
import { destinationAPI } from '../api/destinations';
import { experienceAPI } from '../api/experiences';
import TripStopForm from '../components/trips/TripStopForm';
import TripValidationResult from '../components/trips/TripValidationResult';
import { aiAPI } from '../api/ai';

const statusLabel = (status) => typeof status === 'number'
  ? ['Draft', 'Generating', 'Pending Review', 'Approved', 'Rejected', 'Revision Requested'][status] || `Status ${status}`
  : String(status || 'Draft').replace(/([a-z])([A-Z])/g, '$1 $2');

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stopLoading, setStopLoading] = useState(false);
  const [showStopForm, setShowStopForm] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [tripRes, stopsRes, destinationRes, experienceRes] = await Promise.all([
        tripAPI.getById(id),
        tripAPI.getStops(id),
        destinationAPI.getAll(),
        experienceAPI.getAll(),
      ]);
      setTrip(tripRes.data);
      setStops(Array.isArray(stopsRes.data) ? stopsRes.data : stopsRes.data?.items || []);
      setDestinations(Array.isArray(destinationRes.data) ? destinationRes.data : destinationRes.data?.items || []);
      setExperiences(Array.isArray(experienceRes.data) ? experienceRes.data : experienceRes.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load trip details.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const destinationName = useMemo(() => new Map(destinations.map((item) => [item.id, item.name])), [destinations]);
  const experienceName = useMemo(() => new Map(experiences.map((item) => [item.id, item.title])), [experiences]);

  const saveStop = async (data) => {
    setStopLoading(true);
    try {
      if (editingStop) await tripAPI.updateStop(id, editingStop.id, data);
      else await tripAPI.createStop(id, data);
      toast.success(editingStop ? 'Stop updated.' : 'Stop added.');
      setShowStopForm(false);
      setEditingStop(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save stop.');
    } finally { setStopLoading(false); }
  };

  const deleteStop = async (stop) => {
    if (!window.confirm('Delete this trip stop?')) return;
    try {
      await tripAPI.removeStop(id, stop.id);
      setStops((current) => current.filter((item) => item.id !== stop.id));
      toast.success('Stop deleted.');
    } catch (err) { toast.error(err.response?.data?.message || 'Unable to delete stop.'); }
  };

  const validate = async () => {
    setValidating(true);
    try {
      const response = await tripAPI.validate(id);
      setValidation(response.data);
      toast.success('Trip validation completed.');
    } catch (err) {
      setValidation(err.response?.data || { isValid: false, messages: [err.message] });
      toast.error(err.response?.data?.message || 'Validation request failed.');
    } finally { setValidating(false); }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const response = await aiAPI.triggerItinerary({ tripId: id });
      const data = response.data;
      setWorkflow(data);
      toast.success('AI itinerary generation started.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI itinerary generation is not available yet.');
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-slate-500">Loading trip...</div>;
  if (error || !trip) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error || 'Trip not found.'}</div>;

  return (
    <div>
      <button type="button" onClick={() => navigate('/trips')} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-700"><ArrowBack fontSize="small" /> Back to Trips</button>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">{statusLabel(trip.status)}</span>
              {trip.isActive === false && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">Inactive</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{trip.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{trip.objective || 'No objective provided.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate(`/trips/${id}/edit`)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Edit fontSize="small" /> Edit</button>
            <button type="button" onClick={validate} disabled={validating} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><FactCheck fontSize="small" /> {validating ? 'Validating...' : 'Validate Trip'}</button>
            <button type="button" onClick={generate} disabled={generating} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"><SmartToy fontSize="small" /> {generating ? 'Starting...' : 'Generate with AI'}</button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Start</p><p className="mt-1 text-sm font-medium text-slate-700">{new Date(trip.startDate).toLocaleString()}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">End</p><p className="mt-1 text-sm font-medium text-slate-700">{new Date(trip.endDate).toLocaleString()}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Constraints</p><p className="mt-1 text-sm font-medium text-slate-700">{trip.constraints || 'None specified'}</p></div>
        </div>
      </section>

      {validation && <div className="mt-5"><TripValidationResult result={validation} /></div>}

      {workflow && (
        <section className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex items-center gap-3"><SmartToy className="text-indigo-600" /><div><h2 className="font-semibold text-indigo-900">AI workflow started</h2><p className="text-sm text-indigo-800">Workflow ID: {workflow.workflowId || workflow.id || 'returned by API'}</p></div></div>
        </section>
      )}

      <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-slate-900">Trip Stops</h2><p className="text-sm text-slate-500">Build the ordered itinerary for this trip.</p></div>
          {!showStopForm && <button type="button" onClick={() => { setEditingStop(null); setShowStopForm(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"><Add fontSize="small" /> Add Stop</button>}
        </div>

        {showStopForm && <div className="mb-5"><TripStopForm initialValues={editingStop} destinations={destinations} experiences={experiences} loading={stopLoading} onSubmit={saveStop} onCancel={() => { setShowStopForm(false); setEditingStop(null); }} /></div>}

        {stops.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">No stops added yet.</div>
        ) : (
          <div className="space-y-3">
            {[...stops].sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0)).map((stop, index) => (
              <article key={stop.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{stop.stopOrder || index + 1}</div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{destinationName.get(stop.destinationId) || stop.destinationName || 'Destination'}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><LocationOn fontSize="inherit" />{experienceName.get(stop.experienceId) || stop.experienceName || 'No experience selected'}</p>
                      {(stop.plannedArrival || stop.plannedDeparture) && <p className="mt-2 text-xs text-slate-600">{stop.plannedArrival ? new Date(stop.plannedArrival).toLocaleString() : '—'} → {stop.plannedDeparture ? new Date(stop.plannedDeparture).toLocaleString() : '—'}</p>}
                      {stop.notes && <p className="mt-2 text-sm text-slate-600">{stop.notes}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => { setEditingStop(stop); setShowStopForm(true); }} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Edit stop"><Edit fontSize="small" /></button>
                    <button type="button" onClick={() => deleteStop(stop)} className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" aria-label="Delete stop"><Delete fontSize="small" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TripDetailsPage;
