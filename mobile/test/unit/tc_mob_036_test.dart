import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/destination.dart';

void main() {
  test('TC-MOB-036: Destination.fromJson maps latitude', () {
    final json = jsonDecode(r'''{"id": "d-1", "name": "Ella", "provinceState": "Uva", "country": "Sri Lanka", "description": "Mountains", "imageUrl": "https://example.test/ella.png", "latitude": 6.87, "longitude": 81.04, "currentSeason": "Peak", "activeExperiencesCount": 4, "bestTimeToVisit": "March", "idealDuration": "3 days", "highlights": "Nine Arches"}''') as Map<String, dynamic>;
    final model = Destination.fromJson(json);
    expect(model.latitude, 6.87);
  });
}
