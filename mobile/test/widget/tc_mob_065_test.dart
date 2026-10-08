import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
  testWidgets('TC-MOB-065: RegisterScreen UI check 8', (tester) async {
    await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>(
      create: (_) => AuthProvider(),
      child: const MaterialApp(home: const RegisterScreen()),
    ));
    expect(find.byType(AppBar), findsOneWidget);
  });
}
