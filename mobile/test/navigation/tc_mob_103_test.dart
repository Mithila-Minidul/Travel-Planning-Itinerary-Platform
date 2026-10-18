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
  testWidgets('TC-MOB-103: named register route opens registration', (tester) async {
    await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider(), child: MaterialApp(initialRoute: '/register', routes: {'/login': (_) => const LoginScreen(), '/register': (_) => const RegisterScreen()})));
    expect(find.byType(RegisterScreen), findsOneWidget);
  });
}
