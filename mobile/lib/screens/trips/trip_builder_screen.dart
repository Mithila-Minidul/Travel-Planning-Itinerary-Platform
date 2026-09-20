import 'package:flutter/material.dart';
import '../../models/destination.dart';
import '../../models/trip.dart';
import '../../services/destination_service.dart';
import '../../services/trip_service.dart';
import '../ai/ai_generation_screen.dart';

class TripBuilderScreen extends StatefulWidget {
  const TripBuilderScreen({super.key});

  @override
  State<TripBuilderScreen> createState() => _TripBuilderScreenState();
}

class _TripBuilderScreenState extends State<TripBuilderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _objective = TextEditingController();
  final _constraints = TextEditingController();
  DateTime? _start;
  DateTime? _end;
  List<Destination> _destinations = [];
  final List<Destination> _selected = [];
  bool _loadingDestinations = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    try {
      final data = await DestinationService.getAll();
      if (mounted) setState(() { _destinations = data; _loadingDestinations = false; });
    } catch (e) {
      if (mounted) setState(() => _loadingDestinations = false);
      if (mounted) _showError(e);
    }
  }

  Future<void> _pickDate(bool start) async {
    final now = DateTime.now();
    final initial = start ? (_start ?? now) : (_end ?? _start ?? now.add(const Duration(days: 1)));
    final picked = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: DateTime(now.year + 3),
      initialDate: initial.isBefore(now) ? now : initial,
    );
    if (picked == null) return;
    setState(() {
      if (start) {
        _start = picked;
        if (_end != null && !_end!.isAfter(picked)) _end = null;
      } else {
        _end = picked;
      }
    });
  }

  Future<void> _saveAndGenerate() async {
    if (!_formKey.currentState!.validate()) return;
    if (_start == null || _end == null) {
      _showError('Please select the trip start and end dates.');
      return;
    }
    if (!_end!.isAfter(_start!)) {
      _showError('End date must be after start date.');
      return;
    }
    if (_selected.isEmpty) {
      _showError('Add at least one destination before generating an AI itinerary.');
      return;
    }

    setState(() => _saving = true);
    try {
      final trip = await TripService.create(
        title: _title.text,
        objective: _objective.text,
        startDate: _start!,
        endDate: _end!,
        constraints: _constraints.text,
      );

      for (var i = 0; i < _selected.length; i++) {
        await TripService.addStop(
          tripId: trip.id,
          destinationId: _selected[i].id,
          stopOrder: i + 1,
        );
      }

      if (!mounted) return;
      setState(() => _saving = false);
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => AiGenerationScreen(tripId: trip.id)),
      );
      if (mounted) Navigator.pop(context, trip);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        _showError(e);
      }
    }
  }

  void _showError(Object e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
    );
  }

  @override
  void dispose() {
    _title.dispose();
    _objective.dispose();
    _constraints.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Create Trip', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            _field(_title, 'Trip title', 'e.g. Cultural Sri Lanka Weekend', Icons.title, required: true),
            const SizedBox(height: 14),
            _field(_objective, 'Trip objective', 'What do you want to experience?', Icons.flag_outlined, required: true, maxLines: 3),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: _dateButton('Start date', _start, () => _pickDate(true))),
              const SizedBox(width: 12),
              Expanded(child: _dateButton('End date', _end, () => _pickDate(false))),
            ]),
            const SizedBox(height: 14),
            _field(_constraints, 'Constraints', 'Budget, preferences, pace, etc.', Icons.tune, maxLines: 3),
            const SizedBox(height: 22),
            const Text('Destinations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 6),
            const Text('Select the places the Planner Agent should organize.', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
            const SizedBox(height: 10),
            if (_loadingDestinations)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
            else if (_destinations.isEmpty)
              const Text('No destinations available.', style: TextStyle(color: Color(0xFF64748B)))
            else
              ..._destinations.map((d) {
                final selected = _selected.any((x) => x.id == d.id);
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: selected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0)),
                  ),
                  child: CheckboxListTile(
                    value: selected,
                    activeColor: const Color(0xFF4F46E5),
                    title: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text('${d.provinceState}, ${d.country}', style: const TextStyle(fontSize: 12)),
                    onChanged: (_) => setState(() {
                      if (selected) {
                        _selected.removeWhere((x) => x.id == d.id);
                      } else {
                        _selected.add(d);
                      }
                    }),
                  ),
                );
              }),
            const SizedBox(height: 18),
            SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _saving ? null : _saveAndGenerate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.auto_awesome),
                label: Text(_saving ? 'Creating trip...' : 'Create & Generate AI Itinerary'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(TextEditingController controller, String label, String hint, IconData icon, {bool required = false, int maxLines = 1}) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: required ? (v) => v == null || v.trim().isEmpty ? '$label is required.' : null : null,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFF4F46E5)),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      ),
    );
  }

  Widget _dateButton(String label, DateTime? value, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
        child: Row(children: [
          const Icon(Icons.calendar_today_outlined, size: 20, color: Color(0xFF4F46E5)),
          const SizedBox(width: 9),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            const SizedBox(height: 3),
            Text(value == null ? 'Select' : '${value.day}/${value.month}/${value.year}', style: const TextStyle(fontWeight: FontWeight.w600)),
          ])),
        ]),
      ),
    );
  }
}
