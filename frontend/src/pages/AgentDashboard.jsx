import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import {
  Pending,
  CheckCircle,
  Cancel,
  Luggage,
  TrendingUp,
  AttachMoney,
  SmartToy,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
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
  Legend,
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    total: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await tripAPI.getAllTrips();
      const trips = res.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ---------- Stats ----------
      const pending = trips.filter((t) => t.status === 'Pending').length;
      const approvedToday = trips.filter((t) => {
        if (t.status !== 'Approved') return false;
        return new Date(t.updatedAt) >= today;
      }).length;
      const rejectedToday = trips.filter((t) => {
        if (t.status !== 'Rejected') return false;
        return new Date(t.updatedAt) >= today;
      }).length;

      setStats({
        pending,
        approvedToday,
        rejectedToday,
        total: trips.length,
      });

      // ---------- Trend (last 7 days) ----------
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const next = new Date(d);
        next.setDate(next.getDate() + 1);

        const approved = trips.filter(
          (t) => t.status === 'Approved' && new Date(t.updatedAt) >= d && new Date(t.updatedAt) < next
        ).length;
        const rejected = trips.filter(
          (t) => t.status === 'Rejected' && new Date(t.updatedAt) >= d && new Date(t.updatedAt) < next
        ).length;

        days.push({ day: label, approved, rejected });
      }
      setTrendData(days);

      // ---------- Budget vs Cost (last 6 trips) ----------
      const recent = [...trips]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
        .map((t) => ({
          name: t.title.length > 14 ? t.title.slice(0, 14) + '…' : t.title,
          budget: Number(t.budget || 0),
          cost: Number(t.totalEstimatedCost || 0),
        }));
      setBudgetData(recent);

      // ---------- Destinations ----------
      const destCounts = {};
      trips.forEach((t) => {
        const k = t.destinationName || 'Unknown';
        destCounts[k] = (destCounts[k] || 0) + 1;
      });
      const destData = Object.entries(destCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      setDestinationData(destData);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      label: 'Pending Reviews',
      value: stats.pending,
      icon: <Pending />,
      color: 'bg-amber-500',
      action: () => navigate('/ai-review'),
      cta: 'Open queue →',
    },
    {
      label: 'Approved Today',
      value: stats.approvedToday,
      icon: <CheckCircle />,
      color: 'bg-emerald-600',
    },
    {
      label: 'Rejected Today',
      value: stats.rejectedToday,
      icon: <Cancel />,
      color: 'bg-rose-600',
    },
    {
      label: 'Total Trips',
      value: stats.total,
      icon: <Luggage />,
      color: 'bg-indigo-600',
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* 👇 Profile Photo */}
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user?.fullName || 'Travel Agent'}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-indigo-100 shadow-md"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-indigo-100 shadow-md">
              {(user?.fullName || 'A')[0].toUpperCase()}
            </div>
          )}

          {/* Greeting */}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 truncate">
              {getGreeting()}, {user?.fullName || user?.email}!
            </h1>
            <p className="text-gray-500">Travel Agent Dashboard — platform overview</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/ai-performance')}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <Assessment fontSize="small" /> Open AI Performance
        </button>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={card.action}
            className={`rounded-xl border bg-white p-5 shadow-sm ${
              card.action ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                {card.cta && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">{card.cta}</p>
                )}
              </div>
              <div className={`rounded-lg p-3 text-white ${card.color}`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* ---- Approval Trend ---- */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Approval Trend</h2>
              <p className="text-xs text-slate-400">Approved vs rejected — last 7 days</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---- Budget vs Cost ---- */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AttachMoney className="text-emerald-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Budget vs Estimated Cost</h2>
              <p className="text-xs text-slate-400">Last 6 trips created</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={budgetData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="budget" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ---- Top Destinations ---- */}
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Luggage className="text-fuchsia-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Trip Distribution by Destination</h2>
              <p className="text-xs text-slate-400">All-time trips grouped by destination</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={destinationData}
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
                  {destinationData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;