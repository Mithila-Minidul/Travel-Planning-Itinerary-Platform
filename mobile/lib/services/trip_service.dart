import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import 'secure_storage.dart';    // ✅ Use your existing SecureStorage

class TripService {
  static String get baseUrl => ApiConstants.baseUrl;

  // ✅ Use SecureStorage.getToken() - matches how login saves it
  static Future<String?> _getToken() async {
    return await SecureStorage.getToken();
  }

  // ================= GET ALL MY TRIPS =================
  static Future<List<dynamic>> getMyTrips() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/Trips'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to load trips (${response.statusCode})');
  }

  // ================= GET TRIP BY ID =================
  static Future<Map<String, dynamic>> getTripById(String id) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/Trips/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load trip details (${response.statusCode})');
  }

  // ================= CREATE TRIP =================
  static Future<Map<String, dynamic>> createTrip({
    required String title,
    required String objective,
    required String destinationId,
    required DateTime startDate,
    required DateTime endDate,
    required double budget,
    required String interests,
    String constraints = '',
  }) async {
    final token = await _getToken();

    // 🔍 Debug (remove later)
    print('🔑 Token: ${token != null ? "found (${token.length} chars)" : "NULL"}');
    print('🌐 URL: $baseUrl/Trips');

    final response = await http.post(
      Uri.parse('$baseUrl/Trips'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'title': title,
        'objective': objective,
        'destinationId': destinationId,
        'startDate': startDate.toUtc().toIso8601String(),
        'endDate': endDate.toUtc().toIso8601String(),
        'budget': budget,
        'interests': interests,
        'constraints': constraints,
      }),
    );

    print('📥 Status: ${response.statusCode}');
    print('📥 Body: ${response.body}');

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    try {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Failed to create trip');
    } catch (_) {
      throw Exception('Failed to create trip (${response.statusCode})');
    }
  }
}