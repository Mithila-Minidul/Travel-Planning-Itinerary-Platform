import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets('TC-MOB-053: LoginScreen UI check 7', (tester) async {
    await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>(
      create: (_) => AuthProvider(),
      child: const MaterialApp(home: const LoginScreen()),
    ));
    expect(find.text('Register'), findsOneWidget);
  });
}
