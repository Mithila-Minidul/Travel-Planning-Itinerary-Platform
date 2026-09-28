import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../api/bookings';
import { paymentAPI } from '../api/payments';
import {
  Replay,
  Refresh,
  AttachMoney,
  ErrorOutline,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const fmtMoney = (v) => `$${Number(v || 0).toFixed(2)}`;

const RefundManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState({}); // bookingId -> preview dto
  const [busy, setBusy] = useState(null);

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

  const refundedBookings = bookings.filter(
    (b) => b.paymentStatus === 'Refunded' || b.paymentStatus === 'PartiallyRefunded'
  );
  const refundableBookings = bookings.filter(
    (b) => b.paymentStatus === 'Succeeded' && b.status !== 'Cancelled'
  );

  const loadPreview = async (bookingId) => {
    try {
      const res = await paymentAPI.previewRefund(bookingId);
      setPreviews((p) => ({ ...p, [bookingId]: res.data }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load preview.');
    }
  };

  const handleRefund = async (b) => {
    const reason = window.prompt('Refund reason:') || '';
    if (!window.confirm(`Issue refund for "${b.experienceTitle}"?`)) return;
    setBusy(b.id);
    try {
      await paymentAPI.refund(b.id, reason);
      toast.success('Refund issued.');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refund failed.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading refunds...</div>;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Refund Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Refund oversight with automatic policy preview
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Refresh fontSize="small" /> Refresh
        </button>
      </div>

      {/* POLICY BANNER */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Refund policy:</strong> 7+ days = 100% · 3–6 days = 50% · 1–2 days = 25% · &lt;24h = 0%
      </div>

      {/* REFUNDABLE (paid but not cancelled) */}
      <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AttachMoney className="text-indigo-600" />
          <h2 className="font-semibold text-slate-900">
            Refundable Payments ({refundableBookings.length})
          </h2>
        </div>
        {refundableBookings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No refundable payments right now.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">Experience</th>
                  <th className="px-3 py-2 text-left">Traveler</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-center">Preview</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refundableBookings.map((b) => {
                  const p = previews[b.id];
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800">{b.experienceTitle}</td>
                      <td className="px-3 py-2 text-slate-600">{b.travelerName}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-800">
                        {fmtMoney(b.paymentAmount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p ? (
                          <span className="text-xs text-slate-700">
                            {p.refundPercentage}% → <strong>{fmtMoney(p.refundAmount)}</strong>
                          </span>
                        ) : (
                          <button
                            onClick={() => loadPreview(b.id)}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            Load preview →
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          disabled={busy === b.id}
                          onClick={() => handleRefund(b)}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Refund
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REFUNDED HISTORY */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Replay className="text-rose-600" />
          <h2 className="font-semibold text-slate-900">
            Refund History ({refundedBookings.length})
          </h2>
        </div>
        {refundedBookings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            <ErrorOutline className="mx-auto text-slate-300 mb-2" />
            No refunds recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">Experience</th>
                  <th className="px-3 py-2 text-left">Traveler</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-right">Refunded</th>
                  <th className="px-3 py-2 text-center">%</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refundedBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">{b.experienceTitle}</td>
                    <td className="px-3 py-2 text-slate-600">{b.travelerName}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{fmtMoney(b.paymentAmount)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-rose-600">
                      {fmtMoney(b.refundAmount)}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-600">
                      {b.refundPercentage ?? 0}%
                    </td>
                    <td className="px-3 py-2 text-slate-500 italic truncate max-w-[220px]">
                      {b.cancellationReason || '—'}
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

export default RefundManagementPage;