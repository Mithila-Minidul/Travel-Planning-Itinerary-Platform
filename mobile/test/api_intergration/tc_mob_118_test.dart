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
  test('TC-MOB-118: cancel booking PATCH sends reason', () async {
    var requests = 0;
    final client = MockClient((request) async {
      requests++;
      expect(request.method, 'PATCH');
      expect(request.url.path, '/Bookings/b1/cancel');
      expect(jsonDecode(request.body)['reason'], 'Change of plans');
      return http.Response(jsonEncode({'status':'Cancelled'}), 200, headers: {'content-type': 'application/json'});
    });
    await http.runWithClient(() async {
      final result = await BookingService.cancelBooking('b1', reason: 'Change of plans');
      expect(result['status'], 'Cancelled');
    }, () => client);
    expect(requests, 1);
  });
}
