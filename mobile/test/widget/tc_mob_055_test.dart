import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
  testWidgets('TC-MOB-055: LoginScreen UI check 9', (tester) async {
    await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>(
      create: (_) => AuthProvider(),
      child: const MaterialApp(home: const LoginScreen()),
    ));
    expect(find.byIcon(Icons.email_outlined), findsOneWidget);
  });
}
