import React, { useEffect, useState, useMemo } from 'react';
import { agentWorkflowAPI } from '../api/agentWorkflows';
import {
  SmartToy,
  CheckCircle,
  WarningAmber,
  ErrorOutline,
  InfoOutlined,
  PlayArrow,
  LocationOn,
  Person,
  AccessTime,
  AttachMoney,
  VerifiedUser,
  Refresh,
  ArrowBack,
  Speed,
  Timeline,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const statusStyles = {
  SUCCESS: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle fontSize="small" /> },
  INFO:    { color: 'text-sky-700',     bg: 'bg-sky-50',     icon: <InfoOutlined fontSize="small" /> },
  WARNING: { color: 'text-amber-700',   bg: 'bg-amber-50',   icon: <WarningAmber fontSize="small" /> },
  ERROR:   { color: 'text-rose-700',    bg: 'bg-rose-50',    icon: <ErrorOutline fontSize="small" /> },
};

const agentColors = {
  Planner:      'bg-indigo-100 text-indigo-700',
  Research:     'bg-sky-100 text-sky-700',
  Orchestrator: 'bg-fuchsia-100 text-fuchsia-700',
  Budget:       'bg-amber-100 text-amber-700',
  Approval:     'bg-emerald-100 text-emerald-700',
};

const AGENT_ORDER = ['Planner', 'Research', 'Orchestrator', 'Budget', 'Approval'];

