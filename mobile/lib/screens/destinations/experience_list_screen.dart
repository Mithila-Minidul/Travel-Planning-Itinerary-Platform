import 'package:flutter/material.dart';
import '../../models/destination.dart';
import '../../models/experience.dart';
import '../../models/category.dart';
import '../../services/experience_service.dart';
import '../../services/category_service.dart';
import 'experience_detail_screen.dart';
import '../trips/trip_builder_screen.dart';
import '../trips/trip_list_screen.dart';

class ExperienceListScreen extends StatefulWidget {
  final Destination destination;

  const ExperienceListScreen({super.key, required this.destination});

  @override
  State<ExperienceListScreen> createState() => _ExperienceListScreenState();
}

class _ExperienceListScreenState extends State<ExperienceListScreen> {
  List<Experience> _allExperiences = [];
  List<Experience> _filteredExperiences = [];
  List<Category> _categories = [];
  bool _loading = true;
  String? _error;
  String? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        ExperienceService.getAll(destinationId: widget.destination.id),
        CategoryService.getAll(),
      ]);

      setState(() {
        _allExperiences = results[0] as List<Experience>;
        _filteredExperiences = _allExperiences;
        _categories = results[1] as List<Category>;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _filterByCategory(String? categoryId) {
    setState(() {
      _selectedCategoryId = categoryId;
      _filteredExperiences = categoryId == null
          ? _allExperiences
          : _allExperiences.where((e) => e.categoryId == categoryId).toList();
    });
  }

  bool _hasText(String? value) => value != null && value.trim().isNotEmpty;

  /// ✅ Opens the Trip Builder for this destination
  Future<void> _openTripBuilder() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => TripBuilderScreen(
          destinationId: widget.destination.id,
          destinationName: widget.destination.name,
        ),
      ),
    );

    if (result != null && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const TripListScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dest = widget.destination;

    return Scaffold(
      appBar: AppBar(
        title: Text(dest.name),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // ================= HEADER =================
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Location
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: Colors.indigo),
                    const SizedBox(width: 4),
                    Text(
                      '${dest.provinceState}, ${dest.country}',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Description
                Text(
                  dest.description,
                  style: TextStyle(color: Colors.grey[700], height: 1.4),
                ),

                // ✅ NEW: Best Time to Visit / Ideal Duration / Highlights
                if (_hasText(dest.bestTimeToVisit) ||
                    _hasText(dest.idealDuration) ||
                    _hasText(dest.highlights)) ...[
                  const SizedBox(height: 14),
                  if (_hasText(dest.bestTimeToVisit) || _hasText(dest.idealDuration))
                    Row(
                      children: [
                        if (_hasText(dest.bestTimeToVisit))
                          Expanded(
                            child: _miniInfoTile(
                              Icons.event,
                              'Best Time',
                              dest.bestTimeToVisit!,
                            ),
                          ),
                        if (_hasText(dest.bestTimeToVisit) && _hasText(dest.idealDuration))
                          const SizedBox(width: 10),
                        if (_hasText(dest.idealDuration))
                          Expanded(
                            child: _miniInfoTile(
                              Icons.schedule,
                              'Ideal Duration',
                              dest.idealDuration!,
                            ),
                          ),
                      ],
                    ),
                  if (_hasText(dest.highlights)) ...[
                    const SizedBox(height: 10),
                    _miniInfoTile(
                      Icons.star,
                      'Highlights',
                      dest.highlights!,
                    ),
                  ],
                ],

                const SizedBox(height: 16),

                // Category filter chips
                if (_categories.isNotEmpty) ...[
                  const Text(
                    'Filter by Category',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        ChoiceChip(
                          label: const Text('All'),
                          selected: _selectedCategoryId == null,
                          onSelected: (_) => _filterByCategory(null),
                          selectedColor: Colors.indigo[100],
                        ),
                        const SizedBox(width: 8),
                        ..._categories.map((cat) {
                          final isSelected = _selectedCategoryId == cat.id;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(cat.name),
                              selected: isSelected,
                              onSelected: (_) => _filterByCategory(cat.id),
                              selectedColor: Colors.indigo[100],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // ================= EXPERIENCE LIST =================
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? _buildError()
                    : _filteredExperiences.isEmpty
                        ? _buildEmpty()
                        : RefreshIndicator(
                            onRefresh: _loadData,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filteredExperiences.length,
                              itemBuilder: (context, index) {
                                return _buildExperienceCard(
                                    _filteredExperiences[index]);
                              },
                            ),
                          ),
          ),
        ],
      ),

      // ✅ NEW: Floating "Create Trip with AI" button for this destination
      floatingActionButton: _loading
          ? null
          : FloatingActionButton.extended(
              onPressed: _openTripBuilder,
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.auto_awesome),
              label: const Text(
                'Create Trip with AI',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
    );
  }

  Widget _miniInfoTile(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.indigo[50],
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.indigo),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.indigo,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          const Text('Failed to load experiences'),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadData, child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.tour, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              'No experiences available yet',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            const Text(
              'Local guides are adding experiences soon!',
              style: TextStyle(fontSize: 13, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExperienceCard(Experience exp) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ExperienceDetailScreen(experienceId: exp.id),
            ),
          );
        },
        child: Row(
          children: [
            SizedBox(
              width: 120,
              height: 140,
              child: exp.coverImageUrl != null && exp.coverImageUrl!.isNotEmpty
                  ? Image.network(
                      exp.coverImageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.image, color: Colors.grey),
                      ),
                    )
                  : Container(
                      color: Colors.indigo[50],
                      child: const Icon(Icons.hiking,
                          size: 40, color: Colors.indigo),
                    ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      exp.categoryName.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.indigo,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      exp.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.amber),
                        const SizedBox(width: 2),
                        Text(
                          exp.rating.toStringAsFixed(1),
                          style: const TextStyle(fontSize: 12),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.access_time,
                            size: 14, color: Colors.grey),
                        const SizedBox(width: 2),
                        Text(
                          '${exp.durationHours}h',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          '\$${exp.currentCalculatedPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.indigo,
                          ),
                        ),
                        const SizedBox(width: 4),
                        if (exp.currentCalculatedPrice > exp.basePrice)
                          Text(
                            '\$${exp.basePrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}