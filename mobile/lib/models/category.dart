class Category {
  final String id;
  final String name;
  final String description;
  final String iconName;

  Category({
    required this.id,
    required this.name,
    required this.description,
    required this.iconName,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      iconName: json['iconName'] ?? 'explore',
    );
  }
}