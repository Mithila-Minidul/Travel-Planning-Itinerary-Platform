import 'package:flutter/material.dart';
import '../../models/trip.dart';
import '../../models/ai_workflow.dart';
import '../../services/trip_service.dart';
import '../../services/ai_service.dart';
import '../ai/ai_generation_screen.dart';

class TripDetailsScreen extends StatefulWidget {
  final String tripId;
  const TripDetailsScreen({super.key, required this.tripId});

  @override
  State<TripDetailsScreen> createState() => _TripDetailsScreenState();
}

class _TripDetailsScreenState extends State<TripDetailsScreen> {
  late Future<Trip> _future;

  @override
  void initState() {
    super.initState();
    _future = TripService.getById(widget.tripId);
  }

  Future<void> _reload() async {
    setState(() => _future = TripService.getById(widget.tripId));
    await _future;
  }

  Future<void> _generate() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => AiGenerationScreen(tripId: widget.tripId)),
    );
    if (mounted) _reload();
  }

  Future<void> _delete(Trip trip) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete trip?'),
        content: Text('Delete "${trip.title}"? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await TripService.delete(widget.tripId);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Trip Details', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: FutureBuilder<Trip>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) {
            return Center(child: Text(snapshot.error.toString()));
          }
          final trip = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
              children: [
                Text(trip.title, style: const TextStyle(fontSize: 25, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                const SizedBox(height: 7),
                Text(trip.objective, style: const TextStyle(color: Color(0xFF64748B))),
                const SizedBox(height: 14),
                _status(trip.status),
                const SizedBox(height: 16),
                _infoCard(trip),
                const SizedBox(height: 18),
                if (trip.reviewNotes != null && trip.reviewNotes!.isNotEmpty)
                  _reviewCard(trip.reviewNotes!),
                if (trip.reviewNotes != null && trip.reviewNotes!.isNotEmpty) const SizedBox(height: 18),
                Row(
                  children: [
                    const Text('Itinerary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const Spacer(),
                    Text('${trip.stops.length} stops', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 10),
                if (trip.stops.isEmpty)
                  _emptyStops()
                else
                  ...trip.stops.map(_stopCard),
                const SizedBox(height: 18),
                if (trip.status == 'Draft' || trip.status == 'RevisionRequested')
                  SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _generate,
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                      icon: const Icon(Icons.auto_awesome),
                      label: Text(trip.status == 'RevisionRequested' ? 'Generate Revised AI Itinerary' : 'Generate AI Itinerary'),
                    ),
                  ),
                if (trip.status == 'PendingReview')
                  _pendingCard(),
                if (trip.status == 'Approved')
                  _approvedCard(),
                const SizedBox(height: 14),
                if (trip.status == 'Draft')
                  OutlinedButton.icon(onPressed: () => _delete(trip), icon: const Icon(Icons.delete_outline), label: const Text('Delete Trip')),
                const SizedBox(height: 30),
                _aiWorkflowPreview(trip),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _status(String status) {
    final pending = status == 'PendingReview';
    final approved = status == 'Approved';
    final color = approved ? const Color(0xFF059669) : pending ? const Color(0xFFD97706) : const Color(0xFF4F46E5);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(color: color.withOpacity(.1), borderRadius: BorderRadius.circular(12)),
      child: Row(children: [
        Icon(approved ? Icons.verified_outlined : pending ? Icons.hourglass_top_rounded : Icons.auto_awesome, size: 19, color: color),
        const SizedBox(width: 8),
        Text(_statusLabel(status), style: TextStyle(color: color, fontWeight: FontWeight.w700)),
      ]),
    );
  }

  String _statusLabel(String s) => s == 'PendingReview' ? 'Pending Travel Agent Review' : s == 'RevisionRequested' ? 'Revision Requested' : s;

  Widget _infoCard(Trip trip) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _row(Icons.calendar_month_outlined, 'Dates', '${_date(trip.startDate)} - ${_date(trip.endDate)}'),
      const SizedBox(height: 12),
      _row(Icons.flag_outlined, 'Objective', trip.objective),
      if (trip.constraints != null && trip.constraints!.isNotEmpty) ...[
        const SizedBox(height: 12),
        _row(Icons.tune, 'Constraints', trip.constraints!),
      ],
    ]),
  );

  Widget _row(IconData icon, String label, String value) => Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Icon(icon, size: 20, color: const Color(0xFF4F46E5)),
    const SizedBox(width: 10),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
      const SizedBox(height: 2),
      Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
    ])),
  ]);

  Widget _stopCard(TripStop stop) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      CircleAvatar(radius: 17, backgroundColor: const Color(0xFFEEF2FF), child: Text('${stop.stopOrder}', style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(stop.destinationName, style: const TextStyle(fontWeight: FontWeight.bold)),
        if (stop.experienceTitle != null) ...[
          const SizedBox(height: 4),
          Text(stop.experienceTitle!, style: const TextStyle(color: Color(0xFF4F46E5), fontSize: 12)),
        ],
        if (stop.plannedArrival != null && stop.plannedDeparture != null) ...[
          const SizedBox(height: 6),
          Text('${_time(stop.plannedArrival!)} - ${_time(stop.plannedDeparture!)}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
        ],
        if (stop.notes != null && stop.notes!.isNotEmpty) ...[
          const SizedBox(height: 5),
          Text(stop.notes!, style: const TextStyle(color: Color(0xFF475569), fontSize: 12)),
        ],
      ])),
    ]),
  );

  Widget _pendingCard() => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFFDE68A))),
    child: const Row(children: [
      Icon(Icons.rate_review_outlined, color: Color(0xFFD97706)),
      SizedBox(width: 10),
      Expanded(child: Text('Your AI itinerary is waiting for a Travel Agent to review it.')),
    ]),
  );

  Widget _approvedCard() => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFA7F3D0))),
    child: const Row(children: [
      Icon(Icons.check_circle_outline, color: Color(0xFF059669)),
      SizedBox(width: 10),
      Expanded(child: Text('This itinerary has been approved by a Travel Agent.')),
    ]),
  );

  Widget _reviewCard(String notes) => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: _row(Icons.rate_review_outlined, 'Travel Agent notes', notes),
  );

  Widget _emptyStops() => const Padding(
    padding: EdgeInsets.all(20),
    child: Center(child: Text('No itinerary stops yet.', style: TextStyle(color: Color(0xFF64748B)))),
  );

  FutureBuilder<AiWorkflow> _aiWorkflowPreview(Trip trip) => FutureBuilder<AiWorkflow>(
    future: AiService.getLatestForTrip(trip.id),
    builder: (context, snapshot) {
      if (!snapshot.hasData) return const SizedBox.shrink();
      final ai = snapshot.data!;
      return Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFE2E8F0))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Row(children: [Icon(Icons.auto_awesome, color: Color(0xFF4F46E5)), SizedBox(width: 8), Text('AI workflow', style: TextStyle(fontWeight: FontWeight.bold))]),
          const SizedBox(height: 8),
          Text(ai.currentStep, style: const TextStyle(color: Color(0xFF475569))),
          if (ai.errorMessage != null) ...[
            const SizedBox(height: 5),
            Text(ai.errorMessage!, style: const TextStyle(color: Color(0xFFDC2626))),
          ],
          if (ai.logs.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text('${ai.logs.length} execution steps recorded', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          ],
        ]),
      );
    },
  );

  String _date(DateTime d) => '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  String _time(DateTime d) => '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}
