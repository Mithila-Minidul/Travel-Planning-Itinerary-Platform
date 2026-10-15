import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';
import '../../lib/screens/auth/register_screen.dart';
import '../../lib/screens/home/home_screen.dart';

Widget app(Widget home) => ChangeNotifierProvider<AuthProvider>(
  create: (_) => AuthProvider(),
  child: MaterialApp(home: home, routes: {
    '/login': (_) => const LoginScreen(),
    '/register': (_) => const RegisterScreen(),
    '/home': (_) => const HomeScreen(),
  }),
);

void main() {
  testWidgets('TC-MOB-106: trips tab changes selected page', (tester) async {
    await tester.pumpWidget(app(const HomeScreen()));
    await tester.tap(find.text('Trips').last);
    await tester.pump();
    expect(tester.widget<IndexedStack>(find.byType(IndexedStack)).index, 1);
  });
}
