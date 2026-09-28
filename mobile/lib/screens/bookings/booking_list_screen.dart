import 'package:flutter/material.dart';
import '../../services/booking_service.dart';
import 'booking_detail_screen.dart';

class BookingListScreen extends StatefulWidget {
  const BookingListScreen({super.key});

  @override
  State<BookingListScreen> createState() => _BookingListScreenState();
}

class _BookingListScreenState extends State<BookingListScreen> {
  List<dynamic> _allBookings = [];
  List<dynamic> _filtered = [];
  bool _loading = true;
  String? _error;
  String _tab = 'All';

  static const _tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

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
      final list = await BookingService.getMyBookings();
      setState(() {
        _allBookings = list;
        _applyFilter();
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  void _applyFilter() {
    setState(() {
      _filtered = _tab == 'All'
          ? _allBookings
          : _allBookings
              .where((b) => (b['status'] ?? '') == _tab)
              .toList();
    });
  }

  int _countFor(String tab) {
    if (tab == 'All') return _allBookings.length;
    return _allBookings.where((b) => (b['status'] ?? '') == tab).length;
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
        title: const Text('My Bookings'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
        ],
      ),
      body: Column(
        children: [
          // Tabs
          if (!_loading && _error == null && _allBookings.isNotEmpty)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _tabs.map((t) {
                    final active = _tab == t;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text('$t (${_countFor(t)})'),
                        selected: active,
                        onSelected: (_) {
                          _tab = t;
                          _applyFilter();
                        },
                        selectedColor: const Color(0xFF4F46E5),
                        labelStyle: TextStyle(
                          color: active ? Colors.white : Colors.grey[700],
                          fontSize: 12,
                          fontWeight:
                              active ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: _buildBody(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return ListView(
        children: [
          const SizedBox(height: 120),
          const Icon(Icons.error_outline, size: 60, color: Colors.grey),
          const SizedBox(height: 12),
          Center(child: Text(_error!, textAlign: TextAlign.center)),
          const SizedBox(height: 16),
          Center(
            child: ElevatedButton(
              onPressed: _load,
              child: const Text('Retry'),
            ),
          ),
        ],
      );
    }
    if (_allBookings.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 120),
          Icon(Icons.confirmation_number_outlined,
              size: 80, color: Colors.grey),
          SizedBox(height: 12),
          Center(
            child: Text('No bookings yet.',
                style: TextStyle(fontSize: 16, color: Colors.grey)),
          ),
          SizedBox(height: 6),
          Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Open an approved trip and tap "Book This Trip" to get started.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            ),
          ),
        ],
      );
    }
    if (_filtered.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 120),
          const Icon(Icons.filter_list_off, size: 60, color: Colors.grey),
          const SizedBox(height: 12),
          Center(
            child: Text('No $_tab bookings.',
                style: const TextStyle(fontSize: 15, color: Colors.grey)),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _filtered.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, i) => _buildCard(_filtered[i]),
    );
  }

  Widget _buildCard(dynamic b) {
    final status = (b['status'] ?? 'Pending').toString();
    final date = DateTime.tryParse(b['bookingDate'] ?? '');
    final total = (b['totalAmount'] ?? 0).toDouble();
    final guests = b['numberOfGuests'] ?? 1;
    final code = b['confirmationCode'] ?? '';
    final paymentStatus = b['paymentStatus']?.toString();

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => BookingDetailScreen(bookingId: b['id']),
            ),
          );
          _load();
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title + status
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      b['tripTitle'] ?? 'Untitled Trip',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
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

              // Destination + Date
              Row(
                children: [
                  const Icon(Icons.location_on,
                      size: 14, color: Color(0xFF4F46E5)),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      b['destinationName'] ?? '',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              if (date != null)
                Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 12, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      '${date.day}/${date.month}/${date.year}',
                      style:
                          const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              const SizedBox(height: 10),

              // Stats row
              Row(
                children: [
                  Expanded(
                    child: _miniStat('Guests', '$guests'),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _miniStat(
                      'Total',
                      '\$${total.toStringAsFixed(2)}',
                      valueColor: const Color(0xFF4F46E5),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Confirmation + payment
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      code,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (paymentStatus != null && paymentStatus != 'null')
                    Expanded(
                      child: Text(
                        'Payment: $paymentStatus',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: paymentStatus == 'Succeeded'
                              ? Colors.green.shade700
                              : paymentStatus.startsWith('Refunded') ||
                                      paymentStatus == 'PartiallyRefunded'
                                  ? Colors.orange.shade800
                                  : Colors.grey[700],
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _miniStat(String label, String value, {Color? valueColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(fontSize: 9, color: Colors.grey),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: valueColor ?? const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}