import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/category.dart';

void main() {
  test('TC-MOB-029: Category.fromJson maps iconName', () {
    final json = jsonDecode(r'''{"id": "c-1", "name": "Hiking", "description": "Outdoor", "iconName": "mountain"}''') as Map<String, dynamic>;
    final model = Category.fromJson(json);
    expect(model.iconName, 'mountain');
  });
}
