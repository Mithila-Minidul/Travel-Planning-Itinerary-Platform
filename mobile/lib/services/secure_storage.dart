import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage();

  // Save JWT token
  static Future<void> saveToken(String token) async {
    await _storage.write(key: StorageKeys.token, value: token);
  }

  // Get JWT token
  static Future<String?> getToken() async {
    return await _storage.read(key: StorageKeys.token);
  }

  // Save user data as JSON string
  static Future<void> saveUser(String userJson) async {
    await _storage.write(key: StorageKeys.user, value: userJson);
  }

  // Get user data
  static Future<String?> getUser() async {
    return await _storage.read(key: StorageKeys.user);
  }

  // Clear all stored data (logout)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}