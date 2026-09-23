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
  final _specialRequestsController = TextEditingController();

  DateTime _startDate = DateTime.now().add(const Duration(days: 1));
  DateTime _endDate = DateTime.now().add(const Duration(days: 4));

  // Travel group
  String _travelGroup = 'Solo';
  int _numberOfTravelers = 1;

  // Budget tier
  String _budgetTier = 'Mid';

  // Pace
  String _travelPace = 'Balanced';

  // Preferred times (multi-select)
  final Map<String, bool> _preferredTimes = {
    'Morning': true,
    'Afternoon': true,
    'Evening': false,
  };

  // Interests
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
    _specialRequestsController.dispose();
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

    final selectedTimes = _preferredTimes.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .join(',');

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
        // ✅ NEW fields
        travelGroup: _travelGroup,
        numberOfTravelers: _numberOfTravelers,
        budgetTier: _budgetTier,
        travelPace: _travelPace,
        preferredTimes: selectedTimes,
        specialRequests: _specialRequestsController.text.trim(),
      );

      if (!mounted) return;

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

              // ============================================
              // SECTION 1: TRIP BASICS
              // ============================================
              _sectionHeader('1. Trip Basics'),
              const SizedBox(height: 10),

              const Text('Trip Title *',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                decoration: _inputDecoration('e.g. My Ella Adventure'),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 14),

              const Text('Objective (optional)',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _objectiveController,
                maxLines: 2,
                decoration: _inputDecoration('e.g. Relaxing mountain weekend'),
              ),
              const SizedBox(height: 20),

              // ============================================
              // SECTION 2: TRAVEL GROUP
              // ============================================
              _sectionHeader('2. Travel Group'),
              const SizedBox(height: 10),

              const Text('Who is going?',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Solo', 'Couple', 'Family', 'Friends'].map((group) {
                  final selected = _travelGroup == group;
                  return ChoiceChip(
                    label: Text(group),
                    selected: selected,
                    onSelected: (val) {
                      if (val) {
                        setState(() {
                          _travelGroup = group;
                          if (group == 'Solo') _numberOfTravelers = 1;
                          if (group == 'Couple') _numberOfTravelers = 2;
                          if (group == 'Family') _numberOfTravelers = 4;
                          if (group == 'Friends') _numberOfTravelers = 4;
                        });
                      }
                    },
                    selectedColor: const Color(0xFF4F46E5).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color:
                          selected ? const Color(0xFF4F46E5) : Colors.grey[700],
                      fontWeight:
                          selected ? FontWeight.bold : FontWeight.normal,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              const Text('Number of Travelers',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Row(
                children: [
                  IconButton(
                    onPressed: _numberOfTravelers > 1
                        ? () => setState(() => _numberOfTravelers--)
                        : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$_numberOfTravelers',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: _numberOfTravelers < 50
                        ? () => setState(() => _numberOfTravelers++)
                        : null,
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // ============================================
              // SECTION 3: DATES
              // ============================================
              _sectionHeader('3. Dates'),
              const SizedBox(height: 10),
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
              const SizedBox(height: 20),

              // ============================================
              // SECTION 4: BUDGET
              // ============================================
              _sectionHeader('4. Budget'),
              const SizedBox(height: 10),

              const Text('Total Budget (USD) *',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _budgetController,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: _inputDecoration('e.g. 450'),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Budget is required';
                  final val = double.tryParse(v.trim());
                  if (val == null || val <= 0) return 'Enter a valid number';
                  return null;
                },
              ),
              const SizedBox(height: 14),

              const Text('Budget Style',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  {'icon': '💰', 'label': 'Budget'},
                  {'icon': '💵', 'label': 'Mid'},
                  {'icon': '💎', 'label': 'Luxury'},
                ].map((tier) {
                  final selected = _budgetTier == tier['label'];
                  return ChoiceChip(
                    label: Text('${tier['icon']} ${tier['label']}'),
                    selected: selected,
                    onSelected: (val) {
                      if (val) setState(() => _budgetTier = tier['label']!);
                    },
                    selectedColor: const Color(0xFF4F46E5).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color:
                          selected ? const Color(0xFF4F46E5) : Colors.grey[700],
                      fontWeight:
                          selected ? FontWeight.bold : FontWeight.normal,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // ============================================
              // SECTION 5: INTERESTS
              // ============================================
              _sectionHeader('5. Interests *'),
              const SizedBox(height: 10),
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
              const SizedBox(height: 20),

              // ============================================
              // SECTION 6: TRAVEL PACE
              // ============================================
              _sectionHeader('6. Travel Pace'),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  {'icon': '😌', 'label': 'Relaxed'},
                  {'icon': '🙂', 'label': 'Balanced'},
                  {'icon': '🏃', 'label': 'Fast'},
                ].map((pace) {
                  final selected = _travelPace == pace['label'];
                  return ChoiceChip(
                    label: Text('${pace['icon']} ${pace['label']}'),
                    selected: selected,
                    onSelected: (val) {
                      if (val) setState(() => _travelPace = pace['label']!);
                    },
                    selectedColor: const Color(0xFF4F46E5).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color:
                          selected ? const Color(0xFF4F46E5) : Colors.grey[700],
                      fontWeight:
                          selected ? FontWeight.bold : FontWeight.normal,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 6),
              Text(
                _travelPace == 'Relaxed'
                    ? '1-2 activities per day'
                    : _travelPace == 'Balanced'
                        ? '2-3 activities per day'
                        : '3-4 activities per day',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 20),

              // ============================================
              // SECTION 7: PREFERRED TIMES
              // ============================================
              _sectionHeader('7. Preferred Times'),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _preferredTimes.keys.map((key) {
                  final selected = _preferredTimes[key] ?? false;
                  return FilterChip(
                    label: Text(key),
                    selected: selected,
                    onSelected: (val) =>
                        setState(() => _preferredTimes[key] = val),
                    selectedColor: const Color(0xFF4F46E5).withOpacity(0.2),
                    checkmarkColor: const Color(0xFF4F46E5),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // ============================================
              // SECTION 8: SPECIAL REQUESTS
              // ============================================
              _sectionHeader('8. Special Requests (optional)'),
              const SizedBox(height: 10),
              TextFormField(
                controller: _specialRequestsController,
                maxLines: 3,
                decoration: _inputDecoration(
                  'e.g. Vegetarian meals, wheelchair access, no early mornings...',
                ),
              ),
              const SizedBox(height: 28),

              // ============================================
              // SUBMIT
              // ============================================
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
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Your AI-generated itinerary will be sent to a Travel Agent for approval.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Color(0xFF4F46E5),
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