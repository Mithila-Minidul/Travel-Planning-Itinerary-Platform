import React, { useEffect, useMemo, useState } from 'react';
import { bookingAPI } from '../api/bookings';
import {
  Payments,
  AttachMoney,
  TrendingUp,
  Refresh,
  Replay,
  AccountBalanceWallet,
} from '@mui/icons-material';

const fmtMoney = (v) => `$${Number(v || 0).toFixed(2)}`;

const PaymentDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const stats = useMemo(() => {
    let gross = 0, refunded = 0, net = 0, paidCount = 0;
    const rows = [];
    bookings.forEach((b) => {
      if (b.paymentStatus && b.paymentStatus !== 'Pending') {
        rows.push(b);
        gross += b.paymentAmount || 0;
        if (b.paymentStatus === 'Succeeded') paidCount += 1;
        if (b.refundAmount) refunded += b.refundAmount;
      }
    });
    net = gross - refunded;
    return { gross, refunded, net, paidCount, rows };
  }, [bookings]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading payments...</div>;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revenue, refunds and transaction health across the platform
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Refresh fontSize="small" /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Gross Revenue</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{fmtMoney(stats.gross)}</p>
              <p className="text-xs text-slate-400 mt-1">{stats.paidCount} successful payments</p>
            </div>
            <div className="rounded-lg p-3 text-white bg-indigo-600"><AttachMoney /></div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Refunded</p>
              <p className="mt-2 text-3xl font-bold text-rose-600">{fmtMoney(stats.refunded)}</p>
              <p className="text-xs text-slate-400 mt-1">Across all refunded bookings</p>
            </div>
            <div className="rounded-lg p-3 text-white bg-rose-600"><Replay /></div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Net Revenue</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{fmtMoney(stats.net)}</p>
              <p className="text-xs text-slate-400 mt-1">Gross − refunds</p>
            </div>
            <div className="rounded-lg p-3 text-white bg-emerald-600"><TrendingUp /></div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Payments</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.rows.length}</p>
              <p className="text-xs text-slate-400 mt-1">All-time transaction rows</p>
            </div>
            <div className="rounded-lg p-3 text-white bg-sky-600"><AccountBalanceWallet /></div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Payments className="text-indigo-600" />
          <h2 className="font-semibold text-slate-900">Transactions</h2>
        </div>

        {stats.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">Booking</th>
                  <th className="px-3 py-2 text-left">Traveler</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-center">Method</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Refunded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.rows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {b.experienceTitle}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{b.travelerName}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-800">
                      {fmtMoney(b.paymentAmount)}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-600">
                      {b.paymentMethod || '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        b.paymentStatus === 'Succeeded'
                          ? 'bg-emerald-100 text-emerald-700'
                          : b.paymentStatus === 'Refunded'
                            ? 'bg-rose-100 text-rose-700'
                            : b.paymentStatus === 'PartiallyRefunded'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-rose-600 font-medium">
                      {b.refundAmount ? fmtMoney(b.refundAmount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDashboardPage;