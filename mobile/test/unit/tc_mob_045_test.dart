import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/weather.dart';

void main() {
  test('TC-MOB-045: Weather.fromJson maps windSpeedKmh', () {
    final json = jsonDecode(r'''{"destinationName": "Ella", "temperatureCelsius": 24.5, "condition": "Sunny", "description": "Clear", "humidity": 65, "windSpeedKmh": 8.5, "weatherSuitability": "Good"}''') as Map<String, dynamic>;
    final model = Weather.fromJson(json);
    expect(model.windSpeedKmh, 8.5);
  });
}
