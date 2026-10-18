import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-008: Empty registration fields show validation error',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(
            home: RegisterScreen(),
          ),
        ),
      );

      expect(
        find.text('Create Your Account'),
        findsOneWidget,
      );

      final registerButton = find.widgetWithText(
        ElevatedButton,
        'Register',
      );

      expect(registerButton, findsOneWidget);

      await tester.ensureVisible(registerButton);
      await tester.tap(registerButton);
      await tester.pump();

      expect(
        find.text('Please fill all required fields'),
        findsOneWidget,
      );

      expect(
        find.byType(RegisterScreen),
        findsOneWidget,
      );
    },
  );
}
