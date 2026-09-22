import 'package:flutter/material.dart';
import '../../services/trip_service.dart';

class TripBuilderScreen extends StatefulWidget {
  final String destinationId;
  final String destinationName;

  const TripBuilderScreen({
    super.key,
    required this.destinationId,
    required this.destinationName,
  });

  @override
  State<TripBuilderScreen> createState() => _TripBuilderScreenState();
}

class _TripBuilderScreenState extends State<TripBuilderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _objectiveController = TextEditingController();
  final _budgetController = TextEditingController();

  DateTime _startDate = DateTime.now().add(const Duration(days: 1));
  DateTime _endDate = DateTime.now().add(const Duration(days: 4));

  // Interest -> selected
  final Map<String, bool> _interests = {
    'Hiking': false,
    'Nature': false,
    'Culture': false,
    'Beach': false,
    'Wildlife': false,
    'Food': false,
    'Train': false,
    'Tea': false,
  };

  bool _loading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _objectiveController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate.isBefore(_startDate)) {
            _endDate = _startDate.add(const Duration(days: 2));
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // Validate dates
    if (_endDate.isBefore(_startDate)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End date must be after start date')),
      );
      return;
    }

    final selectedInterests = _interests.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .join(',');

    if (selectedInterests.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one interest')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final result = await TripService.createTrip(
        title: _titleController.text.trim(),
        objective: _objectiveController.text.trim(),
        destinationId: widget.destinationId,
        startDate: _startDate,
        endDate: _endDate,
        budget: double.parse(_budgetController.text.trim()),
        interests: selectedInterests,
      );

      if (!mounted) return;

      // Success dialog
      await showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Trip Created!'),
            ],
          ),
          content: Text(
            'Your AI itinerary with ${result['stopsGenerated']} stops has been generated.\n\n'
            'It is now pending Travel Agent approval.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK'),
            ),
          ],
        ),
      );

      if (!mounted) return;
      Navigator.pop(context, result['tripId']);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Trip with AI'),
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ============ DESTINATION BANNER ============
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on, color: Colors.white),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Destination',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                          Text(
                            widget.destinationName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ============ TITLE ============
              const Text('Trip Title *',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                decoration: _inputDecoration('e.g. My Ella Adventure'),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 16),

              // ============ OBJECTIVE ============
              const Text('Objective',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _objectiveController,
                maxLines: 2,
                decoration: _inputDecoration('e.g. Relaxing mountain weekend'),
              ),
              const SizedBox(height: 16),

              // ============ DATES ============
              Row(
                children: [
                  Expanded(
                    child: _DateTile(
                      label: 'Start Date',
                      date: _startDate,
                      onTap: () => _pickDate(true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _DateTile(
                      label: 'End Date',
                      date: _endDate,
                      onTap: () => _pickDate(false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ============ BUDGET ============
              const Text('Budget (USD) *',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _budgetController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: _inputDecoration('e.g. 450'),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Budget is required';
                  final val = double.tryParse(v.trim());
                  if (val == null || val <= 0) return 'Enter a valid number';
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // ============ INTERESTS ============
              const Text('Interests *',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _interests.keys.map((key) {
                  final selected = _interests[key] ?? false;
                  return FilterChip(
                    label: Text(key),
                    selected: selected,
                    onSelected: (val) =>
                        setState(() => _interests[key] = val),
                    selectedColor: const Color(0xFF4F46E5).withOpacity(0.2),
                    checkmarkColor: const Color(0xFF4F46E5),
                  );
                }).toList(),
              ),
              const SizedBox(height: 28),

              // ============ SUBMIT ============
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          '🚀 Generate AI Itinerary',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Your AI-generated itinerary will be sent to a Travel Agent for approval.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) => InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.grey.shade100,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      );
}

class _DateTile extends StatelessWidget {
  final String label;
  final DateTime date;
  final VoidCallback onTap;

  const _DateTile({
    required this.label,
    required this.date,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today,
                    size: 16, color: Color(0xFF4F46E5)),
                const SizedBox(width: 6),
                Text(
                  '${date.day}/${date.month}/${date.year}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}