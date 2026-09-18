class Weather {
  final String destinationName;
  final double temperatureCelsius;
  final String condition;
  final String description;
  final int humidity;
  final double windSpeedKmh;
  final String weatherSuitability;

  Weather({
    required this.destinationName,
    required this.temperatureCelsius,
    required this.condition,
    required this.description,
    required this.humidity,
    required this.windSpeedKmh,
    required this.weatherSuitability,
  });

  factory Weather.fromJson(Map<String, dynamic> json) {
    return Weather(
      destinationName: json['destinationName'] ?? '',
      temperatureCelsius: (json['temperatureCelsius'] ?? 0).toDouble(),
      condition: json['condition'] ?? '',
      description: json['description'] ?? '',
      humidity: json['humidity'] ?? 0,
      windSpeedKmh: (json['windSpeedKmh'] ?? 0).toDouble(),
      weatherSuitability: json['weatherSuitability'] ?? '',
    );
  }
}