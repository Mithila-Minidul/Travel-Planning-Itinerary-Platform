import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../api/bookings';
import { paymentAPI } from '../api/payments';
import {
  BookOnline,
  CheckCircle,
  Cancel,
  DoneAll,
  EventAvailable,
  QrCode2,
  AttachMoney,
  Person,
  LocationOn,
  CalendarToday,
  Refresh,
  Visibility,
  WarningAmber,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  NoShow:    'bg-slate-100 text-slate-600',
};

const BOOKING_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const BookingsPage = () => {
  const { isAdmin, isLocalGuide, isTraveler } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [actionBusy, setActionBusy] = useState(null);

  // Check-in modal
  const [checkInBooking, setCheckInBooking] = useState(null);
  const [checkInCode, setCheckInCode] = useState('');

  // Reject modal
  const [rejectBooking, setRejectBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  // ---------- Actions ----------
  const handleConfirm = async (b) => {
    if (!window.confirm(`Confirm booking for "${b.tripTitle}"?`)) return;
    setActionBusy(b.id);
    try {
      await bookingAPI.confirm(b.id);
      toast.success('Booking confirmed.');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to confirm.');
    } finally {
      setActionBusy(null);
    }
  };

  const handleReject = async () => {
    if (!rejectBooking) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setActionBusy(rejectBooking.id);
    try {
      await bookingAPI.reject(rejectBooking.id, rejectReason.trim());
      toast.success('Booking rejected.');
      setRejectBooking(null);
      setRejectReason('');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject.');
    } finally {
      setActionBusy(null);
    }
  };

  const handlePay = async (b) => {
    if (!window.confirm(`Pay $${b.totalAmount} for "${b.tripTitle}"?`)) return;
    setActionBusy(b.id);
    try {
      await paymentAPI.process(b.id, 'Mock');
      toast.success('Payment processed.');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Payment failed.');
    } finally {
      setActionBusy(null);
    }
  };

  const handleCancel = async (b) => {
    const reason = window.prompt('Reason for cancellation (optional):') || '';
    if (!window.confirm(`Cancel booking for "${b.tripTitle}"?`)) return;
    setActionBusy(b.id);
    try {
      await bookingAPI.cancel(b.id, reason);
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel.');
    } finally {
      setActionBusy(null);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInBooking || !checkInCode.trim()) {
      toast.error('Enter the confirmation code.');
      return;
    }
    setActionBusy(checkInBooking.id);
    try {
      await bookingAPI.checkIn(checkInBooking.id, checkInCode.trim());
      toast.success('Checked in.');
      setCheckInBooking(null);
      setCheckInCode('');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionBusy(null);
    }
  };

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const counts = BOOKING_TABS.reduce((acc, t) => {
    acc[t] = t === 'All'
      ? bookings.length
      : bookings.filter((b) => b.status === t).length;
    return acc;
  }, {});

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading bookings...</div>;
  }

  return (
    <div>
      {/* ---------- HEADER ---------- */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'All Bookings' : 'My Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Monitor every booking across the platform'
              : isLocalGuide
                ? 'Review and manage your customer bookings'
                : 'Track your experience bookings and payments'}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Refresh fontSize="small" /> Refresh
        </button>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="mb-6 flex flex-wrap gap-2">
        {BOOKING_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* ---------- EMPTY ---------- */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <BookOnline className="mx-auto mb-3 text-slate-300" style={{ fontSize: 56 }} />
          <p className="text-slate-600 font-medium">
            No {activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}bookings found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              b={b}
              isAdmin={isAdmin}
              isGuide={isLocalGuide}
              isTraveler={isTraveler}
              busy={actionBusy === b.id}
              onConfirm={() => handleConfirm(b)}
              onReject={() => { setRejectBooking(b); setRejectReason(''); }}
              onPay={() => handlePay(b)}
              onCancel={() => handleCancel(b)}
              onCheckIn={() => { setCheckInBooking(b); setCheckInCode(''); }}
              onDetail={() => navigate(`/bookings/${b.id}`)}
            />
          ))}
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {rejectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <WarningAmber className="text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900">Reject Booking</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Let {rejectBooking.travelerName} know why you're rejecting the
              booking for "{rejectBooking.tripTitle}".
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="3"
              placeholder="e.g. Fully booked on these dates, or need more lead time..."
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setRejectBooking(null); setRejectReason(''); }}
                className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={actionBusy === rejectBooking.id}
                onClick={handleReject}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Cancel fontSize="small" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CHECK-IN MODAL ================= */}
      {checkInBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Check-in: {checkInBooking.tripTitle}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Ask the traveler for their confirmation code.
            </p>
            <input
              type="text"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
              placeholder="TC-XXXXXX"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setCheckInBooking(null); setCheckInCode(''); }}
                className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={actionBusy === checkInBooking.id}
                onClick={handleCheckIn}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <DoneAll fontSize="small" /> Confirm Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Booking Card
