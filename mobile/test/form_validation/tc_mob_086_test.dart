import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import '../../lib/providers/auth_provider.dart';
import '../../lib/screens/auth/register_screen.dart';

void main() {
 testWidgets('TC-MOB-086: registration rejects invalid input 13', (tester) async {
   final provider = AuthProvider();
   await tester.pumpWidget(ChangeNotifierProvider<AuthProvider>.value(value: provider,
     child: const MaterialApp(home: RegisterScreen())));
   await tester.enterText(find.byType(TextField).at(0), 'A');
   await tester.enterText(find.byType(TextField).at(1), 'a@b.com');
   await tester.enterText(find.byType(TextField).at(2), 'secret');
   await tester.enterText(find.byType(TextField).at(3), '07123');
   await tester.ensureVisible(find.widgetWithText(ElevatedButton, 'Register'));
   await tester.tap(find.widgetWithText(ElevatedButton, 'Register'));
   await tester.pump();
   expect(find.textContaining('Enter a valid Sri Lankan phone'), findsWidgets);
   expect(provider.isAuthenticated, isFalse);
 });
}
