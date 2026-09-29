import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../../utils/constants.dart';
import '../../services/api_client.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final user = auth.user;

        if (user == null) {
          return const Center(child: CircularProgressIndicator());
        }

        return SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const SizedBox(height: 10),

                // ================= AVATAR =================
                _buildAvatar(user.profileImageUrl, user.fullName),
                const SizedBox(height: 16),

                // ================= NAME + EMAIL =================
                Text(
                  user.fullName,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    user.role,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF4F46E5),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // ================= EDIT BUTTON =================
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _showEditProfile(context, auth),
                    icon: const Icon(Icons.edit, size: 18),
                    label: const Text('Edit Profile'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ================= INFO CARD =================
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    children: [
                      _buildInfoTile(Icons.phone_outlined, 'Phone',
                          user.phoneNumber ?? 'Not set'),
                      const Divider(height: 1),
                      _buildInfoTile(Icons.email_outlined, 'Email', user.email),
                      const Divider(height: 1),
                      _buildInfoTile(Icons.verified_user_outlined, 'Account Status',
                          user.isActive ? 'Active' : 'Inactive'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ================= ACTIONS CARD =================
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    children: [
                      _buildActionTile(
                        Icons.lock_outline,
                        'Change Password',
                        () => _showChangePassword(context, auth),
                      ),
                      const Divider(height: 1),
                      _buildActionTile(
                        Icons.logout,
                        'Logout',
                        () => _confirmLogout(context, auth),
                        color: Colors.red,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        );
      },
    );
  }

  // ===================== HELPERS =====================

  Widget _buildAvatar(String? imageUrl, String name) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFF4F46E5), width: 3),
      ),
      child: CircleAvatar(
        radius: 50,
        backgroundColor: const Color(0xFFEEF2FF),
        backgroundImage: (imageUrl != null && imageUrl.isNotEmpty)
            ? NetworkImage(imageUrl)
            : null,
        child: (imageUrl == null || imageUrl.isEmpty)
            ? Text(
                name.isNotEmpty ? name[0].toUpperCase() : 'T',
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF4F46E5),
                ),
              )
            : null,
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF4F46E5)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                const SizedBox(height: 2),
                Text(value,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(IconData icon, String label, VoidCallback onTap,
      {Color color = const Color(0xFF0F172A)}) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label,
                  style: TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w600, color: color)),
            ),
            const Icon(Icons.chevron_right, size: 20, color: Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }

  // ===================== EDIT PROFILE MODAL =====================
    void _showEditProfile(BuildContext context, AuthProvider auth) {
    final nameController = TextEditingController(text: auth.user?.fullName ?? '');
    final phoneController = TextEditingController(text: auth.user?.phoneNumber ?? '');
    String? pickedImageUrl = auth.user?.profileImageUrl;
    bool uploading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Edit Profile',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),

                // ================= PHOTO PICKER =================
                Center(
                  child: Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF4F46E5), width: 2),
                        ),
                        child: CircleAvatar(
                          radius: 45,
                          backgroundColor: const Color(0xFFEEF2FF),
                          backgroundImage: (pickedImageUrl != null && pickedImageUrl!.isNotEmpty)
                              ? NetworkImage(pickedImageUrl!)
                              : null,
                          child: (pickedImageUrl == null || pickedImageUrl!.isEmpty)
                              ? Text(
                                  (auth.user?.fullName ?? 'T')[0].toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF4F46E5),
                                  ),
                                )
                              : null,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: uploading
                              ? null
                              : () async {
                                  final picker = ImagePicker();
                                  final XFile? img = await picker.pickImage(
                                    source: ImageSource.gallery,
                                    imageQuality: 70,
                                    maxWidth: 800,
                                  );
                                  if (img == null) return;

                                  setModalState(() => uploading = true);
                                  try {
                                    final res = await ApiClient.uploadImage(
                                      ApiConstants.imageUpload,
                                      img,
                                    );
                                    final url = res['url'] ??
                                        res['imageUrl'] ??
                                        res['fileUrl'] ??
                                        res['path'] ??
                                        res['photoUrl'];
                                    if (url != null) {
                                      setModalState(() => pickedImageUrl = url.toString());
                                    } else {
                                      throw Exception('Upload response missing URL key.');
                                    }
                                  } catch (e) {
                                    if (ctx.mounted) {
                                      ScaffoldMessenger.of(ctx).showSnackBar(
                                        SnackBar(
                                          content: Text('Upload failed: ${e.toString().replaceFirst('Exception: ', '')}'),
                                          backgroundColor: Colors.red,
                                        ),
                                      );
                                    }
                                  } finally {
                                    setModalState(() => uploading = false);
                                  }
                                },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Color(0xFF4F46E5),
                              shape: BoxShape.circle,
                            ),
                            child: uploading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.camera_alt,
                                    size: 16, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Center(
                  child: Text('Tap the camera to change photo',
                      style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                ),
                const SizedBox(height: 20),

                // ================= NAME =================
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 14),

                // ================= PHONE =================
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),

                // ================= SAVE =================
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: uploading
                        ? null
                        : () async {
                            if (nameController.text.trim().isEmpty) return;
                            Navigator.pop(ctx);
                            final ok = await auth.updateProfile(
                              fullName: nameController.text.trim(),
                              phoneNumber: phoneController.text.trim().isEmpty
                                  ? null
                                  : phoneController.text.trim(),
                              profileImageUrl: pickedImageUrl,
                            );
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(ok
                                      ? 'Profile updated!'
                                      : auth.error ?? 'Failed'),
                                  backgroundColor: ok ? Colors.green : Colors.red,
                                ),
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('Save Changes'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ===================== CHANGE PASSWORD MODAL =====================
    void _showChangePassword(BuildContext context, AuthProvider auth) {
    final oldController = TextEditingController();
    final newController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Change Password',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: oldController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Current Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: newController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'New Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (oldController.text.isEmpty || newController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please fill both fields.')),
                    );
                    return;
                  }

                  // 👇 WARNING DIALOG BEFORE SUBMITTING
                  showDialog(
                    context: context,
                    builder: (confirmCtx) => AlertDialog(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      title: const Row(
                        children: [
                          Icon(Icons.warning_amber_rounded, color: Colors.orange),
                          SizedBox(width: 8),
                          Text('Confirm Password Change'),
                        ],
                      ),
                      content: const Text(
                        'After changing your password, you will be logged out and will need to log in again with your new password.\n\nDo you want to continue?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(confirmCtx),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4F46E5),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () async {
                            Navigator.pop(confirmCtx); // close confirm dialog
                            Navigator.pop(ctx); // close bottom sheet

                            final ok = await auth.changePassword(
                              oldPassword: oldController.text,
                              newPassword: newController.text,
                            );

                            if (!context.mounted) return;

                            if (ok) {
                              // 👇 AUTO LOGOUT + REDIRECT TO LOGIN
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Password changed! Please login again.'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                              await Future.delayed(const Duration(seconds: 1));
                              await auth.logout();
                              if (context.mounted) {
                                Navigator.of(context).pushNamedAndRemoveUntil(
                                  '/login',
                                  (route) => false,
                                );
                              }
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(auth.error ?? 'Failed to change password'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                          },
                          child: const Text('Yes, Change'),
                        ),
                      ],
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Update Password'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ===================== LOGOUT =====================
  void _confirmLogout(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await auth.logout();
              if (context.mounted) {
                Navigator.of(context)
                    .pushNamedAndRemoveUntil('/login', (route) => false);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}