const OUTCOME_COLORS = {
  PENDING:  '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  ERROR:    '#64748b',
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const fmtElapsed = (ms) => {
  if (!ms || ms < 1) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const AIPerformancePage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [details, setDetails] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await agentWorkflowAPI.getAll();
      const wfs = res.data || [];
      setWorkflows(wfs);

      const detailMap = {};
      await Promise.all(
        wfs.map(async (w) => {
          try {
            const d = await agentWorkflowAPI.getById(w.id);
            detailMap[w.id] = d.data;
          } catch {
            // skip
          }
        })
      );
      setDetails(detailMap);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load workflows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!selectedId) { setSelected(null); return; }
    if (details[selectedId]) { setSelected(details[selectedId]); return; }

    (async () => {
      setLoadingDetail(true);
      try {
        const res = await agentWorkflowAPI.getById(selectedId);
        setSelected(res.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load workflow detail.');
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [selectedId, details]);

  const analytics = useMemo(() => {
    const detailList = Object.values(details);

    const total = workflows.length;
    const allLogs = detailList.flatMap((d) => d.executionLogs || []);
    const totalSteps = allLogs.length;

    const workflowsWithoutWarnings = detailList.filter(
      (d) => !(d.executionLogs || []).some(
        (l) => l.status === 'WARNING' || l.status === 'ERROR'
      )
    ).length;
    const successRate = detailList.length > 0
      ? Math.round((workflowsWithoutWarnings / detailList.length) * 100)
      : 0;

    const totalElapsedMs = allLogs.reduce((sum, l) => sum + (l.elapsedMs || 0), 0);
    const avgTotalElapsed = detailList.length > 0
      ? Math.round(totalElapsedMs / detailList.length)
      : 0;

    const avgSteps = detailList.length > 0
      ? (totalSteps / detailList.length).toFixed(1)
      : '0';

    const agentTimings = {};
    AGENT_ORDER.forEach((name) => { agentTimings[name] = { total: 0, count: 0 }; });
    allLogs.forEach((log) => {
      const n = log.agentName;
      if (!agentTimings[n]) agentTimings[n] = { total: 0, count: 0 };
      agentTimings[n].total += log.elapsedMs || 0;
      agentTimings[n].count += 1;
    });
    const agentTimingData = Object.entries(agentTimings).map(([name, v]) => ({
      agent: name,
      avgMs: v.count > 0 ? Math.round(v.total / v.count) : 0,
    }));

    const outcomeCounts = {};
    workflows.forEach((w) => {
      outcomeCounts[w.status] = (outcomeCounts[w.status] || 0) + 1;
    });
    const outcomeData = Object.entries(outcomeCounts).map(([name, value]) => ({
      name, value,
    }));

    const flaggedWorkflows = detailList
      .map((d) => {
        const warnings = (d.executionLogs || []).filter(
          (l) => l.status === 'WARNING' || l.status === 'ERROR'
        );
        return { ...d, warnings };
      })
      .filter((d) => d.warnings.length > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      total,
      totalSteps,
      successRate,
      avgTotalElapsed,
      avgSteps,
      agentTimingData,
      outcomeData,
      flaggedWorkflows,
    };
  }, [workflows, details]);

  // ============================================================
  // DETAIL VIEW
  // ============================================================
  if (selectedId) {
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          <ArrowBack fontSize="small" /> Back to AI Performance
        </button>

        {loadingDetail ? (
          <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
            Loading workflow detail...
          </div>
        ) : !selected ? (
          <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
            Workflow not found.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SmartToy className="text-indigo-600" />
                    <h1 className="text-xl font-bold text-slate-900">
                      {selected.tripTitle}
                    </h1>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      selected.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : selected.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selected.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{selected.objective || 'No objective provided.'}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Workflow ID</p>
                  <p className="font-mono text-[11px] text-slate-700 break-all">{selected.id}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <LocationOn fontSize="inherit" /> Destination
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{selected.destinationName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Person fontSize="inherit" /> Traveler
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{selected.travelerName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <AttachMoney fontSize="inherit" /> Est. Cost
                  </p>
                  <p className={`mt-1 font-semibold ${selected.budgetValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    ${Number(selected.totalEstimatedCost || 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <VerifiedUser fontSize="inherit" /> Winning Guide
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selected.winningGuideName || '—'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <AccessTime fontSize="inherit" /> Started: {fmtTime(selected.startedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <AccessTime fontSize="inherit" /> Completed: {fmtTime(selected.completedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <PlayArrow fontSize="inherit" /> {selected.totalSteps} steps
                </span>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">AI Execution Timeline</h2>
                <span className="text-xs text-slate-400">
                  {selected.executionLogs.length} step(s)
                </span>
              </div>

              <div className="relative border-l border-slate-200 ml-4 space-y-5 pb-2">
                {selected.executionLogs.map((log) => {
                  const st = statusStyles[log.status] || statusStyles.SUCCESS;
                  const chip = agentColors[log.agentName] || 'bg-slate-100 text-slate-700';
                  return (
                    <div key={log.id} className="ml-6 relative">
                      <span className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${st.bg} ${st.color}`}>
                        {st.icon}
                      </span>
                      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-slate-400">
                            #{log.sequenceNumber}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${chip}`}>
                            {log.agentName}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.color}`}>
                            {log.status}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-auto">
                            {fmtElapsed(log.elapsedMs)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{log.action}</p>
                        {log.details && (
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            {log.details}
                          </p>
                        )}
                        <p className="mt-2 text-[11px] text-slate-400">
                          {fmtTime(log.executedAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // ANALYTICS VIEW
  // ============================================================
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Performance</h1>
          <p className="text-sm text-slate-500 mt-1">
            How well the AI subsystem is performing — timing, success, warnings
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Refresh fontSize="small" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
          Loading AI performance data...
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Workflows</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.total}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {analytics.totalSteps} agent steps logged
                  </p>
                </div>
                <div className="rounded-lg p-3 text-white bg-indigo-600">
                  <Timeline />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Clean Success Rate</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.successRate}%</p>
                  <p className="mt-1 text-xs text-slate-400">Runs without any warning</p>
                </div>
                <div className="rounded-lg p-3 text-white bg-emerald-600">
                  <CheckCircle />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg Steps / Run</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.avgSteps}</p>
                  <p className="mt-1 text-xs text-slate-400">Agent invocations per trip</p>
                </div>
                <div className="rounded-lg p-3 text-white bg-fuchsia-600">
                  <Assessment />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg Agent Time / Run</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {fmtElapsed(analytics.avgTotalElapsed)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Sum of agent latencies</p>
                </div>
                <div className="rounded-lg p-3 text-white bg-sky-600">
                  <Speed />
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Speed className="text-sky-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">Average Time per Agent</h2>
                  <p className="text-xs text-slate-400">Which agent is the bottleneck?</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={analytics.agentTimingData}
                    margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="agent" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${v}ms`}
                    />
                    <Tooltip formatter={(v) => fmtElapsed(Number(v))} />
                    <Bar dataKey="avgMs" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">Workflow Outcomes</h2>
                  <p className="text-xs text-slate-400">Distribution by status</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={analytics.outcomeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={false}
                    >
                      {analytics.outcomeData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={OUTCOME_COLORS[entry.name] || '#6366f1'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* FLAGGED WORKFLOWS TABLE */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WarningAmber className="text-amber-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Recent Workflows with Warnings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Click any row to inspect the full agent timeline
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                {analytics.flaggedWorkflows.length} flagged
              </span>
            </div>

            {analytics.flaggedWorkflows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No warnings or errors in any workflow. 🎉
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Trip</th>
                      <th className="px-4 py-3 text-left">Destination</th>
                      <th className="px-4 py-3 text-left">Flagged Agent(s)</th>
                      <th className="px-4 py-3 text-center">Warnings</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.flaggedWorkflows.map((w) => {
                      const agentSet = [...new Set(w.warnings.map((x) => x.agentName))];
                      return (
                        <tr
                          key={w.id}
                          className="hover:bg-amber-50/40 cursor-pointer"
                          onClick={() => setSelectedId(w.id)}
                        >
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">
                            {w.tripTitle}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{w.destinationName}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {agentSet.map((a) => (
                                <span
                                  key={a}
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    agentColors[a] || 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-[11px] font-semibold">
                              {w.warnings.length}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              w.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : w.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : w.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-indigo-600 font-medium whitespace-nowrap">
                            Inspect →
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIPerformancePage;