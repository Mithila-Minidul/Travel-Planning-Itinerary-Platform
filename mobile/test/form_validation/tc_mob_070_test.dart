import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/login_screen.dart';

void main() {
 testWidgets('TC-MOB-070: login rejects missing credentials 3', (tester) async {
   final provider = AuthProvider();
   await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>.value(value: provider,
      child: const MaterialApp(home: LoginScreen())));
   await tester.enterText(find.byType(TextField).at(0), '');
   await tester.enterText(find.byType(TextField).at(1), 'secret');
   await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
   await tester.pump();
   expect(provider.loading, isFalse);
   expect(provider.isAuthenticated, isFalse);
 });
}
