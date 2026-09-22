class Experience {
  final String id;
  final String guideId;
  final String guideName;
  final String destinationId;
  final String destinationName;
  final String categoryId;
  final String categoryName;
  final String title;
  final String description;
  final double basePrice;
  final double currentCalculatedPrice;
  final int durationHours;
  final int maxCapacity;
  final List<String> availableWeekdays;
  final String startTime;
  final String endTime;
  final String meetingPoint;
  final String? coverImageUrl;
  final List<String> imageUrls;
  final String status;
  final double rating;
  final int totalBookingsCount;

  // ✅ NEW ENRICHMENT FIELDS
  final String? whatIncluded;
  final String? whatNotIncluded;
  final String? whatToBring;
  final String? cancellationPolicy;
  final String? languages;
  final String? fitnessLevel;
  final int? minAge;
  final String? importantNotes;

  Experience({
    required this.id,
    required this.guideId,
    required this.guideName,
    required this.destinationId,
    required this.destinationName,
    required this.categoryId,
    required this.categoryName,
    required this.title,
    required this.description,
    required this.basePrice,
    required this.currentCalculatedPrice,
    required this.durationHours,
    required this.maxCapacity,
    required this.availableWeekdays,
    required this.startTime,
    required this.endTime,
    required this.meetingPoint,
    this.coverImageUrl,
    required this.imageUrls,
    required this.status,
    required this.rating,
    required this.totalBookingsCount,
    // ✅ NEW
    this.whatIncluded,
    this.whatNotIncluded,
    this.whatToBring,
    this.cancellationPolicy,
    this.languages,
    this.fitnessLevel,
    this.minAge,
    this.importantNotes,
  });

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      id: json['id'] ?? '',
      guideId: json['guideId'] ?? '',
      guideName: json['guideName'] ?? 'Unknown Guide',
      destinationId: json['destinationId'] ?? '',
      destinationName: json['destinationName'] ?? '',
      categoryId: json['categoryId'] ?? '',
      categoryName: json['categoryName'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      currentCalculatedPrice: (json['currentCalculatedPrice'] ?? 0).toDouble(),
      durationHours: json['durationHours'] ?? 0,
      maxCapacity: json['maxCapacity'] ?? 0,
      availableWeekdays: List<String>.from(json['availableWeekdays'] ?? []),
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      meetingPoint: json['meetingPoint'] ?? '',
      coverImageUrl: json['coverImageUrl'],
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      status: json['status'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      totalBookingsCount: json['totalBookingsCount'] ?? 0,
      // ✅ NEW
      whatIncluded: json['whatIncluded'],
      whatNotIncluded: json['whatNotIncluded'],
      whatToBring: json['whatToBring'],
      cancellationPolicy: json['cancellationPolicy'],
      languages: json['languages'],
      fitnessLevel: json['fitnessLevel'],
      minAge: json['minAge'],
      importantNotes: json['importantNotes'],
    );
  }
}