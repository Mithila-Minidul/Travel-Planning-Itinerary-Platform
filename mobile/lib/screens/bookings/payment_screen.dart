import 'package:flutter/material.dart';
import '../../services/booking_service.dart';
import '../../services/payment_service.dart';
import 'package:payhere_mobilesdk_flutter/payhere_mobilesdk_flutter.dart';

class PaymentScreen extends StatefulWidget {
  final String bookingId;
  const PaymentScreen({super.key, required this.bookingId});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  Map<String, dynamic>? _booking;
  bool _loading = true;
  bool _busy = false;
  String _method = 'PayHere';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await BookingService.getBookingById(widget.bookingId);
      setState(() => _booking = data);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

    Future<void> _pay() async {
    if (_method == 'PayHere') {
      await _payWithPayHere();
      return;
    }
    // Mock path (fallback for offline demos)
    setState(() => _busy = true);
    try {
      await PaymentService.processPayment(widget.bookingId, method: _method);
      if (!mounted) return;
      await _showSuccessDialog();
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _payWithPayHere() async {
    setState(() => _busy = true);
    try {
      final payload = await PaymentService.initiatePayHere(widget.bookingId);

      final Map<String, dynamic> sdkPayload = {
        'sandbox': payload['sandbox'] == 'true' || payload['sandbox'] == true,
        'merchant_id': payload['merchant_id'],
        'return_url': payload['return_url'],
        'cancel_url': payload['cancel_url'],
        'notify_url': payload['notify_url'],
        'order_id': payload['order_id'],
        'items': payload['items'],
        'currency': payload['currency'],
        'amount': payload['amount'],
        'hash': payload['hash'],
        'first_name': payload['first_name'],
        'last_name': payload['last_name'],
        'email': payload['email'],
        'phone': payload['phone'],
        'address': payload['address'],
        'city': payload['city'],
        'country': payload['country'],
      };

      if (!mounted) return;
      setState(() => _busy = false);

      PayHere.startPayment(
        sdkPayload,
        (paymentId) async {
          if (!mounted) return;
          await _showSuccessDialog();
          if (!mounted) return;
          Navigator.pop(context, true);
        },
        (error) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Payment failed: $error')),
          );
        },
        () {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Payment window dismissed.')),
          );
        },
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _showSuccessDialog() {
    return showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Payment Successful'),
          ],
        ),
        content: const Text(
          'Your payment has been processed. Show your QR code at the trip location for check-in.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _booking == null
              ? const Center(child: Text('Booking not found'))
              : _buildBody(),
    );
  }

  Widget _buildBody() {
    final b = _booking!;
    final total = (b['totalAmount'] ?? 0).toDouble();
    final date = DateTime.tryParse(b['bookingDate'] ?? '');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Trip summary
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
              Text(
                b['tripTitle'] ?? '',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${date != null ? '${date.day}/${date.month}/${date.year}' : ''} · '
                '${b['numberOfGuests']} guest(s) · Guide: ${b['guideName']}',
                style: const TextStyle(fontSize: 13, color: Colors.grey),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Total
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Total Amount',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 4),
              Text(
                '\$${total.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Method
        const Text(
          'Payment Method',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        ),
        const SizedBox(height: 10),
        _methodTile('PayHere', 'PayHere (Card / Wallet)', Icons.credit_card),
        const SizedBox(height: 8),
        _methodTile('Mock', 'Demo Card (Mock)', Icons.science_outlined),
        const SizedBox(height: 24),

        // Pay button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _busy ? null : _pay,
            icon: _busy
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.lock),
            label: Text(
              _busy
                  ? 'Processing...'
                  : 'Pay \$${total.toStringAsFixed(2)}',
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
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
        const SizedBox(height: 12),
        Center(
          child: Text(
            _method == 'PayHere'
                ? '🔒 Secure checkout via PayHere (Sandbox)'
                : '🧪 Demo mode — no real charge.',
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
        ),
      ],
    );
  }

  Widget _methodTile(String value, String label, IconData icon) {
    final selected = _method == value;
    return InkWell(
      onTap: () => setState(() => _method = value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected
              ? const Color(0xFF4F46E5).withOpacity(0.08)
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? const Color(0xFF4F46E5)
                : Colors.grey.shade300,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color:
                  selected ? const Color(0xFF4F46E5) : Colors.grey[700],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight:
                      selected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: _method,
              onChanged: (v) => setState(() => _method = v!),
              activeColor: const Color(0xFF4F46E5),
            ),
          ],
        ),
      ),
    );
  }
}