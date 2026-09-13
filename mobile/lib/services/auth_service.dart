import 'dart:convert';
import '../utils/constants.dart';
import 'api_client.dart';
import 'secure_storage.dart';
import '../models/user.dart';

class AuthService {
  // Login - returns User and saves token
  static Future<User> login(String email, String password) async {
    final response = await ApiClient.post(ApiConstants.login, {
      'email': email.trim(),
      'password': password,
    });

    final token = response['token'];
    final userData = response['user'];

    await SecureStorage.saveToken(token);
    await SecureStorage.saveUser(json.encode(userData));

    return User.fromJson(userData);
  }

  // Register - Traveler only
  static Future<void> register({
    required String fullName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    await ApiClient.post(ApiConstants.register, {
      'fullName': fullName.trim(),
      'email': email.trim(),
      'password': password,
      'phoneNumber': phoneNumber,
      'role': 'Traveler',
    });
  }

  // Get current logged-in user from local storage
  static Future<User?> getCurrentUser() async {
    final userJson = await SecureStorage.getUser();
    if (userJson == null) return null;
    return User.fromJson(json.decode(userJson));
  }

  // Logout
  static Future<void> logout() async {
    await SecureStorage.clearAll();
  }
}