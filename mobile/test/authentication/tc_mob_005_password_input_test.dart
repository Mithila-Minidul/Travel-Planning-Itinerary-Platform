import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-005: Password input is stored and obscured',
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

      expect(passwordField, findsOneWidget);

      await tester.enterText(
        passwordField,
        'SecurePass123!',
      );

      await tester.pump();

      final passwordWidget =
      tester.widget<TextField>(passwordField);

      expect(
        passwordWidget.controller!.text,
        'SecurePass123!',
      );

      expect(
        passwordWidget.obscureText,
        isTrue,
      );

      expect(
        find.byType(LoginScreen),
        findsOneWidget,
      );
    },
  );
}
