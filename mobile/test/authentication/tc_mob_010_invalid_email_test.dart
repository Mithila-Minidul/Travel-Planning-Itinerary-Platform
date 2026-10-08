
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-010: Empty email shows required fields validation',
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
        find.byType(RegisterScreen),
        findsOneWidget,
      );

      expect(
        find.byType(TextField),
        findsNWidgets(4),
      );

      await tester.enterText(
        find.byType(TextField).at(0),
        'Test User',
      );

      await tester.enterText(
        find.byType(TextField).at(1),
        '',
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

      expect(registerButton, findsOneWidget);

      await tester.ensureVisible(registerButton);
      await tester.tap(registerButton);
      await tester.pump();

      expect(
        find.descendant(
          of: find.byType(SnackBar),
          matching: find.text('Please fill all required fields'),
        ),
        findsOneWidget,
      );

      expect(
        find.byType(RegisterScreen),
        findsOneWidget,
      );

      expect(
        find.byType(CircularProgressIndicator),
        findsNothing,
      );
    },
  );
}
