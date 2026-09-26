import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import 'secure_storage.dart';

class BookingService {
  static String get baseUrl => ApiConstants.baseUrl;

  static Future<String?> _getToken() async {
    return await SecureStorage.getToken();
  }

  // ================= GET MY BOOKINGS =================
  static Future<List<dynamic>> getMyBookings() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/Bookings'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to load bookings (${response.statusCode})');
  }

  // ================= GET BOOKING BY ID =================
  static Future<Map<String, dynamic>> getBookingById(String id) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/Bookings/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load booking');
  }

  // ================= CREATE BOOKING (trip-level) =================
  static Future<Map<String, dynamic>> createBooking({
    required String tripId,
    required int numberOfGuests,
    required DateTime bookingDate,
    String? notes,
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/Bookings'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'tripId': tripId,
        'numberOfGuests': numberOfGuests,
        'bookingDate': DateTime.utc(bookingDate.year, bookingDate.month, bookingDate.day).toIso8601String(),
        'notes': notes,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    final err = _tryParseError(response.body);
    throw Exception(err);
  }

  // ================= CANCEL BOOKING =================
  static Future<Map<String, dynamic>> cancelBooking(
    String id, {
    String? reason,
  }) async {
    final token = await _getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/Bookings/$id/cancel'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'reason': reason ?? ''}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    final err = _tryParseError(response.body);
    throw Exception(err);
  }

  // ================= HELPERS =================
  static String _tryParseError(String body) {
    try {
      final json = jsonDecode(body);
      return json['message']?.toString() ?? 'Request failed';
    } catch (_) {
      return 'Request failed';
    }
  }
}