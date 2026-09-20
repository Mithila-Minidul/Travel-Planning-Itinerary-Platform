import 'package:flutter/material.dart';
import '../../models/ai_workflow.dart';
import '../../services/ai_service.dart';
import '../../widgets/ai_status_widget.dart';

class AiGenerationScreen extends StatefulWidget {
  final String tripId;
  const AiGenerationScreen({super.key, required this.tripId});

  @override
  State<AiGenerationScreen> createState() => _AiGenerationScreenState();
}

class _AiGenerationScreenState extends State<AiGenerationScreen> {
  AiWorkflow? _workflow;
  String? _error;
  bool _running = true;

  @override
  void initState() {
    super.initState();
    _generate();
  }

  Future<void> _generate() async {
    setState(() { _running = true; _error = null; });
    try {
      final result = await AiService.generateItinerary(widget.tripId);
      if (mounted) setState(() { _workflow = result; _running = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _running = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('AI Itinerary', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: _running
          ? _loading()
          : _error != null
              ? _failed()
              : _result(_workflow!),
    );
  }

  Widget _loading() => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(
          width: 92, height: 92,
          decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(30)),
          child: const Icon(Icons.auto_awesome, size: 45, color: Color(0xFF4F46E5)),
        ),
        const SizedBox(height: 22),
        const Text('Building your itinerary', style: TextStyle(fontSize: 21, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('The Planner Agent is researching destinations and arranging your trip.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF64748B))),
        const SizedBox(height: 28),
        const LinearProgressIndicator(minHeight: 5, color: Color(0xFF4F46E5)),
        const SizedBox(height: 16),
        const Text('This can take a moment...', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      ]),
    ),
  );

  Widget _failed() => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.error_outline, size: 56, color: Color(0xFFDC2626)),
        const SizedBox(height: 14),
        const Text('AI generation failed', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF64748B))),
        const SizedBox(height: 20),
        ElevatedButton.icon(
          onPressed: _generate,
          icon: const Icon(Icons.refresh),
          label: const Text('Try again'),
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white),
        ),
      ]),
    ),
  );

  Widget _result(AiWorkflow ai) {
    final planner = ai.plannerResult;
    final validation = ai.validation;
    final stops = ai.trip?.stops ?? const [];
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 32),
      children: [
        _header(ai),
        const SizedBox(height: 12),
        AiStatusWidget(workflow: ai),
        const SizedBox(height: 16),
        if (planner != null) ...[
          _summary(planner),
          const SizedBox(height: 18),
        ],
        if (planner != null && planner.plan.isNotEmpty) ...[
          const Text('Day-by-day plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ..._groupPlan(planner.plan),
          const SizedBox(height: 18),
        ] else if (stops.isNotEmpty) ...[
          const Text('Itinerary stops', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ...stops.map((s) => _stop(s)),
          const SizedBox(height: 18),
        ],
        if (validation != null) ...[
          _validation(validation),
          const SizedBox(height: 18),
        ],
        if (planner != null && planner.research.isNotEmpty) ...[
          _research(planner.research),
          const SizedBox(height: 18),
        ],
        if (ai.logs.isNotEmpty) _logs(ai.logs),
        const SizedBox(height: 22),
        if (ai.status == 'PendingReview')
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFFDE68A))),
            child: const Row(children: [
              Icon(Icons.rate_review_outlined, color: Color(0xFFD97706)),
              SizedBox(width: 10),
              Expanded(child: Text('Your itinerary has been sent to a Travel Agent for review.')),
            ]),
          ),
      ],
    );
  }

  Widget _header(AiWorkflow ai) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      gradient: const LinearGradient(colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)]),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Icon(Icons.auto_awesome, color: Colors.white, size: 28),
      const SizedBox(height: 12),
      Text(ai.tripTitle, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 5),
      Text(ai.currentStep, style: TextStyle(color: Colors.white.withOpacity(.85))),
      const SizedBox(height: 13),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(color: Colors.white.withOpacity(.15), borderRadius: BorderRadius.circular(20)),
        child: Text(ai.status, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
      ),
    ]),
  );

  Widget _summary(PlannerResult p) => _card(
    title: 'Planner Agent',
    icon: Icons.route_outlined,
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(p.decisionSummary, style: const TextStyle(color: Color(0xFF475569))),
      const SizedBox(height: 8),
      Text('${p.plan.length} scheduled stop${p.plan.length == 1 ? '' : 's'}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      if (p.warnings.isNotEmpty) ...[
        const SizedBox(height: 12),
        ...p.warnings.map((w) => Padding(padding: const EdgeInsets.only(bottom: 5), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.warning_amber_rounded, size: 17, color: Color(0xFFD97706)),
          const SizedBox(width: 7),
          Expanded(child: Text(w, style: const TextStyle(fontSize: 12))),
        ]))),
      ],
    ]),
  );

  List<Widget> _groupPlan(List<PlannerStopPlan> plans) {
    final days = <int, List<PlannerStopPlan>>{};
    for (final p in plans) {
      days.putIfAbsent(p.dayNumber, () => []).add(p);
    }
    final widgets = <Widget>[];
    for (final entry in days.entries) {
      widgets.add(Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(14)),
        child: Text('Day ${entry.key}', style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold)),
      ));
      widgets.addAll(entry.value.map((p) => _planStop(p)));
    }
    return widgets;
  }

  Widget _planStop(PlannerStopPlan p) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      CircleAvatar(radius: 18, backgroundColor: const Color(0xFF4F46E5), child: Text('${p.stopOrder}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(p.destinationName, style: const TextStyle(fontWeight: FontWeight.bold)),
        if (p.experienceTitle != null) Text(p.experienceTitle!, style: const TextStyle(color: Color(0xFF4F46E5), fontSize: 12)),
        const SizedBox(height: 6),
        Text('${_time(p.plannedArrival)} - ${_time(p.plannedDeparture)}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        if (p.weatherStatus != null) Text('Weather: ${p.weatherStatus}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        if (p.notes != null && p.notes!.isNotEmpty) Text(p.notes!, style: const TextStyle(fontSize: 12, color: Color(0xFF475569))),
      ])),
    ]),
  );

  Widget _stop(TripStop s) => _planStop(PlannerStopPlan(
    stopId: s.id,
    stopOrder: s.stopOrder,
    destinationName: s.destinationName,
    dayNumber: 1,
    plannedArrival: s.plannedArrival ?? DateTime.now(),
    plannedDeparture: s.plannedDeparture ?? DateTime.now(),
    experienceId: s.experienceId,
    experienceTitle: s.experienceTitle,
    estimatedDurationHours: 0,
    notes: s.notes,
  ));

  Widget _validation(TripValidation v) => _card(
    title: v.isValid ? 'Validation passed' : 'Validation needs attention',
    icon: v.isValid ? Icons.verified_outlined : Icons.warning_amber_rounded,
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (v.errors.isEmpty && v.conflicts.isEmpty)
        const Text('No blocking itinerary errors or conflicts were found.', style: TextStyle(color: Color(0xFF475569)))
      else ...[
        ...v.errors.map((e) => _issue(e.message, const Color(0xFFDC2626))),
        ...v.conflicts.map((c) => _issue((c as Map)['message']?.toString() ?? 'Schedule conflict detected.', const Color(0xFFDC2626))),
      ],
      if (v.warnings.isNotEmpty) ...[
        const SizedBox(height: 8),
        ...v.warnings.map((e) => _issue(e.message, const Color(0xFFD97706))),
      ],
    ]),
  );

  Widget _research(List<PlannerResearchSummary> items) => _card(
    title: 'Research used',
    icon: Icons.search_rounded,
    child: Column(children: items.map((r) => Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Icon(Icons.place_outlined, size: 19, color: Color(0xFF4F46E5)),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(r.destination, style: const TextStyle(fontWeight: FontWeight.w600)),
          Text('${r.candidatesFound} experience candidates • ${r.weatherSuitability ?? r.weatherCondition ?? 'Weather checked'}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          if (r.selectedExperience != null) Text('Selected: ${r.selectedExperience}', style: const TextStyle(fontSize: 11, color: Color(0xFF4F46E5))),
        ])),
      ]),
    )).toList()),
  );

  Widget _logs(List<AiExecutionLog> logs) => _card(
    title: 'Execution progress',
    icon: Icons.timeline_rounded,
    child: Column(children: logs.map((l) => ListTile(
      dense: true,
      contentPadding: EdgeInsets.zero,
      leading: Icon(l.status.toUpperCase().contains('FAIL') ? Icons.error_outline : Icons.check_circle_outline, size: 19, color: l.status.toUpperCase().contains('FAIL') ? const Color(0xFFDC2626) : const Color(0xFF059669)),
      title: Text(l.step, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      subtitle: l.message == null ? null : Text(l.message!, style: const TextStyle(fontSize: 11)),
    )).toList()),
  );

  Widget _card({required String title, required IconData icon, required Widget child}) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Icon(icon, color: const Color(0xFF4F46E5)), const SizedBox(width: 8), Text(title, style: const TextStyle(fontWeight: FontWeight.bold))]),
      const SizedBox(height: 12),
      child,
    ]),
  );

  Widget _issue(String message, Color color) => Padding(
    padding: const EdgeInsets.only(bottom: 7),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(Icons.circle, size: 7, color: color),
      const SizedBox(width: 8),
      Expanded(child: Text(message, style: const TextStyle(fontSize: 12))),
    ]),
  );

  String _time(DateTime d) => '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}
