import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-002: Password visibility toggle works correctly',
        (WidgetTester tester) async {

      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      final passwordField = find.byType(TextField).at(1);

      expect(
        tester.widget<TextField>(passwordField).obscureText,
        isTrue,
      );

      await tester.enterText(
        passwordField,
        'TestPassword123',
      );

      await tester.tap(
        find.byIcon(Icons.visibility_off),
      );

      await tester.pump();

      expect(
        tester.widget<TextField>(passwordField).obscureText,
        isFalse,
      );

      expect(
        find.byIcon(Icons.visibility),
        findsOneWidget,
      );

      await tester.tap(
        find.byIcon(Icons.visibility),
      );

      await tester.pump();

      expect(
        tester.widget<TextField>(passwordField).obscureText,
        isTrue,
      );

      expect(
        find.byIcon(Icons.visibility_off),
        findsOneWidget,
      );
    },
  );
}
