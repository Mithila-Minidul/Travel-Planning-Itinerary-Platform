import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../models/destination.dart';
import '../models/weather.dart';

class DestinationService {
  /// Get all destinations
  static Future<List<Destination>> getAll() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}${ApiConstants.destinations}'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Destination.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load destinations');
    }
  }

  /// Get destination by ID
  static Future<Destination> getById(String id) async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}${ApiConstants.destinations}/$id'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return Destination.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load destination');
    }
  }

  /// Get weather for a destination
  static Future<Weather> getWeather(String destinationId) async {
    final response = await http.get(
      Uri.parse(
          '${ApiConstants.baseUrl}${ApiConstants.destinations}/$destinationId/weather'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return Weather.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load weather');
    }
  }
}