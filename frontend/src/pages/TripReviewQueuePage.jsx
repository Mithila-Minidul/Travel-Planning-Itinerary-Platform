import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle, Refresh, SmartToy, Edit, Save, Undo, WarningAmber
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { aiAPI } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const statusLabel = (status) =>
    String(status || 'Unknown').replace(/([a-z])([A-Z])/g, '$1 $2');

const toLocal = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TripReviewQueuePage = () => {
  const { isAgent, isAdmin } = useAuth();
  const [queue, setQueue] = useState([]);
  const [workflow, setWorkflow] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getPending();
      const items = Array.isArray(response.data) ? response.data : [];
      setQueue(items);
      if (!selectedId && items.length) setSelectedId(items[0].id);
      if (selectedId && !items.some((item) => item.id === selectedId)) {
        setSelectedId(items[0]?.id || '');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load the AI review queue.');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflow = async (id) => {
    if (!id) {
      setWorkflow(null);
      setPlan([]);
      return;
    }
    setDetailLoading(true);
    try {
      const response = await aiAPI.getWorkflow(id);
      setWorkflow(response.data);
      setPlan(response.data?.plannerResult?.plan || []);
      setEditing(false);
    } catch (err) {
      setWorkflow(null);
      setPlan([]);
      toast.error(err.response?.data?.message || 'Unable to load this AI workflow.');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { loadQueue(); }, []);
  useEffect(() => { loadWorkflow(selectedId); }, [selectedId]);

  const validationIssues = useMemo(() => {
    const v = workflow?.validation;
    return (v?.errors || []).length + (v?.conflicts || []).length;
  }, [workflow]);

  const changePlan = (index, field, value) => {
    setPlan((current) => current.map((item, i) =>
        i === index
            ? {
              ...item,
              [field]: field === 'stopOrder' ? Number(value) : value,
            }
            : item
    ));
  };

  const saveItinerary = async () => {
    if (!workflow) return;
    setActionLoading(true);
    try {
      const payload = {
        plan: plan.map((item) => ({
          ...item,
          plannedArrival: new Date(item.plannedArrival).toISOString(),
          plannedDeparture: new Date(item.plannedDeparture).toISOString(),
        })),
      };
      const response = await aiAPI.editItinerary(workflow.id, payload);
      setWorkflow(response.data);
      setPlan(response.data?.plannerResult?.plan || plan);
      setEditing(false);
      toast.success('Itinerary changes saved. Approval is still required.');
      await loadQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save itinerary changes.');
    } finally {
      setActionLoading(false);
    }
  };

  const review = async (type) => {
    if (!workflow) return;
    setActionLoading(true);
    try {
      if (type === 'approve') {
        await aiAPI.approve(workflow.id, reason.trim());
        toast.success('Itinerary approved.');
      } else if (type === 'revise') {
        await aiAPI.requestRevision(workflow.id, reason.trim() || 'Please revise the itinerary.');
        toast.success('Revision requested.');
      } else {
        await aiAPI.reject(workflow.id, reason.trim() || 'Rejected during review.');
        toast.success('Itinerary rejected.');
      }
      setReason('');
      await loadQueue();
      setWorkflow(null);
      setSelectedId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAgent && !isAdmin) {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          AI itinerary review is available to Travel Agents and Administrators.
        </div>
    );
  }

  return (
      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Itinerary Review Queue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review, edit, validate, and approve Planner Agent itineraries.
            </p>
          </div>
          <button type="button" onClick={loadQueue} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            <Refresh fontSize="small" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Pending reviews</h2>
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{queue.length}</span>
            </div>

            {loading ? (
                <p className="p-4 text-sm text-slate-500">Loading queue...</p>
            ) : queue.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                  <SmartToy className="mx-auto mb-2 text-slate-300" />
                  No pending AI itineraries.
                </div>
            ) : (
                <div className="space-y-2">
                  {queue.map((item) => (
                      <button
                          type="button"
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full rounded-lg border p-3 text-left transition ${
                              selectedId === item.id
                                  ? 'border-indigo-300 bg-indigo-50'
                                  : 'border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        <p className="font-medium text-slate-800">{item.tripTitle}</p>
                        <p className="mt-1 text-xs text-slate-500">{statusLabel(item.status)}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{new Date(item.startedAt).toLocaleString()}</p>
                      </button>
                  ))}
                </div>
            )}
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            {!workflow ? (
                <div className="flex min-h-80 items-center justify-center text-center text-sm text-slate-500">
                  {detailLoading ? 'Loading workflow...' : 'Select a pending itinerary from the queue.'}
                </div>
            ) : (
                <>
                  <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      {statusLabel(workflow.status)}
                    </span>
                        {workflow.validation?.isValid ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">Validation passed</span>
                        ) : (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                        {validationIssues} validation issue(s)
                      </span>
                        )}
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">{workflow.tripTitle}</h2>
                      <p className="mt-1 text-sm text-slate-500">{workflow.currentStep}</p>
                    </div>
                    <div className="flex gap-2">
                      {!editing ? (
                          <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50">
                            <Edit fontSize="small" /> Edit itinerary
                          </button>
                      ) : (
                          <>
                            <button type="button" onClick={() => { setPlan(workflow.plannerResult?.plan || []); setEditing(false); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                              <Undo fontSize="small" /> Cancel
                            </button>
                            <button type="button" onClick={saveItinerary} disabled={actionLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60">
                              <Save fontSize="small" /> Save changes
                            </button>
                          </>
                      )}
                    </div>
                  </div>

                  {workflow.plannerResult?.decisionSummary && (
                      <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
                        <div className="flex items-start gap-2"><SmartToy fontSize="small" /><span>{workflow.plannerResult.decisionSummary}</span></div>
                      </div>
                  )}

                  <div className="mt-5 space-y-3">
                    <h3 className="font-semibold text-slate-900">Generated day-by-day itinerary</h3>
                    {plan.map((item, index) => (
                        <article key={item.stopId} className="rounded-lg border border-slate-200 p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                                {item.stopOrder}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-slate-800">{item.destinationName}</h4>
                                  <span className="text-xs text-slate-500">Day {item.dayNumber}</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">{item.experienceTitle || 'Destination visit'}</p>
                              </div>
                            </div>

                            {editing ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <label className="text-xs font-medium text-slate-600">
                                    Stop order
                                    <input type="number" min="1" value={item.stopOrder} onChange={(e) => changePlan(index, 'stopOrder', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                  </label>
                                  <label className="text-xs font-medium text-slate-600">
                                    Arrival
                                    <input type="datetime-local" value={toLocal(item.plannedArrival)} onChange={(e) => changePlan(index, 'plannedArrival', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                  </label>
                                  <label className="text-xs font-medium text-slate-600">
                                    Departure
                                    <input type="datetime-local" value={toLocal(item.plannedDeparture)} onChange={(e) => changePlan(index, 'plannedDeparture', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                  </label>
                                  <label className="text-xs font-medium text-slate-600 md:col-span-3">
                                    Reviewer notes
                                    <textarea rows={2} value={item.notes || ''} onChange={(e) => changePlan(index, 'notes', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                  </label>
                                </div>
                            ) : (
                                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                                  <p><strong>Schedule:</strong> {new Date(item.plannedArrival).toLocaleString()} → {new Date(item.plannedDeparture).toLocaleString()}</p>
                                  {item.weatherStatus && <p className="mt-1"><strong>Weather:</strong> {item.weatherStatus}</p>}
                                  {item.notes && <p className="mt-1">{item.notes}</p>}
                                </div>
                            )}
                          </div>
                        </article>
                    ))}
                  </div>

                  {workflow.validation && !workflow.validation.isValid && (
                      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <div className="flex items-center gap-2 font-semibold"><WarningAmber fontSize="small" /> Validation requires attention</div>
                        {workflow.validation.errors?.length > 0 && (
                            <ul className="mt-2 list-disc pl-5 text-xs">
                              {workflow.validation.errors.map((item, i) => <li key={i}>{item.message}</li>)}
                            </ul>
                        )}
                        {workflow.validation.conflicts?.length > 0 && (
                            <ul className="mt-2 list-disc pl-5 text-xs">
                              {workflow.validation.conflicts.map((item, i) => <li key={i}>{item.message}</li>)}
                            </ul>
                        )}
                      </div>
                  )}

                  <div className="mt-6 border-t pt-5">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Reviewer notes</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Explain rejection or requested revision. Approval notes are optional." />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={actionLoading || editing || !workflow.validation?.isValid} onClick={() => review('approve')} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                        <CheckCircle fontSize="small" /> Approve
                      </button>
                      <button type="button" disabled={actionLoading || editing} onClick={() => review('revise')} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">
                        Request revision
                      </button>
                      <button type="button" disabled={actionLoading || editing} onClick={() => review('reject')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </div>

                  {workflow.logs?.length > 0 && (
                      <div className="mt-6 border-t pt-5">
                        <h3 className="mb-3 font-semibold text-slate-900">Execution history</h3>
                        <div className="space-y-2">
                          {workflow.logs.map((log) => (
                              <div key={`${log.sequence}-${log.step}`} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                                <span className="font-bold text-indigo-700">{log.sequence}</span>
                                <div><p className="font-medium text-slate-700">{log.step}</p><p className="text-slate-500">{log.message}</p></div>
                                <span className="ml-auto text-slate-400">{log.status}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}
                </>
            )}
          </section>
        </div>
      </div>
  );
};

export default TripReviewQueuePage;
