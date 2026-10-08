
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
    'TC-MOB-023: Empty password fields validation - intentional failure',
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

      final changePasswordOption = find.text('Change Password');

      await tester.ensureVisible(changePasswordOption);
      await tester.tap(changePasswordOption);
      await tester.pumpAndSettle();

      expect(find.byType(TextField), findsNWidgets(2));

      final updateButton = find.widgetWithText(
        ElevatedButton,
        'Update Password',
      );

      await tester.ensureVisible(updateButton);
      await tester.tap(updateButton);
      await tester.pump();

      expect(
        find.text('Please fill both fields.'),
        findsOneWidget,
      );


      expect(
        fakeAuthProvider.changePasswordCallCount,
        0,
      );

    },
  );
}
