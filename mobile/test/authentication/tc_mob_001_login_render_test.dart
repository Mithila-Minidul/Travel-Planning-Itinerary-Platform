import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets(
    'TC-MOB-001: Login screen renders correctly',
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
        find.text('TripCraft'),
        findsOneWidget,
      );

      expect(
        find.text('Travel Planning Platform'),
        findsOneWidget,
      );

      expect(
        find.byType(TextField),
        findsNWidgets(2),
      );

      expect(
        find.text('Email'),
        findsOneWidget,
      );

      expect(
        find.text('Password'),
        findsOneWidget,
      );
    },
  );
}
