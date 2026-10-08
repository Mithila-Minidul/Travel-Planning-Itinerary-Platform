
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/models/user.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/profile/profile_screen.dart';

// Test-only fake provider.
// No production application code is modified.
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
    return true;
  }
}

void main() {
  testWidgets(
    'TC-MOB-017: Empty full name shows validation error in Edit Profile',
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

      expect(
        find.text('Test User'),
        findsOneWidget,
      );

      expect(
        find.text('test@example.com'),
        findsWidgets,
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

      final nameField = tester.widget<TextField>(
        find.byType(TextField).at(0),
      );

      expect(
        nameField.controller?.text,
        'Test User',
      );

      await tester.enterText(
        find.byType(TextField).at(0),
        '',
      );

      final saveButton = find.widgetWithText(
        ElevatedButton,
        'Save Changes',
      );

      await tester.ensureVisible(saveButton);
      await tester.tap(saveButton);
      await tester.pumpAndSettle();

      expect(
        find.text('Full name is required'),
        findsOneWidget,
      );

      expect(
        find.text('Save Changes'),
        findsOneWidget,
      );

      expect(
        fakeAuthProvider.updateProfileCallCount,
        0,
      );

      expect(
        find.byType(ProfileScreen),
        findsOneWidget,
      );
    },
  );
}
