
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

  int changePasswordCallCount = 0;

  @override
  User? get user => fakeUser;

  @override
  bool get isAuthenticated => true;

  @override
  Future<bool> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    changePasswordCallCount++;
    return true;
  }
}

void main() {
  testWidgets(
    'TC-MOB-024: Password change requires user confirmation',
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

      final changePasswordOption = find.text(
        'Change Password',
      );

      await tester.ensureVisible(changePasswordOption);
      await tester.tap(changePasswordOption);
      await tester.pumpAndSettle();

      expect(
        find.byType(TextField),
        findsNWidgets(2),
      );

      await tester.enterText(
        find.byType(TextField).at(0),
        'OldPassword123',
      );

      await tester.enterText(
        find.byType(TextField).at(1),
        'NewPassword123',
      );

      expect(
        fakeAuthProvider.changePasswordCallCount,
        0,
      );

      final updateButton = find.widgetWithText(
        ElevatedButton,
        'Update Password',
      );

      await tester.ensureVisible(updateButton);
      await tester.tap(updateButton);
      await tester.pumpAndSettle();

      expect(
        find.byType(AlertDialog),
        findsOneWidget,
      );

      expect(
        find.text('Confirm Password Change'),
        findsOneWidget,
      );

      expect(
        find.text('Cancel'),
        findsOneWidget,
      );

      expect(
        find.text('Yes, Change'),
        findsOneWidget,
      );

      expect(
        fakeAuthProvider.changePasswordCallCount,
        0,
      );

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(
        find.byType(AlertDialog),
        findsNothing,
      );

      expect(
        fakeAuthProvider.changePasswordCallCount,
        0,
      );

      expect(
        find.byType(ProfileScreen),
        findsOneWidget,
      );
    },
  );
}
