class TripStop {
  final String id;
  final String tripId;
  final int stopOrder;
  final String destinationId;
  final String destinationName;
  final String? experienceId;
  final String? experienceTitle;
  final DateTime? plannedArrival;
  final DateTime? plannedDeparture;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const TripStop({
    required this.id,
    required this.tripId,
    required this.stopOrder,
    required this.destinationId,
    required this.destinationName,
    this.experienceId,
    this.experienceTitle,
    this.plannedArrival,
    this.plannedDeparture,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory TripStop.fromJson(Map<String, dynamic> json, {String? parentTripId}) {
    return TripStop(
      id: json['id']?.toString() ?? '',
      tripId: json['tripId']?.toString() ?? parentTripId ?? '',
      stopOrder: (json['stopOrder'] ?? 0) as int,
      destinationId: json['destinationId']?.toString() ?? '',
      destinationName: json['destinationName']?.toString() ?? '',
      experienceId: json['experienceId']?.toString(),
      experienceTitle: json['experienceTitle']?.toString(),
      plannedArrival: _date(json['plannedArrival']),
      plannedDeparture: _date(json['plannedDeparture']),
      notes: json['notes']?.toString(),
      createdAt: _date(json['createdAt']),
      updatedAt: _date(json['updatedAt']),
    );
  }

  static DateTime? _date(dynamic value) =>
      value == null ? null : DateTime.tryParse(value.toString())?.toLocal();
}

class Trip {
  final String id;
  final String travelerId;
  final String travelerName;
  final String title;
  final String objective;
  final DateTime startDate;
  final DateTime endDate;
  final String? constraints;
  final String status;
  final String? reviewNotes;
  final DateTime? reviewedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<TripStop> stops;

  const Trip({
    required this.id,
    required this.travelerId,
    required this.travelerName,
    required this.title,
    required this.objective,
    required this.startDate,
    required this.endDate,
    this.constraints,
    required this.status,
    this.reviewNotes,
    this.reviewedAt,
    this.createdAt,
    this.updatedAt,
    this.stops = const [],
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    final tripId = json['id']?.toString() ?? '';
    final rawStops = json['stops'] as List<dynamic>? ?? const [];
    return Trip(
      id: tripId,
      travelerId: json['travelerId']?.toString() ?? '',
      travelerName: json['travelerName']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      objective: json['objective']?.toString() ?? '',
      startDate: DateTime.tryParse(json['startDate']?.toString() ?? '')?.toLocal()
          ?? DateTime.now(),
      endDate: DateTime.tryParse(json['endDate']?.toString() ?? '')?.toLocal()
          ?? DateTime.now(),
      constraints: json['constraints']?.toString(),
      status: json['status']?.toString() ?? 'Draft',
      reviewNotes: json['reviewNotes']?.toString(),
      reviewedAt: TripStop._date(json['reviewedAt']),
      createdAt: TripStop._date(json['createdAt']),
      updatedAt: TripStop._date(json['updatedAt']),
      stops: rawStops
          .whereType<Map<String, dynamic>>()
          .map((e) => TripStop.fromJson(e, parentTripId: tripId))
          .toList(),
    );
  }
}
