import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../models/category.dart';

class CategoryService {
  /// Get all categories
  static Future<List<Category>> getAll() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}${ApiConstants.categories}'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Category.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load categories');
    }
  }
}