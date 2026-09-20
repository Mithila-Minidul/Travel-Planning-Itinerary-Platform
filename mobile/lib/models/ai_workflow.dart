import 'trip.dart';

class AiExecutionLog {
  final int sequence;
  final String step;
  final String status;
  final String? message;
  final DateTime? occurredAt;

  const AiExecutionLog({
    required this.sequence,
    required this.step,
    required this.status,
    this.message,
    this.occurredAt,
  });

  factory AiExecutionLog.fromJson(Map<String, dynamic> json) {
    return AiExecutionLog(
      sequence: (json['sequence'] ?? 0) as int,
      step: json['step']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      message: json['message']?.toString(),
      occurredAt: json['occurredAt'] == null
          ? null
          : DateTime.tryParse(json['occurredAt'].toString())?.toLocal(),
    );
  }
}

class PlannerStopPlan {
  final String stopId;
  final int stopOrder;
  final String destinationName;
  final int dayNumber;
  final DateTime plannedArrival;
  final DateTime plannedDeparture;
  final String? experienceId;
  final String? experienceTitle;
  final double estimatedDurationHours;
  final String? weatherStatus;
  final String? notes;

  const PlannerStopPlan({
    required this.stopId,
    required this.stopOrder,
    required this.destinationName,
    required this.dayNumber,
    required this.plannedArrival,
    required this.plannedDeparture,
    this.experienceId,
    this.experienceTitle,
    required this.estimatedDurationHours,
    this.weatherStatus,
    this.notes,
  });

  factory PlannerStopPlan.fromJson(Map<String, dynamic> json) {
    return PlannerStopPlan(
      stopId: json['stopId']?.toString() ?? '',
      stopOrder: (json['stopOrder'] ?? 0) as int,
      destinationName: json['destinationName']?.toString() ?? '',
      dayNumber: (json['dayNumber'] ?? 1) as int,
      plannedArrival: DateTime.tryParse(json['plannedArrival']?.toString() ?? '')?.toLocal()
          ?? DateTime.now(),
      plannedDeparture: DateTime.tryParse(json['plannedDeparture']?.toString() ?? '')?.toLocal()
          ?? DateTime.now(),
      experienceId: json['experienceId']?.toString(),
      experienceTitle: json['experienceTitle']?.toString(),
      estimatedDurationHours: (json['estimatedDurationHours'] ?? 0).toDouble(),
      weatherStatus: json['weatherStatus']?.toString(),
      notes: json['notes']?.toString(),
    );
  }
}

class PlannerResearchSummary {
  final String destination;
  final String? weatherCondition;
  final String? weatherSuitability;
  final int candidatesFound;
  final String? selectedExperience;
  final String? selectedExperienceId;

  const PlannerResearchSummary({
    required this.destination,
    this.weatherCondition,
    this.weatherSuitability,
    required this.candidatesFound,
    this.selectedExperience,
    this.selectedExperienceId,
  });

  factory PlannerResearchSummary.fromJson(Map<String, dynamic> json) {
    return PlannerResearchSummary(
      destination: json['destination']?.toString() ?? '',
      weatherCondition: json['weatherCondition']?.toString(),
      weatherSuitability: json['weatherSuitability']?.toString(),
      candidatesFound: (json['candidatesFound'] ?? 0) as int,
      selectedExperience: json['selectedExperience']?.toString(),
      selectedExperienceId: json['selectedExperienceId']?.toString(),
    );
  }
}

class PlannerResult {
  final String agentName;
  final String tripId;
  final String executionStatus;
  final String decisionSummary;
  final List<PlannerStopPlan> plan;
  final List<PlannerResearchSummary> research;
  final List<String> warnings;

  const PlannerResult({
    required this.agentName,
    required this.tripId,
    required this.executionStatus,
    required this.decisionSummary,
    required this.plan,
    required this.research,
    required this.warnings,
  });

  factory PlannerResult.fromJson(Map<String, dynamic> json) {
    return PlannerResult(
      agentName: json['agentName']?.toString() ?? '',
      tripId: json['tripId']?.toString() ?? '',
      executionStatus: json['executionStatus']?.toString() ?? '',
      decisionSummary: json['decisionSummary']?.toString() ?? '',
      plan: (json['plan'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(PlannerStopPlan.fromJson)
          .toList(),
      research: (json['research'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(PlannerResearchSummary.fromJson)
          .toList(),
      warnings: (json['warnings'] as List<dynamic>? ?? const [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class ValidationIssue {
  final String code;
  final String message;
  final String? field;

  const ValidationIssue({
    required this.code,
    required this.message,
    this.field,
  });

  factory ValidationIssue.fromJson(Map<String, dynamic> json) {
    return ValidationIssue(
      code: json['code']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      field: json['field']?.toString(),
    );
  }
}

class TripValidation {
  final bool isValid;
  final List<ValidationIssue> errors;
  final List<ValidationIssue> warnings;
  final List<dynamic> conflicts;

  const TripValidation({
    required this.isValid,
    required this.errors,
    required this.warnings,
    required this.conflicts,
  });

  factory TripValidation.fromJson(Map<String, dynamic> json) {
    return TripValidation(
      isValid: json['isValid'] == true,
      errors: (json['errors'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ValidationIssue.fromJson)
          .toList(),
      warnings: (json['warnings'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ValidationIssue.fromJson)
          .toList(),
      conflicts: json['conflicts'] as List<dynamic>? ?? const [],
    );
  }
}

class AiWorkflow {
  final String id;
  final String tripId;
  final String tripTitle;
  final String status;
  final String currentStep;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final String? errorMessage;
  final String? reviewNotes;
  final Trip? trip;
  final PlannerResult? plannerResult;
  final TripValidation? validation;
  final List<AiExecutionLog> logs;

  const AiWorkflow({
    required this.id,
    required this.tripId,
    required this.tripTitle,
    required this.status,
    required this.currentStep,
    this.startedAt,
    this.completedAt,
    this.errorMessage,
    this.reviewNotes,
    this.trip,
    this.plannerResult,
    this.validation,
    this.logs = const [],
  });

  factory AiWorkflow.fromJson(Map<String, dynamic> json) {
    return AiWorkflow(
      id: json['id']?.toString() ?? '',
      tripId: json['tripId']?.toString() ?? '',
      tripTitle: json['tripTitle']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      currentStep: json['currentStep']?.toString() ?? '',
      startedAt: json['startedAt'] == null ? null : DateTime.tryParse(json['startedAt'].toString())?.toLocal(),
      completedAt: json['completedAt'] == null ? null : DateTime.tryParse(json['completedAt'].toString())?.toLocal(),
      errorMessage: json['errorMessage']?.toString(),
      reviewNotes: json['reviewNotes']?.toString(),
      trip: json['trip'] is Map<String, dynamic> ? Trip.fromJson(json['trip']) : null,
      plannerResult: json['plannerResult'] is Map<String, dynamic>
          ? PlannerResult.fromJson(json['plannerResult'])
          : null,
      validation: json['validation'] is Map<String, dynamic>
          ? TripValidation.fromJson(json['validation'])
          : null,
      logs: (json['logs'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(AiExecutionLog.fromJson)
          .toList(),
    );
  }
}
