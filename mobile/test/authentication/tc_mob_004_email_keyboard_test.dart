import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-004: Email field uses email keyboard type',
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

      final emailField = find.byType(TextField).first;

      expect(
        emailField,
        findsOneWidget,
      );

      final emailWidget =
      tester.widget<TextField>(emailField);

      expect(
        emailWidget.keyboardType,
        TextInputType.emailAddress,
      );
    },
  );
}
