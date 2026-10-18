import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-006: Email input accepts and preserves text',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      final emailField = find.byType(TextField).first;

      expect(emailField, findsOneWidget);

      await tester.enterText(
        emailField,
        '  test@example.com  ',
      );

      await tester.pump();

      final emailWidget = tester.widget<TextField>(emailField);

      expect(
        emailWidget.controller!.text,
        '  test@example.com  ',
      );

      expect(
        emailWidget.controller!.text.trim(),
        'test@example.com',
      );

      expect(
        find.byType(LoginScreen),
        findsOneWidget,
      );
    },
  );
}
