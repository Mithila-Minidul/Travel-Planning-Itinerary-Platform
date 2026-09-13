class Destination {
  final String id;
  final String name;
  final String provinceState;
  final String country;
  final String description;
  final String? imageUrl;
  final double latitude;
  final double longitude;
  final String currentSeason;
  final int activeExperiencesCount;

  Destination({
    required this.id,
    required this.name,
    required this.provinceState,
    required this.country,
    required this.description,
    this.imageUrl,
    required this.latitude,
    required this.longitude,
    required this.currentSeason,
    required this.activeExperiencesCount,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    return Destination(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      provinceState: json['provinceState'] ?? '',
      country: json['country'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'],
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
      currentSeason: json['currentSeason'] ?? 'Regular',
      activeExperiencesCount: json['activeExperiencesCount'] ?? 0,
    );
  }
}