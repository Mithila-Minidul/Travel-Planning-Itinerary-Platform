import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/booking_service.dart';
import 'payment_screen.dart';

class BookingDetailScreen extends StatefulWidget {
  final String bookingId;
  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  State<BookingDetailScreen> createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends State<BookingDetailScreen> {
  Map<String, dynamic>? _booking;
  bool _loading = true;
  String? _error;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await BookingService.getBookingById(widget.bookingId);
      setState(() => _booking = data);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _cancel() async {
    final reasonController = TextEditingController();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Booking'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Refund policy applies based on how many days before the trip.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Reason (optional)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep Booking'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Cancel Booking'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _busy = true);
    try {
      await BookingService.cancelBooking(
        widget.bookingId,
        reason: reasonController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Booking cancelled.'),
          backgroundColor: Colors.green,
        ),
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _openPayment() async {
    final updated = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentScreen(bookingId: widget.bookingId),
      ),
    );
    if (updated == true) _load();
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'Pending':
        return Colors.orange;
      case 'Confirmed':
        return Colors.blue;
      case 'Completed':
        return Colors.green;
      case 'Cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Details'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_error!, textAlign: TextAlign.center),
        ),
      );
    }
    if (_booking == null) {
      return const Center(child: Text('Booking not found'));
    }

    final b = _booking!;
    final status = (b['status'] ?? 'Pending').toString();
    final paymentStatus = b['paymentStatus']?.toString();
    final total = (b['totalAmount'] ?? 0).toDouble();
    final date = DateTime.tryParse(b['bookingDate'] ?? '');
    final code = (b['confirmationCode'] ?? '').toString();
    final canPay = status == 'Confirmed' && paymentStatus != 'Succeeded';
    final canCancel = status == 'Pending' || status == 'Confirmed';
    final canShowQr = status == 'Confirmed' && paymentStatus == 'Succeeded' ||
        status == 'Completed';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // -------- HEADER --------
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      b['tripTitle'] ?? '',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor(status).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(
                        color: _statusColor(status),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    b['destinationName'] ?? '',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Stats grid
              Row(
                children: [
                  _statTile(Icons.person, 'Guide',
                      b['guideName'] ?? '—'),
                  const SizedBox(width: 12),
                  _statTile(
                    Icons.calendar_today,
                    'Date',
                    date != null
                        ? '${date.day}/${date.month}/${date.year}'
                        : '—',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _statTile(
                    Icons.people,
                    'Guests',
                    '${b['numberOfGuests'] ?? 1}',
                  ),
                  const SizedBox(width: 12),
                  _statTile(
                    Icons.attach_money,
                    'Total',
                    '\$${total.toStringAsFixed(2)}',
                    valueColor: const Color(0xFF4F46E5),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // -------- QR CODE --------
        if (canShowQr)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                const Text(
                  'Show this QR to your Guide',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Scan at check-in to mark the trip as completed.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: QrImageView(
                    data: code,
                    version: QrVersions.auto,
                    size: 200,
                    eyeStyle: const QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Color(0xFF0F172A),
                    ),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  code,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 3,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
        if (canShowQr) const SizedBox(height: 16),

        // -------- STATUS BANNER --------
        if (status == 'Pending')
          _infoBox(
            Icons.hourglass_empty,
            Colors.orange,
            'Waiting for Guide',
            'Your booking was sent to ${b['guideName']}. You will be notified once confirmed.',
          )
        else if (status == 'Confirmed' && paymentStatus != 'Succeeded')
          _infoBox(
            Icons.payment,
            Colors.blue,
            'Ready to Pay',
            'Booking confirmed by the Guide. Tap "Pay Now" to complete payment.',
          )
        else if (status == 'Confirmed' && paymentStatus == 'Succeeded')
          _infoBox(
            Icons.check_circle,
            Colors.green,
            'Paid',
            'Payment received. Show your QR code to the Guide on the trip day.',
          )
        else if (status == 'Cancelled')
          _infoBox(
            Icons.cancel,
            Colors.red,
            'Cancelled',
            b['cancellationReason'] ?? 'Booking was cancelled.',
          )
        else if (status == 'Completed')
          _infoBox(
            Icons.done_all,
            Colors.green,
            'Completed',
            'Checked in on ${b['checkedInAt'] ?? ''}.',
          ),
        const SizedBox(height: 12),

        // -------- REFUND INFO --------
        if (b['refundAmount'] != null && b['refundPercentage'] != null)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Row(
              children: [
                const Icon(Icons.replay, color: Colors.orange),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Refund',
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey),
                      ),
                      Text(
                        '\$${(b['refundAmount'] as num).toStringAsFixed(2)} '
                        '(${b['refundPercentage']}%)',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),

        // -------- NOTES --------
        if ((b['notes'] ?? '').toString().isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Notes',
                    style: TextStyle(fontSize: 11, color: Colors.grey)),
                const SizedBox(height: 4),
                Text(b['notes'].toString()),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // -------- ACTIONS --------
        if (canPay)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _busy ? null : _openPayment,
              icon: const Icon(Icons.payment),
              label: Text(
                'Pay Now  •  \$${total.toStringAsFixed(2)}',
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green.shade600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        if (canPay) const SizedBox(height: 10),
        if (canCancel)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _busy ? null : _cancel,
              icon: const Icon(Icons.cancel, color: Colors.red),
              label: const Text('Cancel Booking'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _statTile(IconData icon, String label, String value,
      {Color? valueColor}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: Colors.grey[700]),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          fontSize: 10, color: Colors.grey)),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: valueColor ?? const Color(0xFF0F172A),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoBox(IconData icon, Color color, String title, String body) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                      fontWeight: FontWeight.bold, color: color),
                ),
                const SizedBox(height: 2),
                Text(
                  body,
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}