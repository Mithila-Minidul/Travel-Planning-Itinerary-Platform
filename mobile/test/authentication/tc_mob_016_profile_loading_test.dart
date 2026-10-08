
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/profile/profile_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-016: Profile screen shows loading indicator when user is null',
        (WidgetTester tester) async {
      final authProvider = AuthProvider();

      expect(authProvider.user, isNull);

      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>.value(
          value: authProvider,
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
        find.byType(CircularProgressIndicator),
        findsOneWidget,
      );

      expect(
        find.ancestor(
          of: find.byType(CircularProgressIndicator),
          matching: find.byType(Center),
        ),
        findsWidgets,
      );

      expect(
        find.text('Edit Profile'),
        findsNothing,
      );

      expect(
        find.text('Change Password'),
        findsNothing,
      );

      expect(
        find.text('Logout'),
        findsNothing,
      );
    },
  );
}
