import 'package:flutter/material.dart';
import '../../models/destination.dart';
import '../../services/destination_service.dart';
import 'experience_list_screen.dart';

class DestinationBrowseScreen extends StatefulWidget {
  const DestinationBrowseScreen({super.key});

  @override
  State<DestinationBrowseScreen> createState() =>
      _DestinationBrowseScreenState();
}

class _DestinationBrowseScreenState extends State<DestinationBrowseScreen> {
  List<Destination> _allDestinations = [];
  List<Destination> _filteredDestinations = [];
  bool _loading = true;
  String? _error;
  String _searchQuery = '';
  String _selectedSeason = 'All';

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    try {
      final destinations = await DestinationService.getAll();
      setState(() {
        _allDestinations = destinations;
        _filteredDestinations = destinations;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredDestinations = _allDestinations.where((d) {
        final matchesSearch = _searchQuery.isEmpty ||
            d.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            d.provinceState.toLowerCase().contains(_searchQuery.toLowerCase());
        final matchesSeason = _selectedSeason == 'All' ||
            d.currentSeason == _selectedSeason;
        return matchesSearch && matchesSeason;
      }).toList();
    });
  }

  Color _getSeasonColor(String season) {
    switch (season) {
      case 'Peak':
        return Colors.orange;
      case 'OffPeak':
        return Colors.blue;
      default:
        return Colors.green;
    }
  }

  String _getSeasonLabel(String season) {
    switch (season) {
      case 'Peak':
        return 'Peak Season';
      case 'OffPeak':
        return 'Off Peak';
      default:
        return 'Regular';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Destinations'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Search & Filter
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  onChanged: (value) {
                    _searchQuery = value;
                    _applyFilters();
                  },
                  decoration: InputDecoration(
                    hintText: 'Search destinations...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'Peak', 'Regular', 'OffPeak'].map((season) {
                      final isSelected = _selectedSeason == season;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(season),
                          selected: isSelected,
                          onSelected: (_) {
                            _selectedSeason = season;
                            _applyFilters();
                          },
                          selectedColor: Colors.indigo[100],
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.indigo : Colors.grey[700],
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? _buildError()
                    : _filteredDestinations.isEmpty
                        ? _buildEmpty()
                        : RefreshIndicator(
                            onRefresh: _loadDestinations,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filteredDestinations.length,
                              itemBuilder: (context, index) {
                                return _buildDestinationCard(
                                    _filteredDestinations[index]);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            const Text('Failed to load destinations',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(_error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadDestinations,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text('No destinations found',
              style: TextStyle(fontSize: 16, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildDestinationCard(Destination dest) {
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
              builder: (_) => ExperienceListScreen(destination: dest),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover Image
            if (dest.imageUrl != null && dest.imageUrl!.isNotEmpty)
              Image.network(
                dest.imageUrl!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 160,
                  color: Colors.grey[200],
                  child: const Icon(Icons.image, size: 48, color: Colors.grey),
                ),
              )
            else
              Container(
                height: 160,
                color: Colors.indigo[50],
                child: const Center(
                  child: Icon(Icons.landscape, size: 64, color: Colors.indigo),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          dest.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getSeasonColor(dest.currentSeason)
                              .withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _getSeasonLabel(dest.currentSeason),
                          style: TextStyle(
                            color: _getSeasonColor(dest.currentSeason),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        '${dest.provinceState}, ${dest.country}',
                        style: const TextStyle(
                            fontSize: 13, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    dest.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey[700], height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.indigo[50],
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.explore,
                                size: 14, color: Colors.indigo),
                            const SizedBox(width: 4),
                            Text(
                              '${dest.activeExperiencesCount} experiences',
                              style: const TextStyle(
                                color: Colors.indigo,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.arrow_forward_ios,
                          size: 14, color: Colors.grey),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}