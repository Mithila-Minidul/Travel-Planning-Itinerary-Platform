import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/weather.dart';

void main() {
  test('TC-MOB-043: Weather.fromJson maps description', () {
    final json = jsonDecode(r'''{"destinationName": "Ella", "temperatureCelsius": 24.5, "condition": "Sunny", "description": "Clear", "humidity": 65, "windSpeedKmh": 8.5, "weatherSuitability": "Good"}''') as Map<String, dynamic>;
    final model = Weather.fromJson(json);
    expect(model.description, 'Clear');
  });
}
