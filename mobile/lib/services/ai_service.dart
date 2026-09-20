import '../models/ai_workflow.dart';
import '../utils/constants.dart';
import 'api_client.dart';

class AiService {
  static Future<AiWorkflow> generateItinerary(String tripId) async {
    final response = await ApiClient.post(ApiConstants.generateItinerary, {
      'tripId': tripId,
    });
    return AiWorkflow.fromJson(Map<String, dynamic>.from(response));
  }

  static Future<AiWorkflow> getWorkflow(String workflowId) async {
    final response = await ApiClient.get('${ApiConstants.aiWorkflows}/$workflowId');
    return AiWorkflow.fromJson(Map<String, dynamic>.from(response));
  }

  static Future<AiWorkflow> getLatestForTrip(String tripId) async {
    final response = await ApiClient.get(
      '${ApiConstants.aiTripLatest}/$tripId/latest',
    );
    return AiWorkflow.fromJson(Map<String, dynamic>.from(response));
  }

  static Future<List<AiExecutionLog>> getLogs(String workflowId) async {
    final response = await ApiClient.get('${ApiConstants.aiExecutionLogs}/$workflowId');
    final list = response is List ? response : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(AiExecutionLog.fromJson)
        .toList();
  }
}
