import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../utils/constants.dart';

class ProfileService {
  /// Upload profile image (anonymous - works during registration)
  static Future<String> uploadProfileImage(
      List<int> fileBytes, String fileName) async {
    final uri =
        Uri.parse('${ApiConstants.baseUrl}/Image/upload/profile-photos');

    final request = http.MultipartRequest('POST', uri);

    final ext = fileName.split('.').last.toLowerCase();
    final contentType = ext == 'png'
        ? MediaType('image', 'png')
        : ext == 'jpg' || ext == 'jpeg'
            ? MediaType('image', 'jpeg')
            : ext == 'webp'
                ? MediaType('image', 'webp')
                : MediaType('image', 'jpeg');

    request.files.add(
      http.MultipartFile.fromBytes(
        'file',
        fileBytes,
        filename: fileName,
        contentType: contentType,
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final body = json.decode(response.body);
      return body['url'];
    } else {
      final body = response.body.isNotEmpty ? json.decode(response.body) : {};
      throw Exception(body['message'] ?? 'Failed to upload image');
    }
  }
}