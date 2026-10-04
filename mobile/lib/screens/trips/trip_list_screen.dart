import 'package:flutter/material.dart';
import '../../services/trip_service.dart';
import 'trip_detail_screen.dart';

class TripListScreen extends StatefulWidget {
  const TripListScreen({super.key});

  @override
  State<TripListScreen> createState() => _TripListScreenState();
}

class _TripListScreenState extends State<TripListScreen> {
  List<dynamic> _allTrips = [];
  List<dynamic> _filteredTrips = [];
  bool _loading = true;
  String? _error;
  String _statusFilter = 'All';

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final trips = await TripService.getMyTrips();
      setState(() {
        _allTrips = trips;
        _applyFilter();
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _applyFilter() {
    setState(() {
      _filteredTrips = _statusFilter == 'All'
          ? _allTrips
          : _allTrips
              .where((t) => (t['status'] ?? '') == _statusFilter)
              .toList();
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Approved':
        return Colors.green;
      case 'Rejected':
        return Colors.red;
      case 'Pending':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  int _countOf(String status) {
    if (status == 'All') return _allTrips.length;
    return _allTrips.where((t) => (t['status'] ?? '') == status).length;
  }

  Future<void> _confirmDelete(dynamic trip) async {
    final tripId = trip['id']?.toString() ?? '';
    final title = trip['title'] ?? 'this trip';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Trip'),
        content: Text('Are you sure you want to permanently delete "$title"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await TripService.deleteTrip(tripId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Trip deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
        }
        _loadTrips();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString().replaceAll('Exception: ', '')),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Trips'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // ============ STATUS FILTER TABS ============
          if (!_loading && _error == null && _allTrips.isNotEmpty)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['All', 'Pending', 'Approved', 'Rejected']
                      .map((tab) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text('$tab (${_countOf(tab)})'),
                              selected: _statusFilter == tab,
                              onSelected: (_) {
                                _statusFilter = tab;
                                _applyFilter();
                              },
                              selectedColor: const Color(0xFF4F46E5),
                              labelStyle: TextStyle(
                                color: _statusFilter == tab
                                    ? Colors.white
                                    : Colors.grey[700],
                                fontSize: 12,
                                fontWeight: _statusFilter == tab
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                          ))
                      .toList(),
                ),
              ),
            ),

          // ============ CONTENT ============
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadTrips,
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
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(_error!, textAlign: TextAlign.center),
          ),
          const SizedBox(height: 16),
          Center(
            child: ElevatedButton(
              onPressed: _loadTrips,
              child: const Text('Retry'),
            ),
          ),
        ],
      );
    }

    if (_allTrips.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 120),
          Icon(Icons.luggage_outlined, size: 80, color: Colors.grey),
          SizedBox(height: 12),
          Center(
            child: Text(
              'No trips yet.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
          SizedBox(height: 6),
          Center(
            child: Text(
              'Browse an experience and tap\n"Create Trip with AI" to get started.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
        ],
      );
    }

    if (_filteredTrips.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 120),
          const Icon(Icons.filter_list_off, size: 60, color: Colors.grey),
          const SizedBox(height: 12),
          Center(
            child: Text(
              'No $_statusFilter trips.',
              style: const TextStyle(fontSize: 15, color: Colors.grey),
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredTrips.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => _buildTripCard(_filteredTrips[index]),
    );
  }

  Widget _buildTripCard(dynamic trip) {
    final status = (trip['status'] ?? 'Pending').toString();
    final startDate = DateTime.tryParse(trip['startDate'] ?? '');
    final endDate = DateTime.tryParse(trip['endDate'] ?? '');
    final interests = (trip['interests'] ?? '').toString();
    final stops = (trip['tripStops'] as List<dynamic>? ?? []);
    final stopsCount = stops.length;
    final totalCost = (trip['totalEstimatedCost'] ?? 0).toDouble();
    final budget = (trip['budget'] ?? 0).toDouble();
    final isOverBudget = totalCost > budget;
    final guideName = (trip['guideName'] ?? '').toString();
    final travelGroup = (trip['travelGroup'] ?? '').toString();
    final numberOfTravelers = trip['numberOfTravelers'] ?? 1;
    final travelPace = (trip['travelPace'] ?? '').toString();
    final budgetTier = (trip['budgetTier'] ?? '').toString();
    final canDelete = status == 'Approved' || status == 'Rejected';

    return Card(
      elevation: 1,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => TripDetailScreen(tripId: trip['id']),
            ),
          );
          _loadTrips();
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ============ TITLE + STATUS + DELETE ============
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      trip['title'] ?? 'Untitled Trip',
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
                  if (canDelete) ...[
                    const SizedBox(width: 4),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      splashRadius: 18,
                      tooltip: 'Delete Trip',
                      onPressed: () => _confirmDelete(trip),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 8),

              // ============ DESTINATION + DATES ============
              Row(
                children: [
                  const Icon(Icons.location_on,
                      size: 14, color: Color(0xFF4F46E5)),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      trip['destinationName'] ?? '',
                      style: const TextStyle(
                        color: Color(0xFF475569),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              if (startDate != null && endDate != null)
                Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 12, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      '${startDate.day}/${startDate.month}/${startDate.year} → '
                      '${endDate.day}/${endDate.month}/${endDate.year}',
                      style: const TextStyle(
                          color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),

              // ============ INTEREST CHIPS ============
              if (interests.isNotEmpty) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: interests
                      .split(',')
                      .where((i) => i.trim().isNotEmpty)
                      .take(4)
                      .map((i) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF4F46E5).withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              i.trim(),
                              style: const TextStyle(
                                color: Color(0xFF4F46E5),
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ))
                      .toList(),
                ),
              ],

              // ============ STATS: BUDGET / EST / STOPS ============
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _miniStat(
                      label: 'Budget',
                      value: '\$${budget.toStringAsFixed(0)}',
                      bgColor: Colors.grey.shade100,
                      valueColor: const Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _miniStat(
                      label: 'Est.',
                      value: '\$${totalCost.toStringAsFixed(0)}',
                      bgColor: isOverBudget
                          ? Colors.red.shade50
                          : Colors.green.shade50,
                      valueColor: isOverBudget
                          ? Colors.red.shade700
                          : Colors.green.shade700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _miniStat(
                      label: 'Stops',
                      value: '$stopsCount',
                      bgColor: Colors.grey.shade100,
                      valueColor: const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),

              // ============ PREFERENCES MINI ROW ============
              if (travelGroup.isNotEmpty || travelPace.isNotEmpty || budgetTier.isNotEmpty) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 10,
                  runSpacing: 4,
                  children: [
                    if (travelGroup.isNotEmpty)
                      _prefIcon(
                        Icons.group,
                        '$travelGroup ($numberOfTravelers)',
                      ),
                    if (travelPace.isNotEmpty)
                      _prefIcon(Icons.speed, travelPace),
                    if (budgetTier.isNotEmpty)
                      _prefIcon(Icons.attach_money, budgetTier),
                  ],
                ),
              ],

              // ============ GUIDE + TRAVELER ROW ============
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 10),
              Row(
                children: [
                  // Guide side
                  if (guideName.isNotEmpty) ...[
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: const Color(0xFF4F46E5),
                      child: Text(
                        guideName[0].toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Guide',
                            style: TextStyle(
                                fontSize: 10, color: Colors.grey),
                          ),
                          Text(
                            guideName,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF334155),
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: Colors.grey.shade200,
                      child: const Icon(Icons.person,
                          size: 14, color: Colors.grey),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'No guide assigned yet',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                  // Chevron
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _miniStat({
    required String label,
    required String value,
    required Color bgColor,
    required Color valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 9,
              color: Colors.grey,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _prefIcon(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: const Color(0xFF4F46E5)),
        const SizedBox(width: 3),
        Text(
          text,
          style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
        ),
      ],
    );
  }
}