import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-009: Short registration password shows validation error',
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

      await tester.enterText(
        find.byType(TextField).at(0),
        'Test User',
      );

      await tester.enterText(
        find.byType(TextField).at(1),
        'test@example.com',
      );

      await tester.enterText(
        find.byType(TextField).at(2),
        '12345',
      );

      final registerButton = find.widgetWithText(
        ElevatedButton,
        'Register',
      );

      await tester.ensureVisible(registerButton);
      await tester.tap(registerButton);
      await tester.pump();

      expect(
        find.text('Password must be at least 6 characters'),
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
