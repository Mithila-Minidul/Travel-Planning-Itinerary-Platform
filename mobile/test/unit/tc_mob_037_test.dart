import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/destination.dart';

void main() {
  test('TC-MOB-037: Destination.fromJson maps longitude', () {
    final json = jsonDecode(r'''{
      "id": "d-1",
      "name": "Ella",
      "provinceState": "Uva",
      "country": "Sri Lanka",
      "description": "Mountains",
      "imageUrl": "https://example.test/ella.png",
      "latitude": 6.87,
      "longitude": 81.04,
      "currentSeason": "Peak",
      "activeExperiencesCount": 4,
      "bestTimeToVisit": "March",
      "idealDuration": "3 days",
      "highlights": "Nine Arches"
    }''') as Map<String, dynamic>;

    final model = Destination.fromJson(json);

    expect(model.longitude, 81.04);
  });
}