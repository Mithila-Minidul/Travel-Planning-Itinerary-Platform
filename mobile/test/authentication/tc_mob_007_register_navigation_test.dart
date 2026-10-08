import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-007: Register button navigates to Register Screen',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      expect(
        find.byType(LoginScreen),
        findsOneWidget,
      );

      final registerButton = find.widgetWithText(
        TextButton,
        'Register',
      );

      expect(registerButton, findsOneWidget);

      await tester.tap(registerButton);
      await tester.pumpAndSettle();

      expect(
        find.byType(RegisterScreen),
        findsOneWidget,
      );

      expect(
        find.byType(LoginScreen),
        findsNothing,
      );
    },
  );
}
