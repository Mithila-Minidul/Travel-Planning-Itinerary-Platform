import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import 'secure_storage.dart';

class PaymentService {
  static String get baseUrl => ApiConstants.baseUrl;

  static Future<String?> _getToken() async {
    return await SecureStorage.getToken();
  }

  static Future<Map<String, dynamic>> processPayment(
    String bookingId, {
    String method = 'Mock',
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/Payments/process/$bookingId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'method': method}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    final err = _tryParseError(response.body);
    throw Exception(err);
  }

  static Future<Map<String, dynamic>> previewRefund(String bookingId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/Payments/$bookingId/refund-preview'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    final err = _tryParseError(response.body);
    throw Exception(err);
  }

  static String _tryParseError(String body) {
    try {
      final json = jsonDecode(body);
      return json['message']?.toString() ?? 'Request failed';
    } catch (_) {
      return 'Request failed';
    }
  }
    // ================= INITIATE PAYHERE =================
  static Future<Map<String, dynamic>> initiatePayHere(String bookingId) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/Payments/initiate-payhere/$bookingId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    final err = _tryParseError(response.body);
    throw Exception(err);
  }
}