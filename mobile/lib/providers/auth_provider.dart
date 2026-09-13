import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _loading = false;
  String? _error;

  User? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  // Load user from storage on app start
  Future<void> loadUser() async {
    _user = await AuthService.getCurrentUser();
    notifyListeners();
  }

  // Login
  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await AuthService.login(email, password);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  // Register (Traveler only)
  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      await AuthService.register(
        fullName: fullName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
      );
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  // Clear error manually
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Logout
  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    notifyListeners();
  }
}