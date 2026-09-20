import 'package:flutter/material.dart';
import '../models/ai_workflow.dart';

class AiStatusWidget extends StatelessWidget {
  final AiWorkflow workflow;
  const AiStatusWidget({super.key, required this.workflow});

  @override
  Widget build(BuildContext context) {
    final completed = workflow.status == 'PendingReview' ||
        workflow.status == 'Approved';
    final failed = workflow.status == 'Failed';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.auto_awesome, color: Color(0xFF4F46E5)),
              SizedBox(width: 8),
              Text('AI Planner status',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _dot(completed, failed),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  workflow.currentStep.isEmpty
                      ? workflow.status
                      : workflow.currentStep,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              if (!completed && !failed)
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          if (workflow.errorMessage != null &&
              workflow.errorMessage!.isNotEmpty) ...[
            const SizedBox(height: 9),
            Text(workflow.errorMessage!,
                style: const TextStyle(
                    color: Color(0xFFDC2626), fontSize: 12)),
          ],
        ],
      ),
    );
  }

  Widget _dot(bool completed, bool failed) {
    final icon = failed
        ? Icons.error_outline
        : completed
            ? Icons.check_circle_outline
            : Icons.timelapse;
    final color = failed
        ? const Color(0xFFDC2626)
        : completed
            ? const Color(0xFF059669)
            : const Color(0xFF4F46E5);
    return Icon(icon, color: color, size: 21);
  }
}
