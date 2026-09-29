import 'api_client.dart';

class ReviewService {
  static Future<List<dynamic>> getReviewsForExperience(String experienceId) async {
    return await ApiClient.get('/Reviews/experience/$experienceId');
  }

  static Future<dynamic> createReview({
    required String bookingId,
    required String experienceId,
    required int rating,
    required String comment,
  }) async {
    return await ApiClient.post('/Reviews', {
      'bookingId': bookingId,
      'experienceId': experienceId,
      'rating': rating,
      'comment': comment,
    });
  }

  static Future<dynamic> updateReview({
    required String reviewId,
    required int rating,
    required String comment,
  }) async {
    return await ApiClient.put('/Reviews/$reviewId', {
      'rating': rating,
      'comment': comment,
    });
  }

  static Future<void> deleteReview(String reviewId) async {
    await ApiClient.delete('/Reviews/$reviewId');
  }
}