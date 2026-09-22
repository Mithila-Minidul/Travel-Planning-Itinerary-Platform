import 'dart:async';
import 'package:flutter/material.dart';
import '../../models/experience.dart';
import '../../models/weather.dart';
import '../../services/experience_service.dart';
import '../../services/destination_service.dart';

class ExperienceDetailScreen extends StatefulWidget {
  final String experienceId;

  const ExperienceDetailScreen({super.key, required this.experienceId});

  @override
  State<ExperienceDetailScreen> createState() =>
      _ExperienceDetailScreenState();
}

class _ExperienceDetailScreenState extends State<ExperienceDetailScreen> {
  Experience? _experience;
  Weather? _weather;
  bool _loading = true;
  String? _error;
  int _currentImageIndex = 0;
  final PageController _pageController = PageController();
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final exp = await ExperienceService.getById(widget.experienceId);
      Weather? weather;
      try {
        weather = await DestinationService.getWeather(exp.destinationId);
      } catch (_) {}

      setState(() {
        _experience = exp;
        _weather = weather;
        _loading = false;
      });

      _startAutoScroll();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _startAutoScroll() {
    _autoScrollTimer?.cancel();
    final images = _getImages();
    if (images.length <= 1) return;

    _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      final nextIndex = (_currentImageIndex + 1) % images.length;
      _pageController.animateToPage(
        nextIndex,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  List<String> _getImages() {
    if (_experience == null) return [''];
    return _experience!.imageUrls.isNotEmpty
        ? _experience!.imageUrls
        : [_experience!.coverImageUrl ?? ''];
  }

  bool _hasText(String? value) => value != null && value.trim().isNotEmpty;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError()
              : _buildContent(),
    );
  }

