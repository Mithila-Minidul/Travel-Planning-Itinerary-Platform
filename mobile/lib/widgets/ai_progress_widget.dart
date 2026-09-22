import 'package:flutter/material.dart';

class AiProgressWidget extends StatelessWidget {
  final String status; // Pending, Approved, Rejected

  const AiProgressWidget({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    // Determine active step
    int activeStep = 0;
    if (status == 'Approved') activeStep = 2;
    else if (status == 'Rejected') activeStep = 2;
    else activeStep = 1;

    final isRejected = status == 'Rejected';
    final isApproved = status == 'Approved';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.auto_awesome, color: Color(0xFF4F46E5)),
              SizedBox(width: 8),
              Text(
                'Trip Status',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _step(
                label: 'AI Generated',
                icon: Icons.auto_awesome,
                active: true,
                completed: true,
              ),
              _connector(active: activeStep >= 1),
              _step(
                label: 'Agent Review',
                icon: Icons.pending,
                active: activeStep >= 1,
                completed: isApproved || isRejected,
              ),
              _connector(active: activeStep >= 2),
              _step(
                label: isRejected ? 'Rejected' : 'Confirmed',
                icon: isRejected ? Icons.close : Icons.check,
                active: isApproved || isRejected,
                completed: isApproved || isRejected,
                color: isRejected ? Colors.red : Colors.green,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isRejected
                  ? Colors.red.withOpacity(0.08)
                  : isApproved
                      ? Colors.green.withOpacity(0.08)
                      : Colors.orange.withOpacity(0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  isRejected
                      ? Icons.info
                      : isApproved
                          ? Icons.check_circle
                          : Icons.schedule,
                  size: 16,
                  color: isRejected
                      ? Colors.red
                      : isApproved
                          ? Colors.green
                          : Colors.orange,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isRejected
                        ? 'Your trip was rejected. You can create a new one.'
                        : isApproved
                            ? 'Your trip is approved! You can start booking.'
                            : 'Waiting for a Travel Agent to review your itinerary.',
                    style: TextStyle(
                      fontSize: 12,
                      color: isRejected
                          ? Colors.red.shade800
                          : isApproved
                              ? Colors.green.shade800
                              : Colors.orange.shade800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _step({
    required String label,
    required IconData icon,
    required bool active,
    required bool completed,
    Color? color,
  }) {
    final c = color ?? const Color(0xFF4F46E5);
    return Column(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: active ? c : Colors.grey.shade200,
            shape: BoxShape.circle,
          ),
          child: Icon(
            completed ? Icons.check : icon,
            color: active ? Colors.white : Colors.grey,
            size: 18,
          ),
        ),
        const SizedBox(height: 4),
        SizedBox(
          width: 70,
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              color: active ? c : Colors.grey,
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ],
    );
  }

  Widget _connector({required bool active}) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 22),
        color: active ? const Color(0xFF4F46E5) : Colors.grey.shade200,
      ),
    );
  }
}