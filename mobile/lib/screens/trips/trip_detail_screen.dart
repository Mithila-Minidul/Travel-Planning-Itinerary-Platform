import 'package:flutter/material.dart';
import '../../services/trip_service.dart';
import '../../widgets/ai_progress_widget.dart';
import '../../services/booking_service.dart';
import '../bookings/booking_list_screen.dart';

class TripDetailScreen extends StatefulWidget {
  final String tripId;
  const TripDetailScreen({super.key, required this.tripId});

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> {
  Map<String, dynamic>? _trip;
  bool _loading = true;
  bool _bookingBusy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTrip();
  }

  Future<void> _loadTrip() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final trip = await TripService.getTripById(widget.tripId);
      setState(() => _trip = trip);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _bookTrip() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Book This Trip?'),
        content: Text(
          'Total: \$${((_trip?['totalEstimatedCost'] ?? 0) as num).toDouble().toStringAsFixed(2)}\n\n'
          'This will send a booking request to your local guide for the whole trip.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Book Now',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _bookingBusy = true);
    try {
      final startDate = DateTime.tryParse(_trip?['startDate'] ?? '') ??
          DateTime.now().add(const Duration(days: 7));
      final guests = (_trip?['numberOfTravelers'] ?? 1) as int;

      await BookingService.createBooking(
        tripId: widget.tripId,
        numberOfGuests: guests < 1 ? 1 : guests,
        bookingDate: startDate,
        notes: _trip?['specialRequests'],
      );

      if (!mounted) return;
      await showDialog(
        context: context,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Booking Created'),
            ],
          ),
          content: const Text(
            'Your booking request has been sent to the guide. '
            'You will be notified once it is confirmed.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const BookingListScreen()),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
        ),
      );
    } finally {
      if (mounted) setState(() => _bookingBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip Details'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _loadTrip,
        child: _buildBody(),
      ),
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
    if (_trip == null) return const Center(child: Text('Trip not found'));

    final trip = _trip!;
    final stops = (trip['tripStops'] as List<dynamic>? ?? []);
    final totalCost = (trip['totalEstimatedCost'] ?? 0).toDouble();
    final budget = (trip['budget'] ?? 0).toDouble();
    final isOverBudget = totalCost > budget;

    // Group stops by day
    final stopsByDay = <int, List<dynamic>>{};
    for (final s in stops) {
      final day = s['dayNumber'] as int? ?? 1;
      stopsByDay.putIfAbsent(day, () => []).add(s);
    }
    final sortedDays = stopsByDay.keys.toList()..sort();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ================= HEADER =================
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
                trip['title'] ?? '',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    trip['destinationName'] ?? '',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
              if ((trip['objective'] ?? '').toString().isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  trip['objective'],
                  style: TextStyle(color: Colors.grey.shade700),
                ),
              ],
              const SizedBox(height: 14),
              // Interests chips
              if ((trip['interests'] ?? '').toString().isNotEmpty)
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: (trip['interests'] as String)
                      .split(',')
                      .where((i) => i.trim().isNotEmpty)
                      .map((i) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF4F46E5).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              i.trim(),
                              style: const TextStyle(
                                color: Color(0xFF4F46E5),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ))
                      .toList(),
                ),
              const SizedBox(height: 16),
              // Stats row
              Row(
                children: [
                  _statTile(
                    Icons.attach_money,
                    'Budget',
                    '\$${budget.toStringAsFixed(0)}',
                    Colors.indigo,
                  ),
                  const SizedBox(width: 12),
                  _statTile(
                    Icons.trending_up,
                    'Est. Cost',
                    '\$${totalCost.toStringAsFixed(0)}',
                    isOverBudget ? Colors.red : Colors.green,
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ================= ASSIGNED LOCAL GUIDE =================
        if ((trip['guideName'] ?? '').toString().isNotEmpty)
          _buildGuideCard(trip),

        // ================= TRIP PREFERENCES =================
        _buildPreferencesCard(trip),

        // ================= AI PROGRESS WIDGET =================
        AiProgressWidget(status: (trip['status'] ?? 'Pending').toString()),
        const SizedBox(height: 16),

        // ================= REJECTION BANNER =================
        if ((trip['status'] ?? '') == 'Rejected' &&
            (trip['rejectionReason'] ?? '').toString().isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.red.shade200, width: 1.5),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.cancel, color: Colors.red.shade700, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Trip Rejected by Travel Agent',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.red.shade900,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        trip['rejectionReason'].toString(),
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.red.shade900,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

        // ================= BOOK NOW BUTTON =================
        _buildBookNowButton(trip),
        const SizedBox(height: 16),

        // ================= ITINERARY =================
        const Text(
          'AI-Generated Itinerary',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),

        // AI warning banner — appears only when the trip has errors
        if ((trip['aiErrors'] ?? '').toString().isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.shade300, width: 1.5),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.orange.shade800,
                  size: 26,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI could not build a full itinerary',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.orange.shade900,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        trip['aiErrors'].toString(),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.orange.shade900,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

        if (sortedDays.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              border: Border.all(
                  color: Colors.grey.shade300, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text(
                'No itinerary stops yet.',
                style: TextStyle(color: Colors.grey),
              ),
            ),
          )
        else
          ...sortedDays.map((day) {
            final dayStops = stopsByDay[day]!;
            dayStops.sort((a, b) =>
                (a['orderIndex'] ?? 0).compareTo(b['orderIndex'] ?? 0));
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 8),
                  child: Text(
                    'Day $day',
                    style: const TextStyle(
                      color: Color(0xFF4F46E5),
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
                ...dayStops.map((stop) => _stopCard(stop)),
                const SizedBox(height: 8),
              ],
            );
          }),
        const SizedBox(height: 24),
      ],
    );
  }

  // ================= BOOK NOW BUTTON =================
  // Disabled until the Travel Agent approves the trip.
  // Becomes active and functional once status == 'Approved'.
  Widget _buildBookNowButton(dynamic trip) {
    final status = (trip['status'] ?? 'Pending').toString();
    final isApproved = status == 'Approved';
    final isRejected = status == 'Rejected';
    final stops = (trip['tripStops'] as List<dynamic>? ?? []);
    final hasStops = stops.any((s) => s['experienceId'] != null);
    final canBook = isApproved && hasStops;

    // -------- Choose colors & label per state --------
    Color bg;
    Color fg;
    IconData icon;
    String label;
    String? subtitle;

    if (isRejected) {
      bg = Colors.grey.shade300;
      fg = Colors.grey.shade600;
      icon = Icons.block;
      label = 'Trip Rejected';
      subtitle = 'The Travel Agent rejected this itinerary.';
    } else if (status == 'Pending') {
      bg = Colors.grey.shade300;
      fg = Colors.grey.shade600;
      icon = Icons.lock_clock;
      label = 'Awaiting Approval';
      subtitle = 'Book Now unlocks when a Travel Agent approves.';
    } else if (isApproved && !hasStops) {
      bg = Colors.grey.shade300;
      fg = Colors.grey.shade600;
      icon = Icons.error_outline;
      label = 'Nothing to Book';
      subtitle = 'This trip has no bookable experiences.';
    } else {
      bg = const Color(0xFF4F46E5);
      fg = Colors.white;
      icon = Icons.shopping_cart_checkout;
      label = 'Book This Trip';
      subtitle = null;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ElevatedButton.icon(
          onPressed: canBook && !_bookingBusy ? _bookTrip : null,
          icon: _bookingBusy
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Icon(icon),
          label: Text(
            _bookingBusy ? 'Booking...' : label,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: bg,
            foregroundColor: fg,
            disabledBackgroundColor: bg,
            disabledForegroundColor: fg,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 11,
              color: Colors.grey,
            ),
          ),
        ],
      ],
    );
  }

  // Trip Preferences Card
  Widget _buildPreferencesCard(dynamic trip) {
    final travelGroup = (trip['travelGroup'] ?? '').toString();
    final numberOfTravelers = trip['numberOfTravelers'] ?? 1;
    final budgetTier = (trip['budgetTier'] ?? '').toString();
    final travelPace = (trip['travelPace'] ?? '').toString();
    final preferredTimes = (trip['preferredTimes'] ?? '').toString();
    final specialRequests = (trip['specialRequests'] ?? '').toString();

    final hasAny = travelGroup.isNotEmpty ||
        budgetTier.isNotEmpty ||
        travelPace.isNotEmpty ||
        preferredTimes.isNotEmpty ||
        specialRequests.isNotEmpty;

    if (!hasAny) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TRIP PREFERENCES',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 12,
            runSpacing: 10,
            children: [
              if (travelGroup.isNotEmpty)
                _prefTile('Group', '$travelGroup ($numberOfTravelers)'),
              if (budgetTier.isNotEmpty)
                _prefTile('Budget Style', budgetTier),
              if (travelPace.isNotEmpty)
                _prefTile('Pace', travelPace),
              if (preferredTimes.isNotEmpty)
                _prefTile('Times', preferredTimes.split(',').join(', ')),
            ],
          ),
          if (specialRequests.isNotEmpty) ...[
            const SizedBox(height: 12),
            Divider(color: Colors.grey.shade300, height: 1),
            const SizedBox(height: 10),
            const Text(
              'Special Requests',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              specialRequests,
              style: const TextStyle(fontSize: 13, color: Colors.black87),
            ),
          ],
        ],
      ),
    );
  }

  Widget _prefTile(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Colors.grey),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  // Assigned Local Guide Card
  Widget _buildGuideCard(dynamic trip) {
    final guideName = (trip['guideName'] ?? '').toString();
    final guideCity = (trip['guideCity'] ?? '').toString();
    final initial = guideName.isNotEmpty ? guideName[0].toUpperCase() : '?';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF4F46E5).withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF4F46E5).withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: const Color(0xFF4F46E5),
            child: Text(
              initial,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Assigned Local Guide',
                  style: TextStyle(color: Colors.grey, fontSize: 11),
                ),
                Text(
                  guideName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                if (guideCity.isNotEmpty)
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 12, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        guideCity,
                        style: const TextStyle(
                            color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF4F46E5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'Your Guide',
              style: TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statTile(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(color: Colors.grey, fontSize: 11)),
                Text(
                  value,
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _stopCard(dynamic stop) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF4F46E5).withOpacity(0.05),
        border: const Border(
          left: BorderSide(color: Color(0xFF4F46E5), width: 4),
        ),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(8),
          bottomRight: Radius.circular(8),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  stop['title'] ?? '',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              Text(
                '\$${stop['estimatedCost'] ?? 0}',
                style: const TextStyle(
                  color: Color(0xFF4F46E5),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          if ((stop['description'] ?? '').toString().isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              stop['description'],
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
          if ((stop['location'] ?? '').toString().isNotEmpty &&
              stop['location'] != 'TBD') ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on, size: 12, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  stop['location'],
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}