  Widget _buildError() {
    return SafeArea(
      child: Column(
        children: [
          AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.black),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline,
                      size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(_error!, textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                      onPressed: _loadData, child: const Text('Retry')),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final exp = _experience!;
    final images = _getImages();

    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            // ================= IMAGE CAROUSEL =================
            SliverAppBar(
              expandedHeight: 280,
              pinned: true,
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    PageView.builder(
                      controller: _pageController,
                      itemCount: images.length,
                      onPageChanged: (index) {
                        setState(() => _currentImageIndex = index);
                        _startAutoScroll();
                      },
                      itemBuilder: (context, index) {
                        if (images[index].isNotEmpty) {
                          return Image.network(
                            images[index],
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              color: Colors.indigo[100],
                              child: const Icon(Icons.image,
                                  size: 64, color: Colors.white),
                            ),
                          );
                        }
                        return Container(
                          color: Colors.indigo[100],
                          child: const Icon(Icons.hiking,
                              size: 64, color: Colors.white),
                        );
                      },
                    ),
                    IgnorePointer(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.5),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (images.length > 1)
                      Positioned(
                        top: 100,
                        right: 16,
                        child: IgnorePointer(
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${_currentImageIndex + 1} / ${images.length}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (images.length > 1)
                      Positioned(
                        bottom: 16,
                        left: 0,
                        right: 0,
                        child: IgnorePointer(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              images.length,
                              (i) => AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                width: i == _currentImageIndex ? 20 : 8,
                                height: 8,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 3),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(4),
                                  color: i == _currentImageIndex
                                      ? Colors.white
                                      : Colors.white.withOpacity(0.4),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // ================= CONTENT =================
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category chip
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.indigo[50],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        exp.categoryName.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.indigo,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Title
                    Text(
                      exp.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Location + Rating
                    Row(
                      children: [
                        const Icon(Icons.location_on,
                            size: 16, color: Colors.indigo),
                        const SizedBox(width: 4),
                        Text(
                          exp.destinationName,
                          style: const TextStyle(color: Colors.grey),
                        ),
                        const SizedBox(width: 16),
                        const Icon(Icons.star, size: 16, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          '${exp.rating.toStringAsFixed(1)} (${exp.totalBookingsCount} bookings)',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),
                    const Divider(),
                    const SizedBox(height: 20),

                    // Info Grid
                    Row(
                      children: [
                        _buildInfoItem(Icons.access_time, 'Duration',
                            '${exp.durationHours} hours'),
                        _buildInfoItem(Icons.people, 'Max Capacity',
                            '${exp.maxCapacity} people'),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildInfoItem(Icons.place, 'Meeting Point',
                            exp.meetingPoint.isEmpty ? 'TBD' : exp.meetingPoint),
                        _buildInfoItem(Icons.person, 'Guide', exp.guideName),
                      ],
                    ),

                    // ✅ NEW: Languages + Fitness Level (if present)
                    if (_hasText(exp.languages) || _hasText(exp.fitnessLevel)) ...[
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          _buildInfoItem(
                              Icons.language,
                              'Languages',
                              _hasText(exp.languages) ? exp.languages! : 'Not specified'),
                          _buildInfoItem(
                              Icons.fitness_center,
                              'Fitness',
                              _hasText(exp.fitnessLevel) ? exp.fitnessLevel! : 'Not specified'),
                        ],
                      ),
                    ],

                    // ✅ NEW: Minimum Age (if present)
                    if (exp.minAge != null && exp.minAge! > 0) ...[
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          _buildInfoItem(Icons.cake, 'Minimum Age',
                              '${exp.minAge} years'),
                          const Spacer(),
                        ],
                      ),
                    ],

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 20),

                    // Description
                    const Text(
                      'About this Experience',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      exp.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[800],
                        height: 1.5,
                      ),
                    ),

                    // ✅ NEW: What's Included
                    if (_hasText(exp.whatIncluded)) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 20),
                      const Text(
                        "What's Included",
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      _buildBulletList(exp.whatIncluded!, Colors.green),
                    ],

                    // ✅ NEW: What's NOT Included
                    if (_hasText(exp.whatNotIncluded)) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 20),
                      const Text(
                        "What's NOT Included",
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      _buildBulletList(exp.whatNotIncluded!, Colors.red),
                    ],

                    // ✅ NEW: What to Bring
                    if (_hasText(exp.whatToBring)) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 20),
                      const Text(
                        'What to Bring',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      _buildBulletList(exp.whatToBring!, Colors.indigo),
                    ],

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 20),

                    // Availability
                    const Text(
                      'Availability',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: exp.availableWeekdays.map((day) {
                        return Chip(
                          label: Text(
                            day.length > 3 ? day.substring(0, 3) : day,
                            style: const TextStyle(fontSize: 12),
                          ),
                          backgroundColor: Colors.green[50],
                          side: BorderSide(color: Colors.green[200]!),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.access_time,
                            size: 16, color: Colors.grey),
                        const SizedBox(width: 6),
                        Text(
                          '${exp.startTime} - ${exp.endTime}',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),

                    // ✅ NEW: Cancellation Policy
                    if (_hasText(exp.cancellationPolicy)) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 20),
                      const Text(
                        'Cancellation Policy',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.amber[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.amber[200]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.event_busy,
                                size: 20, color: Colors.orange),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                exp.cancellationPolicy!,
                                style: const TextStyle(fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // ✅ NEW: Important Notes
                    if (_hasText(exp.importantNotes)) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 20),
                      const Text(
                        'Important Notes',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue[200]!),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.info_outline,
                                size: 20, color: Colors.blue),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                exp.importantNotes!,
                                style: const TextStyle(fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Weather
                    if (_weather != null) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 20),
                      const Text(
                        'Weather',
                        style:
                            TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.blue[100]!),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _getWeatherIcon(_weather!.condition),
                              size: 40,
                              color: Colors.blue[700],
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${_weather!.temperatureCelsius.toStringAsFixed(1)}°C — ${_weather!.condition}',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _weather!.description,
                                    style: const TextStyle(
                                        fontSize: 12, color: Colors.grey),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _weather!.weatherSuitability,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.blue[700],
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ],
        ),

        // ================= BOTTOM BAR (Price only — no Create Trip button) =================
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Price',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                    Text(
                      '\$${exp.currentCalculatedPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.indigo,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Booking coming soon — use Trip Creation at the destination.'),
                          backgroundColor: Colors.indigo,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'Book Now',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Expanded(
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.indigo[50],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: Colors.indigo),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Renders a comma-separated string (or newline-separated) as bullet points
  Widget _buildBulletList(String text, Color accentColor) {
    final items = text
        .split(RegExp(r'[,\n]'))
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Icon(Icons.circle, size: 6, color: accentColor),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  item,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[800],
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  IconData _getWeatherIcon(String condition) {
    final c = condition.toLowerCase();
    if (c.contains('rain')) return Icons.grain;
    if (c.contains('cloud')) return Icons.cloud;
    if (c.contains('clear') || c.contains('sun')) return Icons.wb_sunny;
    return Icons.wb_cloudy;
  }
}