import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
 testWidgets('TC-MOB-090: login to register and back preserves draft 2', (tester) async {
   await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>(
      create: (_) => AuthProvider(), child: const MaterialApp(home: LoginScreen())));
   await tester.enterText(find.byType(TextField).first, 'traveler2@example.com');
   await tester.tap(find.text('Register'));
   await tester.pumpAndSettle();
   expect(find.byType(RegisterScreen), findsOneWidget);
   expect(find.byType(LoginScreen), findsNothing);
   await tester.pageBack();
   await tester.pumpAndSettle();
   expect(find.byType(LoginScreen), findsOneWidget);
   expect(find.widgetWithText(TextField, 'Email'), findsOneWidget);
   expect(tester.widget<TextField>(find.byType(TextField).first).controller!.text, 'traveler2@example.com');
 });
}
