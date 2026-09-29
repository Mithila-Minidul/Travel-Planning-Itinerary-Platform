import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConstants {
  // Loaded from .env file
  static String get baseUrl => 
      dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:5182/api';
  
  // Auth endpoints
  static const String register = '/Auth/register';
  static const String login = '/Auth/login';
  static const String me = '/Auth/me';
  
  // Other endpoints
  static const String destinations = '/Destinations';
  static const String experiences = '/Experiences';
  static const String categories = '/Categories';
  static const String imageUpload = '/Image/upload/profile-photos';
  static const String updateProfile = '/Auth/profile';
  static const String changePassword = '/Auth/change-password';
}

class StorageKeys {
  static const String token = 'auth_token';
  static const String user = 'user_data';
}