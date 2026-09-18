import React, { useState } from 'react';
import { CheckCircle, Refresh, SmartToy } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { aiAPI } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const TripReviewQueuePage = () => {
  const { isAgent, isAdmin } = useAuth();
  const [workflowId, setWorkflowId] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState('');

  const loadWorkflow = async (event) => {
    event.preventDefault();
    if (!workflowId.trim()) return;
    setLoading(true);
    try {
      const response = await aiAPI.getWorkflow(workflowId.trim());
      setWorkflow(response.data);
    } catch (err) {
      setWorkflow(null);
      toast.error(err.response?.data?.message || 'Unable to load workflow.');
    } finally { setLoading(false); }
  };

  const action = async (type) => {
    if (!workflowId.trim()) return;
    setActionLoading(true);
    try {
      if (type === 'approve') await aiAPI.approve(workflowId.trim());
      else await aiAPI.reject(workflowId.trim(), reason.trim() || 'Rejected during review.');
      toast.success(type === 'approve' ? 'Workflow approved.' : 'Workflow rejected.');
      await loadWorkflow({ preventDefault() {} });
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review action failed.');
    } finally { setActionLoading(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Itinerary Review Queue</h1>
        <p className="mt-1 text-sm text-gray-500">Review a persisted AI workflow before an authorized approval action.</p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><SmartToy className="text-indigo-600" /><h2 className="font-semibold text-slate-900">Load Workflow</h2></div>
        <form onSubmit={loadWorkflow} className="flex flex-col gap-3 md:flex-row">
          <input value={workflowId} onChange={(e) => setWorkflowId(e.target.value)} placeholder="Enter workflow ID" className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          <button disabled={loading || !workflowId.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><Refresh fontSize="small" /> {loading ? 'Loading...' : 'Load'}</button>
        </form>
      </section>

      {!workflow ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          <SmartToy className="mx-auto mb-3 text-slate-300" fontSize="large" />
          {isAgent || isAdmin ? 'Enter a workflow ID to review its current AI execution state.' : 'You do not have access to AI review actions.'}
        </div>
      ) : (
        <section className="mt-5 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-slate-900">Workflow {workflow.id || workflow.workflowId || workflowId}</h2><p className="mt-1 text-sm text-slate-500">Status: {workflow.status || 'Unknown'}</p></div>
            <CheckCircle className="text-indigo-600" />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700">{JSON.stringify(workflow, null, 2)}</pre>

          {(isAgent || isAdmin) && (
            <div className="mt-5 border-t pt-5">
              <label className="mb-1 block text-sm font-medium text-gray-700">Review reason / notes</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional rejection or review note" />
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={actionLoading} onClick={() => action('approve')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">Approve</button>
                <button type="button" disabled={actionLoading} onClick={() => action('reject')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">Reject</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default TripReviewQueuePage;
