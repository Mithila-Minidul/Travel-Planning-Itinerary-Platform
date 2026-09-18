import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../models/experience.dart';

class ExperienceService {
  /// Get all approved experiences with optional filters
  static Future<List<Experience>> getAll({
    String? destinationId,
    String? categoryId,
  }) async {
    final queryParams = <String, String>{};
    if (destinationId != null) queryParams['destinationId'] = destinationId;
    if (categoryId != null) queryParams['categoryId'] = categoryId;

    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.experiences}')
        .replace(queryParameters: queryParams.isEmpty ? null : queryParams);

    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Experience.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load experiences');
    }
  }

  /// Get experience by ID with optional target date for dynamic price
  static Future<Experience> getById(String id, {DateTime? date}) async {
    final queryParams = <String, String>{};
    if (date != null) {
      queryParams['date'] = date.toIso8601String();
    }

    final uri = Uri.parse(
            '${ApiConstants.baseUrl}${ApiConstants.experiences}/$id')
        .replace(queryParameters: queryParams.isEmpty ? null : queryParams);

    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return Experience.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load experience');
    }
  }
}