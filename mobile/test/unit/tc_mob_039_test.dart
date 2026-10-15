import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/user.dart';

void main() {
  test('TC-MOB-039: User.fromJson maps email', () {
    final json = jsonDecode(r'''{"id": "u-1", "fullName": "Test Traveler", "email": "test@example.com", "phoneNumber": "0712345678", "profileImageUrl": "https://example.test/u.png", "agencyName": "Travel Co", "agentLicenseNumber": "LIC-1", "role": "Traveler", "isActive": true, "guideId": "g-1", "guideStatus": "Approved"}''') as Map<String, dynamic>;
    final model = User.fromJson(json);
    expect(model.email, 'test@example.com');
  });
}
