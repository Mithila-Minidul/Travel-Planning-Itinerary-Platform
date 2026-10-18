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

  test('TC-MOB-112: get booking by id returns details', () async {
    var requests = 0;
    final client = MockClient((request) async {
      requests++;
      expect(request.method, 'GET');
      expect(request.url.path, '/Bookings/b1');
      expect(request.body, isEmpty);
      return http.Response('{"id":"b1","status":"Confirmed"}', 200,
          headers: {'content-type': 'application/json'});
    });

    await http.runWithClient(() async {
      final result = await BookingService.getBookingById('b1');
      expect(result['id'], 'b1'); expect(result['status'], 'Confirmed');
    }, () => client);
    expect(requests, 1);
  });
}
