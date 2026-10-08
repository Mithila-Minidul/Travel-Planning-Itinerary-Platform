import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-010: Invalid email format shows validation error',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(
            home: RegisterScreen(),
          ),
        ),
      );

      await tester.enterText(
        find.byType(TextField).at(0),
        'Test User',
      );

      await tester.enterText(
        find.byType(TextField).at(1),
        'invalid-email',
      );

      await tester.enterText(
        find.byType(TextField).at(2),
        'Password123',
      );

      await tester.enterText(
        find.byType(TextField).at(3),
        '0712345678',
      );

      final registerButton = find.widgetWithText(
        ElevatedButton,
        'Register',
      );

      await tester.ensureVisible(registerButton);
      await tester.tap(registerButton);
      await tester.pump();

      expect(
        find.text('Please enter a valid email address'),
        findsOneWidget,
      );

      expect(
        find.byType(RegisterScreen),
        findsOneWidget,
      );
    },
  );
}
