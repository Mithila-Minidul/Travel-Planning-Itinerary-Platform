import 'dart:convert';
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
  test('TC-MOB-117: create booking POST rejects conflict', () async {
    var requests = 0;
    final client = MockClient((request) async {
      requests++;
      expect(request.method, 'POST');
      expect(request.url.path, '/Bookings');
      expect(jsonDecode(request.body)['tripId'], 't1');
      return http.Response(jsonEncode({'message':'Already booked'}), 409, headers: {'content-type': 'application/json'});
    });
    await http.runWithClient(() async {
      await expectLater(BookingService.createBooking(tripId: 't1', numberOfGuests: 2, bookingDate: DateTime.utc(2027, 1, 10), notes: 'Window'), throwsException);
    }, () => client);
    expect(requests, 1);
  });
}