// ============================================================
const BookingCard = ({
  b, isAdmin, isGuide, isTraveler, busy,
  onConfirm, onReject, onPay, onCancel, onCheckIn, onDetail,
}) => {
  const tripDate = new Date(b.bookingDate).toLocaleDateString();
  const total = Number(b.totalAmount || 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      {/* Header: Trip title + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1 cursor-pointer" onClick={onDetail}>
          <h3 className="font-semibold text-slate-900 text-lg truncate hover:text-indigo-600">
            {b.tripTitle}
          </h3>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <LocationOn fontSize="inherit" /> {b.destinationName}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
          STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'
        }`}>
          {b.status}
        </span>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-y border-slate-100 py-3 mb-3">
        <div className="flex items-center gap-1.5">
          <Person fontSize="small" className="text-slate-400" />
          <span className="truncate">
            {isTraveler ? 'Guide:' : 'Traveler:'}{' '}
            <strong>{isTraveler ? b.guideName : b.travelerName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarToday fontSize="small" className="text-slate-400" />
          <span>{tripDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <EventAvailable fontSize="small" className="text-slate-400" />
          <span>{b.numberOfGuests} guest(s)</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
          <AttachMoney fontSize="small" />
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer: code + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono font-semibold text-slate-700">
            {b.confirmationCode}
          </span>
          {b.paymentStatus && (
            <span className={`rounded-md px-2 py-1 font-semibold ${
              b.paymentStatus === 'Succeeded'
                ? 'bg-emerald-50 text-emerald-700'
                : b.paymentStatus === 'Refunded'
                  ? 'bg-rose-50 text-rose-700'
                  : b.paymentStatus === 'PartiallyRefunded'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
            }`}>
              {b.paymentStatus}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* View Details — always available */}
          <button
            onClick={onDetail}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Visibility fontSize="small" /> Details
          </button>

          {/* Guide actions */}
          {isGuide && b.status === 'Pending' && (
            <>
              <button
                disabled={busy}
                onClick={onReject}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Cancel fontSize="small" /> Reject
              </button>
              <button
                disabled={busy}
                onClick={onConfirm}
                className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                <CheckCircle fontSize="small" /> Confirm
              </button>
            </>
          )}
          {isGuide && b.status === 'Confirmed' && (
            <button
              disabled={busy}
              onClick={onCheckIn}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <QrCode2 fontSize="small" /> Check-in
            </button>
          )}

          {/* Traveler actions */}
          {isTraveler && b.status === 'Confirmed' && b.paymentStatus !== 'Succeeded' && (
            <button
              disabled={busy}
              onClick={onPay}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <AttachMoney fontSize="small" /> Pay
            </button>
          )}
          {isTraveler && ['Pending', 'Confirmed'].includes(b.status) && (
            <button
              disabled={busy}
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <Cancel fontSize="small" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;