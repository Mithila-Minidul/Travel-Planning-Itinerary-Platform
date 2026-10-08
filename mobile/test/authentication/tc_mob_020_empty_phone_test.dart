
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/models/user.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/profile/profile_screen.dart';


class FakeAuthProvider extends AuthProvider {
  final User fakeUser = User(
    id: 'test-user-001',
    fullName: 'Test User',
    email: 'test@example.com',
    phoneNumber: '0712345678',
    role: 'Traveler',
    isActive: true,
  );

  int updateProfileCallCount = 0;

  String? receivedFullName;
  String? receivedPhoneNumber;
  String? receivedProfileImageUrl;

  @override
  User? get user => fakeUser;

  @override
  bool get isAuthenticated => true;

  @override
  Future<bool> updateProfile({
    required String fullName,
    String? phoneNumber,
    String? profileImageUrl,
  }) async {
    updateProfileCallCount++;

    receivedFullName = fullName;
    receivedPhoneNumber = phoneNumber;
    receivedProfileImageUrl = profileImageUrl;

    return true;
  }
}

void main() {
  testWidgets(
    'TC-MOB-020: Empty phone number is accepted during profile update',
        (WidgetTester tester) async {
      final fakeAuthProvider = FakeAuthProvider();

      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>.value(
          value: fakeAuthProvider,
          child: const MaterialApp(
            home: Scaffold(
              body: ProfileScreen(),
            ),
          ),
        ),
      );

      expect(
        find.byType(ProfileScreen),
        findsOneWidget,
      );

      final editProfileButton = find.widgetWithText(
        ElevatedButton,
        'Edit Profile',
      );

      await tester.ensureVisible(editProfileButton);
      await tester.tap(editProfileButton);
      await tester.pumpAndSettle();

      expect(
        find.text('Save Changes'),
        findsOneWidget,
      );

      expect(
        find.byType(TextField),
        findsNWidgets(2),
      );

      final phoneField = tester.widget<TextField>(
        find.byType(TextField).at(1),
      );

      expect(
        phoneField.controller?.text,
        '0712345678',
      );

      await tester.enterText(
        find.byType(TextField).at(1),
        '',
      );

      final updatedPhoneField = tester.widget<TextField>(
        find.byType(TextField).at(1),
      );

      expect(
        updatedPhoneField.controller?.text,
        isEmpty,
      );

      final saveButton = find.widgetWithText(
        ElevatedButton,
        'Save Changes',
      );

      await tester.ensureVisible(saveButton);
      await tester.tap(saveButton);
      await tester.pumpAndSettle();

      expect(
        fakeAuthProvider.updateProfileCallCount,
        1,
      );

      expect(
        fakeAuthProvider.receivedFullName,
        'Test User',
      );

      expect(
        fakeAuthProvider.receivedPhoneNumber,
        isNull,
      );

      expect(
        fakeAuthProvider.receivedProfileImageUrl,
        isNull,
      );

      expect(
        find.text('Profile updated!'),
        findsOneWidget,
      );

      expect(
        find.text('Save Changes'),
        findsNothing,
      );

      expect(
        find.byType(ProfileScreen),
        findsOneWidget,
      );
    },
  );
}
