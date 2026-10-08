
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/models/user.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/profile/profile_screen.dart';

// Fake AuthProvider used only inside this test.
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

    // Simulate a successful profile update.
    return true;
  }
}

void main() {
  testWidgets(
    'TC-MOB-019: Valid Sri Lankan phone number allows profile update',
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

      await tester.enterText(
        find.byType(TextField).at(0),
        'Updated Test User',
      );

      await tester.enterText(
        find.byType(TextField).at(1),
        '0714568923',
      );

      final nameField = tester.widget<TextField>(
        find.byType(TextField).at(0),
      );

      final phoneField = tester.widget<TextField>(
        find.byType(TextField).at(1),
      );

      expect(
        nameField.controller?.text,
        'Updated Test User',
      );

      expect(
        phoneField.controller?.text,
        '0714568923',
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
        'Updated Test User',
      );

      expect(
        fakeAuthProvider.receivedPhoneNumber,
        '0714568923',
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
