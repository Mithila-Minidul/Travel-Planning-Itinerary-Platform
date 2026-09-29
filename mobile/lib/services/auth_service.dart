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
    String? profileImageUrl,
  }) async {
    await ApiClient.post(ApiConstants.register, {
      'fullName': fullName.trim(),
      'email': email.trim(),
      'password': password,
      'phoneNumber': phoneNumber,
      'role': 'Traveler',
      'profileImageUrl': profileImageUrl,
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
    // Update profile (name, phone)
    static Future<User> updateProfile({
    required String fullName,
    String? phoneNumber,
    String? profileImageUrl, // 👈 ADDED
  }) async {
    final response = await ApiClient.put(ApiConstants.updateProfile, {
      'fullName': fullName.trim(),
      'phoneNumber': phoneNumber,
      'profileImageUrl': profileImageUrl, // 👈 ADDED
    });

    final currentUser = await getCurrentUser();
    if (currentUser != null) {
      final updated = User(
        id: currentUser.id,
        fullName: response['fullName'] ?? currentUser.fullName,
        email: currentUser.email,
        phoneNumber: response['phoneNumber'] ?? currentUser.phoneNumber,
        profileImageUrl: response['profileImageUrl'] ?? currentUser.profileImageUrl, // 👈 UPDATED
        agencyName: currentUser.agencyName,
        agentLicenseNumber: currentUser.agentLicenseNumber,
        role: currentUser.role,
        isActive: currentUser.isActive,
        guideId: currentUser.guideId,
        guideStatus: currentUser.guideStatus,
      );
      await SecureStorage.saveUser(json.encode(updated.toJson()));
      return updated;
    }
    return User.fromJson(response);
  }

  // Change password
  static Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    await ApiClient.post(ApiConstants.changePassword, {
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    });
  }
}