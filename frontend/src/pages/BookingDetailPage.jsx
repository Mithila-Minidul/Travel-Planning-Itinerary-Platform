import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../api/bookings';
import { paymentAPI } from '../api/payments';
import { tripAPI } from '../api/trips';
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
  ArrowBack,
  WarningAmber,
  VerifiedUser,
  Speed,
  AccessTime,
  Group,
  Replay,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  NoShow:    'bg-slate-100 text-slate-600',
};

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isLocalGuide, isTraveler } = useAuth();

  const [booking, setBooking] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const bRes = await bookingAPI.getById(id);
      setBooking(bRes.data);
      try {
        const tRes = await tripAPI.getTripById(bRes.data.tripId);
        setTrip(tRes.data);
      } catch {
        // trip may not be available — booking still shows
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // ---------- Actions ----------
  const handleConfirm = async () => {
    if (!window.confirm('Confirm this booking?')) return;
    setBusy(true);
    try {
      await bookingAPI.confirm(booking.id);
      toast.success('Booking confirmed.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to confirm.');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason.');
      return;
    }
    setBusy(true);
    try {
      await bookingAPI.reject(booking.id, rejectReason.trim());
      toast.success('Booking rejected.');
      setShowReject(false);
      setRejectReason('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject.');
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    if (!window.confirm(`Pay $${booking.totalAmount} for this booking?`)) return;
    setBusy(true);
    try {
      await paymentAPI.process(booking.id, 'Mock');
      toast.success('Payment processed.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Payment failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Reason for cancellation (optional):') || '';
    if (!window.confirm('Cancel this booking?')) return;
    setBusy(true);
    try {
      await bookingAPI.cancel(booking.id, reason);
      toast.success('Booking cancelled.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel.');
    } finally {
      setBusy(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInCode.trim()) {
      toast.error('Enter the confirmation code.');
      return;
    }
    setBusy(true);
    try {
      await bookingAPI.checkIn(booking.id, checkInCode.trim());
      toast.success('Checked in.');
      setShowCheckIn(false);
      setCheckInCode('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading booking details...</div>;
  }
  if (error || !booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 mb-4">{error || 'Booking not found'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const stops = (trip?.tripStops || []).sort(
    (a, b) => a.dayNumber - b.dayNumber || a.orderIndex - b.orderIndex
  );
  const stopsByDay = stops.reduce((acc, s) => {
    (acc[s.dayNumber] = acc[s.dayNumber] || []).push(s);
    return acc;
  }, {});
  const sortedDays = Object.keys(stopsByDay).map(Number).sort((a, b) => a - b);

  const isOverBudget =
    booking.totalAmount > (trip?.budget ?? Number.POSITIVE_INFINITY);

  return (
    <div>
      {/* ---------- BACK ---------- */}
      <button
        onClick={() => navigate('/bookings')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
      >
        <ArrowBack fontSize="small" /> Back to Bookings
      </button>

      {/* ================= HEADER ================= */}
      <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 truncate">
              {booking.tripTitle}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <LocationOn fontSize="small" /> {booking.destinationName}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-mono">
              {booking.confirmationCode}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
            STATUS_STYLES[booking.status] || 'bg-slate-100 text-slate-600'
          }`}>
            {booking.status}
          </span>
        </div>

        {/* Status banner */}
        <div className="mt-4 rounded-lg border p-3 flex items-center gap-3 text-sm"
          style={{
            backgroundColor:
              booking.status === 'Pending' ? '#fffbeb'
              : booking.status === 'Confirmed' ? '#eff6ff'
              : booking.status === 'Completed' ? '#ecfdf5'
              : booking.status === 'Cancelled' ? '#fef2f2'
              : '#f8fafc',
            borderColor:
              booking.status === 'Pending' ? '#fde68a'
              : booking.status === 'Confirmed' ? '#bfdbfe'
              : booking.status === 'Completed' ? '#a7f3d0'
              : booking.status === 'Cancelled' ? '#fecaca'
              : '#e2e8f0',
          }}
        >
          {booking.status === 'Pending' && (
            <>
              <WarningAmber className="text-amber-600" />
              <span className="text-amber-900">
                Waiting for the Local Guide to confirm this booking.
              </span>
            </>
          )}
          {booking.status === 'Confirmed' && booking.paymentStatus !== 'Succeeded' && (
            <>
              <AttachMoney className="text-sky-600" />
              <span className="text-sky-900">
                Confirmed by the Guide. {isTraveler ? 'Tap Pay to complete.' : 'Waiting for traveler payment.'}
              </span>
            </>
          )}
          {booking.status === 'Confirmed' && booking.paymentStatus === 'Succeeded' && (
            <>
              <CheckCircle className="text-emerald-600" />
              <span className="text-emerald-900">
                Paid and ready for the trip. Show your QR at check-in.
              </span>
            </>
          )}
          {booking.status === 'Completed' && (
            <>
              <DoneAll className="text-emerald-600" />
              <span className="text-emerald-900">
                Trip completed on {new Date(booking.checkedInAt).toLocaleDateString()}.
              </span>
            </>
          )}
          {booking.status === 'Cancelled' && (
            <>
              <Cancel className="text-rose-600" />
              <span className="text-rose-900">
                {booking.cancellationReason || 'Booking cancelled.'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ================= KEY FACTS GRID ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <FactTile
          icon={<CalendarToday />}
          label="Booking Date"
          value={new Date(booking.bookingDate).toLocaleDateString()}
        />
        <FactTile
          icon={<Group />}
          label="Guests"
          value={booking.numberOfGuests}
        />
        <FactTile
          icon={<AttachMoney />}
          label="Total"
          value={`$${Number(booking.totalAmount).toFixed(2)}`}
          valueClass="text-indigo-700 font-bold"
        />
        <FactTile
          icon={<VerifiedUser />}
          label={isTraveler ? 'Guide' : 'Traveler'}
          value={isTraveler ? booking.guideName : booking.travelerName}
        />
      </div>

      {/* ================= TRIP INFO ================= */}
      {trip && (
        <Section title="Trip Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoRow
              icon={<CalendarToday fontSize="small" />}
              label="Trip Dates"
              value={`${new Date(trip.startDate).toLocaleDateString()} → ${new Date(trip.endDate).toLocaleDateString()}`}
            />
            <InfoRow
              icon={<AttachMoney fontSize="small" />}
              label="Trip Budget"
              value={`$${Number(trip.budget).toFixed(2)}`}
            />
            <InfoRow
              icon={<EventAvailable fontSize="small" />}
              label="Total Stops"
              value={stops.length}
            />
          </div>

          {(trip.travelGroup || trip.travelPace || trip.budgetTier || trip.preferredTimes) && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Traveler Preferences
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {trip.travelGroup && (
                  <div>
                    <p className="text-xs text-slate-500">Group</p>
                    <p className="font-medium text-slate-800">
                      {trip.travelGroup} ({trip.numberOfTravelers || 1})
                    </p>
                  </div>
                )}
                {trip.budgetTier && (
                  <div>
                    <p className="text-xs text-slate-500">Budget Style</p>
                    <p className="font-medium text-slate-800">{trip.budgetTier}</p>
                  </div>
                )}
                {trip.travelPace && (
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Speed fontSize="inherit" /> Pace
                    </p>
                    <p className="font-medium text-slate-800">{trip.travelPace}</p>
                  </div>
                )}
                {trip.preferredTimes && (
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <AccessTime fontSize="inherit" /> Preferred Times
                    </p>
                    <p className="font-medium text-slate-800">
                      {trip.preferredTimes.split(',').join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {trip.specialRequests && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Special Requests</p>
                  <p className="text-sm text-slate-700">{trip.specialRequests}</p>
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* ================= ITINERARY ================= */}
      {sortedDays.length > 0 && (
        <Section title={`Itinerary (${stops.length} stops)`}>
          <div className="space-y-5">
            {sortedDays.map((day) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {day}
                  </div>
                  <p className="font-semibold text-indigo-700">Day {day}</p>
                </div>
                <div className="space-y-2 pl-9">
                  {stopsByDay[day].map((stop, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-200 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">
                            {stop.title}
                          </p>
                          {stop.description && (
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {stop.description}
                            </p>
                          )}
                          {stop.location && stop.location !== 'TBD' && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <LocationOn fontSize="inherit" /> {stop.location}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-indigo-700 whitespace-nowrap">
                          ${stop.estimatedCost}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ================= FINANCIALS ================= */}
      <Section title="Payment Details">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <DetailRow
            label="Booking Amount"
            value={`$${Number(booking.totalAmount).toFixed(2)}`}
            valueClass={isOverBudget ? 'text-rose-600 font-bold' : 'text-indigo-700 font-bold'}
          />
          <DetailRow
            label="Payment Status"
            value={booking.paymentStatus || 'Not paid'}
            valueClass={
              booking.paymentStatus === 'Succeeded'
                ? 'text-emerald-700 font-semibold'
                : booking.paymentStatus?.startsWith('Refunded') ||
                    booking.paymentStatus === 'PartiallyRefunded'
                  ? 'text-amber-700 font-semibold'
                  : 'text-slate-600'
            }
          />
          {booking.paymentMethod && (
            <DetailRow label="Method" value={booking.paymentMethod} />
          )}
          {booking.paymentAmount != null && (
            <DetailRow
              label="Paid"
              value={`$${Number(booking.paymentAmount).toFixed(2)}`}
            />
          )}
          {booking.refundAmount != null && (
            <DetailRow
              label="Refunded"
              value={`$${Number(booking.refundAmount).toFixed(2)} (${booking.refundPercentage}%)`}
              valueClass="text-amber-700 font-semibold"
            />
          )}
          {booking.refundedAt && (
            <DetailRow
              label="Refunded On"
              value={new Date(booking.refundedAt).toLocaleDateString()}
            />
          )}
        </div>
        {booking.refundAmount == null && booking.refundPercentage == null && (
          <p className="mt-3 text-xs text-slate-400 italic">
            Refund policy: 7+ days = 100% · 3-6 days = 50% · 1-2 days = 25% · &lt;24h = 0%
          </p>
        )}
      </Section>

      {/* ================= NOTES ================= */}
      {booking.notes && (
        <Section title="Traveler Notes">
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {booking.notes}
          </p>
        </Section>
      )}

      {/* ================= TIMELINE ================= */}
      <Section title="Activity">
        <div className="space-y-3">
          <TimelineItem
            icon={<BookOnline fontSize="small" />}
            label="Booking created"
            time={new Date(booking.createdAt).toLocaleString()}
            color="text-slate-600 bg-slate-100"
          />
          {booking.cancelledAt && (
            <TimelineItem
              icon={<Cancel fontSize="small" />}
              label={booking.cancellationReason || 'Booking cancelled'}
              time={new Date(booking.cancelledAt).toLocaleString()}
              color="text-rose-600 bg-rose-100"
            />
          )}
          {booking.checkedInAt && (
            <TimelineItem
              icon={<DoneAll fontSize="small" />}
              label="Checked-in by Guide"
              time={new Date(booking.checkedInAt).toLocaleString()}
              color="text-emerald-600 bg-emerald-100"
            />
          )}
        </div>
      </Section>

      {/* ================= ACTIONS ================= */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3 justify-end">
          {/* Guide actions */}
          {isLocalGuide && booking.status === 'Pending' && (
            <>
              <button
                disabled={busy}
                onClick={() => setShowReject(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Cancel fontSize="small" /> Reject Booking
              </button>
              <button
                disabled={busy}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                <CheckCircle fontSize="small" /> Confirm Booking
              </button>
            </>
          )}
          {isLocalGuide && booking.status === 'Confirmed' && (
            <button
              disabled={busy}
              onClick={() => { setShowCheckIn(true); setCheckInCode(''); }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <QrCode2 fontSize="small" /> Check-in Traveler
            </button>
          )}

          {/* Traveler actions */}
          {isTraveler && booking.status === 'Confirmed' && booking.paymentStatus !== 'Succeeded' && (
            <button
              disabled={busy}
              onClick={handlePay}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <AttachMoney fontSize="small" /> Pay ${Number(booking.totalAmount).toFixed(2)}
            </button>
          )}
          {isTraveler && ['Pending', 'Confirmed'].includes(booking.status) && (
            <button
              disabled={busy}
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <Cancel fontSize="small" /> Cancel Booking
            </button>
          )}

          {/* Admin read-only note */}
          {isAdmin && !isLocalGuide && !isTraveler && (
            <p className="text-sm text-slate-400 italic">
              Admin view · use Refunds page for refund actions
            </p>
          )}
        </div>
      </div>

      {/* ================= REJECT MODAL ================= */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <WarningAmber className="text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900">Reject Booking</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Let {booking.travelerName} know why you're rejecting this booking.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="3"
              placeholder="e.g. Fully booked on these dates..."
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setShowReject(false); setRejectReason(''); }}
                className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={busy}
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
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Check-in: {booking.tripTitle}
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
                onClick={() => { setShowCheckIn(false); setCheckInCode(''); }}
                className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={busy}
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
// Layout helpers
// ============================================================
const Section = ({ title, children }) => (
  <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
    <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
    {children}
  </div>
);

const FactTile = ({ icon, label, value, valueClass = 'text-slate-800' }) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
      {React.cloneElement(icon, { fontSize: 'small' })}
      <span>{label}</span>
    </div>
    <p className={`font-semibold truncate ${valueClass}`}>{value}</p>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs text-slate-500 flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="mt-1 font-medium text-slate-800 text-sm">{value}</p>
  </div>
);

const DetailRow = ({ label, value, valueClass = 'text-slate-800' }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
  </div>
);

const TimelineItem = ({ icon, label, time, color }) => (
  <div className="flex items-start gap-3">
    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{time}</p>
    </div>
  </div>
);

export default BookingDetailPage;