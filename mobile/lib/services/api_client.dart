import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import 'secure_storage.dart';
import 'package:image_picker/image_picker.dart';

class ApiClient {
  // Build headers with auth token
  static Future<Map<String, String>> _getHeaders() async {
    final token = await SecureStorage.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // GET request
  static Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  // POST request
  static Future<dynamic> post(String endpoint, dynamic data) async {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
      body: json.encode(data),
    );
    return _handleResponse(response);
  }

  // 👇 ADDED: PUT request
  static Future<dynamic> put(String endpoint, dynamic data) async {
    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
      body: json.encode(data),
    );
    return _handleResponse(response);
  }

  // 👇 ADDED: DELETE request
  static Future<dynamic> delete(String endpoint) async {
    final response = await http.delete(
      Uri.parse('${ApiConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }
        // 👇 FIXED: Works on mobile AND web + sets correct MIME type
  static Future<dynamic> uploadImage(String endpoint, XFile file) async {
    final token = await SecureStorage.getToken();
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');

    final request = http.MultipartRequest('POST', uri);
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    final bytes = await file.readAsBytes();
    final mimeType = _getMimeType(file.name);

    request.files.add(http.MultipartFile.fromBytes(
      'file',
      bytes,
      filename: file.name,
      contentType: mimeType, // 👈 CRITICAL: Set the MIME type
    ));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    return _handleResponse(response);
  }

  // 👇 Helper to derive MIME type from file extension
  static http.MediaType _getMimeType(String filename) {
    final ext = filename.toLowerCase().split('.').last;
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return http.MediaType('image', 'jpeg');
      case 'png':
        return http.MediaType('image', 'png');
      case 'webp':
        return http.MediaType('image', 'webp');
      default:
        return http.MediaType('image', 'jpeg'); // fallback
    }
  }

  // Response handler
    // Response handler
  static dynamic _handleResponse(http.Response response) {
    final bodyText = response.body;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (bodyText.isEmpty) return {};
      try {
        return json.decode(bodyText);
      } catch (_) {
        return {'raw': bodyText};
      }
    } else {
      String message = 'Something went wrong';
      try {
        final body = json.decode(bodyText);
        message = body['message'] ?? body['title'] ?? message;
      } catch (_) {
        message = bodyText.length > 300
            ? '${bodyText.substring(0, 300)}...'
            : bodyText;
      }
      throw Exception(message);
    }
  }
}