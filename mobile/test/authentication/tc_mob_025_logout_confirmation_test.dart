
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

  int logoutCallCount = 0;

  @override
  User? get user => fakeUser;

  @override
  bool get isAuthenticated => true;

  @override
  Future<void> logout() async {
    logoutCallCount++;
  }
}

void main() {
  testWidgets(
    'TC-MOB-025: Logout requires confirmation and supports cancellation',
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
        fakeAuthProvider.isAuthenticated,
        isTrue,
      );

      expect(
        fakeAuthProvider.logoutCallCount,
        0,
      );

      final logoutOption = find.text('Logout');

      expect(
        logoutOption,
        findsOneWidget,
      );

      await tester.ensureVisible(logoutOption);
      await tester.tap(logoutOption);
      await tester.pumpAndSettle();

      expect(
        find.byType(AlertDialog),
        findsOneWidget,
      );

      expect(
        find.text('Are you sure you want to logout?'),
        findsOneWidget,
      );

      expect(
        find.text('Cancel'),
        findsOneWidget,
      );

      final dialog = find.byType(AlertDialog);

      expect(
        find.descendant(
          of: dialog,
          matching: find.text('Logout'),
        ),
        findsOneWidget,
      );

      expect(
        fakeAuthProvider.logoutCallCount,
        0,
      );

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(
        find.byType(AlertDialog),
        findsNothing,
      );

      expect(
        fakeAuthProvider.logoutCallCount,
        0,
      );

      expect(
        fakeAuthProvider.isAuthenticated,
        isTrue,
      );

      expect(
        find.byType(ProfileScreen),
        findsOneWidget,
      );

      expect(
        find.text('Test User'),
        findsOneWidget,
      );
    },
  );
}
