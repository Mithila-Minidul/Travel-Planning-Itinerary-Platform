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
  test('TC-MOB-126: process payment POST sends method', () async {
    var requests = 0;
    final client = MockClient((request) async {
      requests++;
      expect(request.method, 'POST');
      expect(request.url.path, '/Payments/process/b1');
      expect(jsonDecode(request.body)['method'], 'Mock');
      return http.Response(jsonEncode({'status':'Paid'}), 200, headers: {'content-type': 'application/json'});
    });
    await http.runWithClient(() async {
      final result = await PaymentService.processPayment('b1');
      expect(result['status'], 'Paid');
    }, () => client);
    expect(requests, 1);
  });
}
