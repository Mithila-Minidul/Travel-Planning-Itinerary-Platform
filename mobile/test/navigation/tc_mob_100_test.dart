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
  testWidgets('TC-MOB-100: back from registration returns to login', (tester) async {
    await tester.pumpWidget(app(const LoginScreen()));
    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle();
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(LoginScreen), findsOneWidget);
  });
}
