import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-003: Empty credentials prevent login',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      final fields = find.byType(TextField);

      expect(fields, findsNWidgets(2));

      expect(
        tester.widget<TextField>(fields.at(0))
            .controller!.text,
        isEmpty,
      );

      expect(
        tester.widget<TextField>(fields.at(1))
            .controller!.text,
        isEmpty,
      );

      await tester.tap(find.text('Login'));

      await tester.pump();

      expect(find.byType(LoginScreen), findsOneWidget);

      expect(find.text('Login'), findsOneWidget);

      expect(
        find.byType(CircularProgressIndicator),
        findsNothing,
      );
    },
  );
}
