import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../destinations/destination_browse_screen.dart';
import '../trips/trip_list_screen.dart';
import '../bookings/booking_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 2; // Default to Center Home

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    final List<Widget> pages = [
      const DestinationBrowseScreen(), // Browse
      const TripListScreen(), // ✅ Real Trip List
      _buildDashboard(context, user), // Home Dashboard
      const BookingListScreen(), // Bookings
      _buildProfile(context, user), // Profile
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: Container(
        height: 60,
        width: 60,
        margin: const EdgeInsets.only(top: 30),
        child: FloatingActionButton(
          elevation: 4,
          backgroundColor: const Color(0xFF4F46E5),
          shape: const CircleBorder(),
          onPressed: () => setState(() => _currentIndex = 2),
          child: Icon(
            Icons.home_rounded,
            color: _currentIndex == 2 ? Colors.white : Colors.white.withOpacity(0.7),
            size: 28,
          ),
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        color: Colors.white,
        elevation: 10,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.explore_outlined, Icons.explore, 'Browse'),
              _buildNavItem(1, Icons.map_outlined, Icons.map, 'Trips'),
              const SizedBox(width: 48), // Space for center Home FAB
              _buildNavItem(3, Icons.confirmation_number_outlined, Icons.confirmation_number, 'Bookings'),
              _buildNavItem(4, Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, IconData activeIcon, String label) {
    final isSelected = _currentIndex == index;
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF94A3B8),
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================
  // DASHBOARD TAB (HOME)
  // ============================================
  Widget _buildDashboard(BuildContext context, user) {
    return SafeArea(
      child: RefreshIndicator(
        color: const Color(0xFF4F46E5),
        onRefresh: () async => await Future.delayed(const Duration(seconds: 1)),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(user),
              const SizedBox(height: 20),
              _buildAiHeroBanner(context),
              const SizedBox(height: 24),
              _buildSectionTitle('Quick Actions'),
              const SizedBox(height: 12),
              _buildQuickActionGrid(context),
              const SizedBox(height: 24),
              _buildSectionHeader('Recent Trips', () {}),
              const SizedBox(height: 12),
              _buildTripCard(),
              const SizedBox(height: 24),
              _buildSectionHeader('Upcoming Bookings', () {}),
              const SizedBox(height: 12),
              _buildBookingCard(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(user) {
    return Row(
      children: [
        CircleAvatar(
          radius: 22,
          backgroundColor: const Color(0xFFEEF2FF),
          backgroundImage: (user?.profileImageUrl != null && user!.profileImageUrl!.isNotEmpty)
              ? NetworkImage(user.profileImageUrl!)
              : null,
          child: (user?.profileImageUrl == null || user!.profileImageUrl!.isEmpty)
              ? const Icon(Icons.person, color: Color(0xFF4F46E5))
              : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome back 👋',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              Text(
                user?.fullName ?? 'Traveler',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.notifications_outlined, color: Color(0xFF334155)),
        ),
      ],
    );
  }

  Widget _buildAiHeroBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Plan Your Next Trip with AI',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            'Generate itineraries verified by travel agents.',
            style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 12),
          ),
          const SizedBox(height: 14),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF4F46E5),
            ),
            child: const Text('Create Itinerary'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid(BuildContext context) {
    return Row(
      children: [
        _buildActionTile('Explore', Icons.compass_calibration_rounded, () => setState(() => _currentIndex = 0)),
        const SizedBox(width: 10),
        _buildActionTile('Plan AI', Icons.auto_awesome_rounded, () {}),
        const SizedBox(width: 10),
        _buildActionTile('Bookings', Icons.calendar_month_rounded, () => setState(() => _currentIndex = 3)),
      ],
    );
  }

  Widget _buildActionTile(String title, IconData icon, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Icon(icon, color: const Color(0xFF4F46E5), size: 22),
              const SizedBox(height: 6),
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTripCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: const Row(
        children: [
          Icon(Icons.flight_takeoff, color: Color(0xFF4F46E5)),
          SizedBox(width: 12),
          Text('No active trips created yet', style: TextStyle(color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildBookingCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: const Row(
        children: [
          Icon(Icons.confirmation_number_outlined, color: Color(0xFF10B981)),
          SizedBox(width: 12),
          Text('No active bookings', style: TextStyle(color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold));
  }

  Widget _buildSectionHeader(String title, VoidCallback onViewAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        GestureDetector(
          onTap: onViewAll,
          child: const Text('View All', style: TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _buildProfile(BuildContext context, user) {
    return const SafeArea(child: Center(child: Text('Profile Screen')));
  }

  Widget _buildComingSoon(String title, IconData icon) {
    return SafeArea(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: const Color(0xFF94A3B8)),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}