class User {
  final String id;
  final String fullName;
  final String email;
  final String? phoneNumber;
  final String role;
  final bool isActive;
  final String? guideId;
  final String? guideStatus;

  User({
    required this.id,
    required this.fullName,
    required this.email,
    this.phoneNumber,
    required this.role,
    required this.isActive,
    this.guideId,
    this.guideStatus,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      phoneNumber: json['phoneNumber'],
      role: json['role'] ?? 'Traveler',
      isActive: json['isActive'] ?? false,
      guideId: json['guideId'],
      guideStatus: json['guideStatus'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'role': role,
      'isActive': isActive,
      'guideId': guideId,
      'guideStatus': guideStatus,
    };
  }
}