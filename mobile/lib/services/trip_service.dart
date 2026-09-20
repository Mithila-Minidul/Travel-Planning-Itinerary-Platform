import '../models/trip.dart';
import '../utils/constants.dart';
import 'api_client.dart';

class TripService {
  static Future<List<Trip>> getMyTrips() async {
    final response = await ApiClient.get(ApiConstants.trips);
    final list = response is List ? response : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(Trip.fromJson)
        .toList();
  }

  static Future<Trip> getById(String id) async {
    final response = await ApiClient.get('${ApiConstants.trips}/$id');
    return Trip.fromJson(Map<String, dynamic>.from(response));
  }

  static Future<Trip> create({
    required String title,
    required String objective,
    required DateTime startDate,
    required DateTime endDate,
    String? constraints,
  }) async {
    final response = await ApiClient.post(ApiConstants.trips, {
      'title': title.trim(),
      'objective': objective.trim(),
      'startDate': startDate.toUtc().toIso8601String(),
      'endDate': endDate.toUtc().toIso8601String(),
      'constraints': constraints?.trim().isEmpty == true ? null : constraints?.trim(),
    });
    return Trip.fromJson(Map<String, dynamic>.from(response));
  }

  static Future<Trip> update({
    required String id,
    required String title,
    required String objective,
    required DateTime startDate,
    required DateTime endDate,
    String? constraints,
  }) async {
    final response = await ApiClient.put('${ApiConstants.trips}/$id', {
      'title': title.trim(),
      'objective': objective.trim(),
      'startDate': startDate.toUtc().toIso8601String(),
      'endDate': endDate.toUtc().toIso8601String(),
      'constraints': constraints?.trim().isEmpty == true ? null : constraints?.trim(),
    });
    return Trip.fromJson(Map<String, dynamic>.from(response));
  }

  static Future<void> delete(String id) async {
    await ApiClient.delete('${ApiConstants.trips}/$id');
  }

  static Future<TripStop> addStop({
    required String tripId,
    required String destinationId,
    String? experienceId,
    int? stopOrder,
    DateTime? plannedArrival,
    DateTime? plannedDeparture,
    String? notes,
  }) async {
    final response = await ApiClient.post('${ApiConstants.trips}/$tripId/stops', {
      'destinationId': destinationId,
      'experienceId': experienceId,
      'stopOrder': stopOrder,
      'plannedArrival': plannedArrival?.toUtc().toIso8601String(),
      'plannedDeparture': plannedDeparture?.toUtc().toIso8601String(),
      'notes': notes,
    });
    return TripStop.fromJson(Map<String, dynamic>.from(response), parentTripId: tripId);
  }

  static Future<List<TripStop>> getStops(String tripId) async {
    final response = await ApiClient.get('${ApiConstants.trips}/$tripId/stops');
    final list = response is List ? response : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => TripStop.fromJson(e, parentTripId: tripId))
        .toList();
  }

  static Future<TripStop> updateStop({
    required String tripId,
    required String stopId,
    required String destinationId,
    String? experienceId,
    required int stopOrder,
    DateTime? plannedArrival,
    DateTime? plannedDeparture,
    String? notes,
  }) async {
    final response = await ApiClient.put('${ApiConstants.trips}/$tripId/stops/$stopId', {
      'destinationId': destinationId,
      'experienceId': experienceId,
      'stopOrder': stopOrder,
      'plannedArrival': plannedArrival?.toUtc().toIso8601String(),
      'plannedDeparture': plannedDeparture?.toUtc().toIso8601String(),
      'notes': notes,
    });
    return TripStop.fromJson(Map<String, dynamic>.from(response), parentTripId: tripId);
  }

  static Future<void> deleteStop(String tripId, String stopId) async {
    await ApiClient.delete('${ApiConstants.trips}/$tripId/stops/$stopId');
  }

  static Future<TripValidation> validate(String tripId) async {
    final response = await ApiClient.post('${ApiConstants.trips}/$tripId/validate', {});
    return TripValidation.fromJson(Map<String, dynamic>.from(response));
  }
}
