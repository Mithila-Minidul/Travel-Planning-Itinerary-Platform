import 'package:flutter/material.dart';
import '../../models/trip.dart';
import '../../services/trip_service.dart';
import 'trip_builder_screen.dart';
import 'trip_details_screen.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  late Future<List<Trip>> _future;

  @override
  void initState() {
    super.initState();
    _future = TripService.getMyTrips();
  }

  Future<void> _refresh() async {
    setState(() => _future = TripService.getMyTrips());
    await _future;
  }

  Future<void> _create() async {
    final created = await Navigator.push<Trip>(
      context,
      MaterialPageRoute(builder: (_) => const TripBuilderScreen()),
    );
    if (created != null && mounted) _refresh();
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return const Color(0xFF059669);
      case 'pendingreview':
        return const Color(0xFFD97706);
      case 'generating':
        return const Color(0xFF4F46E5);
      case 'rejected':
      case 'revisionrequested':
        return const Color(0xFFDC2626);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _statusLabel(String status) {
    if (status == 'PendingReview') return 'Pending Review';
    if (status == 'RevisionRequested') return 'Revision Requested';
    return status;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Trips', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _create,
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Trip'),
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<Trip>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return _Message(
                icon: Icons.cloud_off,
                text: snapshot.error.toString().replaceFirst('Exception: ', ''),
                action: _refresh,
              );
            }
            final trips = snapshot.data ?? [];
            if (trips.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 150),
                  Icon(Icons.flight_takeoff, size: 58, color: Color(0xFF94A3B8)),
                  SizedBox(height: 16),
                  Center(child: Text('No trips yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                  SizedBox(height: 8),
                  Center(child: Text('Create a trip and build an AI itinerary.', style: TextStyle(color: Color(0xFF64748B)))),
                ],
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
              itemCount: trips.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final trip = trips[index];
                return InkWell(
                  onTap: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => TripDetailsScreen(tripId: trip.id)),
                    );
                    if (mounted) _refresh();
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEEF2FF),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.map_outlined, color: Color(0xFF4F46E5)),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(trip.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 5),
                              Text(
                                '${_date(trip.startDate)} - ${_date(trip.endDate)}',
                                style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                              ),
                              const SizedBox(height: 7),
                              Text('${trip.stops.length} stop${trip.stops.length == 1 ? '' : 's'}',
                                  style: const TextStyle(color: Color(0xFF475569), fontSize: 12)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                              decoration: BoxDecoration(
                                color: _statusColor(trip.status).withOpacity(.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(_statusLabel(trip.status),
                                  style: TextStyle(color: _statusColor(trip.status), fontSize: 11, fontWeight: FontWeight.w700)),
                            ),
                            const SizedBox(height: 8),
                            const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  String _date(DateTime d) => '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

class _Message extends StatelessWidget {
  final IconData icon;
  final String text;
  final Future<void> Function() action;
  const _Message({required this.icon, required this.text, required this.action});

  @override
  Widget build(BuildContext context) => ListView(
    physics: const AlwaysScrollableScrollPhysics(),
    children: [
      const SizedBox(height: 160),
      Icon(icon, size: 48, color: const Color(0xFF94A3B8)),
      const SizedBox(height: 12),
      Center(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 24), child: Text(text, textAlign: TextAlign.center))),
      const SizedBox(height: 14),
      Center(child: TextButton(onPressed: action, child: const Text('Try again'))),
    ],
  );
}
