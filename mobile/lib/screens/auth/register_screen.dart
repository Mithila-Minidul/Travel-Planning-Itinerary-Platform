import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/profile_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _obscurePassword = true;
  bool _isRegistering = false;

  // ✅ Only store bytes locally — NO immediate upload
  Uint8List? _imageBytes;
  String? _imageFileName;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  // ✅ Pick image — just store in memory
  Future<void> _pickImage() async {
    final ImageSource? source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Colors.indigo),
              title: const Text('Take a Photo'),
              onTap: () => Navigator.pop(context, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: Colors.indigo),
              title: const Text('Choose from Gallery'),
              onTap: () => Navigator.pop(context, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source == null) return;

    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 80,
      );

      if (image == null) return;

      final bytes = await image.readAsBytes();
      if (bytes.length > 5 * 1024 * 1024) {
        if (mounted) _showSnack('Image must be less than 5MB', Colors.red);
        return;
      }

      // ✅ Just store in state — NO upload
      setState(() {
        _imageBytes = bytes;
        _imageFileName = image.name;
      });
    } catch (e) {
      if (mounted) _showSnack('Failed to pick image: $e', Colors.red);
    }
  }

  // ✅ Remove selected image
  void _removeImage() {
    setState(() {
      _imageBytes = null;
      _imageFileName = null;
    });
  }

  void _showSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: color),
    );
  }

  // ✅ Register — upload image first, then register
  Future<void> _handleRegister() async {
    Provider.of<AuthProvider>(context, listen: false).clearError();

    // Validate
    if (_fullNameController.text.trim().isEmpty ||
    _emailController.text.trim().isEmpty ||
    _passwordController.text.isEmpty) {
  _showSnack('Please fill all required fields', Colors.red);
  return;
}

if (_passwordController.text.length < 6) {
  _showSnack('Password must be at least 6 characters', Colors.red);
  return;
}

// ✅ Phone number required
if (_phoneController.text.trim().isEmpty) {
  _showSnack('Phone number is required', Colors.red);
  return;
}

// ✅ Phone number format (Sri Lankan)
final phone = _phoneController.text.trim();
final phoneRegex = RegExp(r'^(07\d{8}|\+94[\s-]?7\d{8}|0094[\s-]?7\d{8})$');
if (!phoneRegex.hasMatch(phone)) {
  _showSnack('Enter a valid Sri Lankan phone (e.g., 0712345678)', Colors.red);
  return;
}

    setState(() => _isRegistering = true);

    String? uploadedImageUrl;

    // ✅ STEP 1: Upload image ONLY if user picked one
    if (_imageBytes != null && _imageFileName != null) {
      try {
        _showSnack('Uploading photo...', Colors.blue);
        uploadedImageUrl = await ProfileService.uploadProfileImage(
          _imageBytes!,
          _imageFileName!,
        );
      } catch (e) {
        if (mounted) {
          setState(() => _isRegistering = false);
          _showSnack(
            'Photo upload failed: ${e.toString().replaceAll('Exception: ', '')}',
            Colors.red,
          );
        }
        return;
      }
    }

    // ✅ STEP 2: Register with uploaded URL
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.register(
      fullName: _fullNameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      phoneNumber: _phoneController.text.trim(),  // ✅ Always required now
      profileImageUrl: uploadedImageUrl,
    );

    if (mounted) {
      setState(() => _isRegistering = false);
    }

    if (success && mounted) {
      _showSnack('Registration successful! Please login.', Colors.green);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isLoading = authProvider.loading || _isRegistering;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.indigo,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Text(
                'Create Your Account',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Register as a Traveler to start planning trips',
                style: TextStyle(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // ✅ PROFILE PHOTO PICKER
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.indigo[50],
                        border: Border.all(
                          color: Colors.indigo.withOpacity(0.3),
                          width: 3,
                        ),
                      ),
                      child: _imageBytes != null
                          ? ClipOval(
                              child: Image.memory(
                                _imageBytes!,
                                fit: BoxFit.cover,
                                width: 120,
                                height: 120,
                              ),
                            )
                          : const Icon(
                              Icons.person,
                              size: 60,
                              color: Colors.indigo,
                            ),
                    ),

                    // Remove button
                    if (_imageBytes != null && !isLoading)
                      Positioned(
                        top: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _removeImage,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              size: 16,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),

                    // Camera button
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: isLoading ? null : _pickImage,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Colors.indigo,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 8),

              TextButton.icon(
                onPressed: isLoading ? null : _pickImage,
                icon: const Icon(Icons.photo_library_outlined, size: 18),
                label: Text(
                  _imageBytes == null ? 'Add Profile Photo' : 'Change Photo',
                ),
              ),

              const SizedBox(height: 16),

              // Error Message
              if (authProvider.error != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    border: Border.all(color: Colors.red[200]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    authProvider.error!,
                    style: TextStyle(color: Colors.red[700], fontSize: 13),
                  ),
                ),

              // Full Name
              TextField(
                controller: _fullNameController,
                decoration: InputDecoration(
                  labelText: 'Full Name *',
                  prefixIcon: const Icon(Icons.person_outline),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Email
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email *',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Password
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password *',
                  prefixIcon: const Icon(Icons.lock_outline),
                  helperText: 'Minimum 6 characters',
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword
                        ? Icons.visibility_off
                        : Icons.visibility),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Phone
              TextField(
  controller: _phoneController,
  keyboardType: TextInputType.phone,
  decoration: InputDecoration(
    labelText: 'Phone Number *',           // ✅ Required marker
    prefixIcon: const Icon(Icons.phone_outlined),
    helperText: 'e.g., 0712345678',        // ✅ Format hint
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
    ),
  ),
),
              const SizedBox(height: 24),

              // Register Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Register',
                          style: TextStyle(fontSize: 16, color: Colors.white),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}