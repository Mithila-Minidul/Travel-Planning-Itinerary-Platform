import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import '../../lib/services/review_service.dart';
import '../../lib/services/booking_service.dart';
import '../../lib/services/trip_service.dart';
import '../../lib/services/payment_service.dart';

void main() {
  setUp(() {
    dotenv.testLoad(fileInput: 'API_BASE_URL=http://localhost:7000');
    FlutterSecureStorage.setMockInitialValues({});
  });

  test('TC-MOB-110: get reviews for experience returns list', () async {
    var requests = 0;
    final client = MockClient((request) async {
      requests++;
      expect(request.method, 'GET');
      expect(request.url.path, '/Reviews/experience/e1');
      expect(request.body, isEmpty);
      return http.Response('[{"id":"r1","rating":5}]', 200,
          headers: {'content-type': 'application/json'});
    });

    await http.runWithClient(() async {
      final result = await ReviewService.getReviewsForExperience('e1');
      expect(result, isA<List>()); expect(result.first['id'], 'r1');
    }, () => client);
    expect(requests, 1);
  });
}
