import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
 testWidgets('TC-MOB-081: registration rejects invalid input 8', (tester) async {
   final provider = AuthProvider();
   await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>.value(value: provider,
     child: const MaterialApp(home: RegisterScreen())));
   await tester.enterText(find.byType(TextField).at(0), 'A');
   await tester.enterText(find.byType(TextField).at(1), 'a@b.com');
   await tester.enterText(find.byType(TextField).at(2), '12345');
   await tester.enterText(find.byType(TextField).at(3), '0712345678');
   await tester.ensureVisible(find.widgetWithText(ElevatedButton, 'Register'));
   await tester.tap(find.widgetWithText(ElevatedButton, 'Register'));
   await tester.pump();
   expect(find.textContaining('Password must be at least 6 characters'), findsWidgets);
   expect(provider.isAuthenticated, isFalse);
 });
}
