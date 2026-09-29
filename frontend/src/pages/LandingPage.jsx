import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlightTakeoff,
  AutoAwesome,
  Person,
  TravelExplore,
  ExploreOutlined,
  MapOutlined,
  ConfirmationNumber,
  Payment,
  QrCode2,
  SmartToy,
  Psychology,
  SearchOutlined,
  VerifiedUser,
  AttachMoney,
  Star,
  ArrowForward,
  CheckCircle,
  Menu as MenuIcon,
  Close as CloseIcon,
  PublicOutlined,
  PlaceOutlined,
} from '@mui/icons-material';

/* ============ SCROLL REVEAL WRAPPER ============ */
const ScrollReveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ============ COUNT-UP HOOK ============ */
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = Date.now();
        const tick = () => {
          const progress = Math.min((Date.now() - startTime) / duration, 1);
          setCount(Math.floor(start + (end - start) * progress));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return [ref, count];
};

/* ============ MAIN LANDING PAGE ============ */
const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('Traveler');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [tripsRef, tripsCount] = useCountUp(10000, 2000);
  const [guidesRef, guidesCount] = useCountUp(500, 2000);
  const [agentsRef, agentsCount] = useCountUp(4, 1500);
  const [satisfactionRef, satisfactionCount] = useCountUp(98, 2000);

  const roles = {
    Traveler: {
      icon: <Person className="text-3xl text-white" />,
      color: 'from-indigo-500 to-purple-600',
      title: 'For Travelers',
      subtitle: 'Plan your dream Sri Lankan journey',
      points: [
        'Create AI-powered multi-day trips in seconds',
        'Browse verified local guides and experiences',
        'Real-time budget tracking with smart alerts',
        'Book, pay, and QR check-in on the go',
        'Write reviews after your trip',
      ],
    },
    'Local Guide': {
      icon: <TravelExplore className="text-3xl text-white" />,
      color: 'from-emerald-500 to-teal-600',
      title: 'For Local Guides',
      subtitle: 'Share your expertise, earn money',
      points: [
        'Publish experiences with dynamic pricing',
        'Manage availability & confirm bookings',
        'Reply to traveler reviews',
        'View your earnings & analytics dashboard',
        'Get approved by admins to go live',
      ],
    },
    'Travel Agent': {
      icon: <VerifiedUser className="text-3xl text-white" />,
      color: 'from-amber-500 to-orange-600',
      title: 'For Travel Agents',
      subtitle: 'Review and approve AI itineraries',
      points: [
        'Review AI-generated trip itineraries',
        'Approve, reject, or request revisions',
        'Monitor all AI execution logs',
        'Help travelers customize their trips',
        'Approve itineraries before booking opens',
      ],
    },
    Admin: {
      icon: <PublicOutlined className="text-3xl text-white" />,
      color: 'from-rose-500 to-pink-600',
      title: 'For Administrators',
      subtitle: 'Manage the entire platform',
      points: [
        'Approve Local Guides & Travel Agents',
        'Manage destinations & experiences',
        'Monitor platform-wide analytics',
        'Oversee all bookings and refunds',
        'Moderate reviews across the platform',
      ],
    },
  };

  const features = [
    {
      icon: <Psychology className="text-3xl text-white" />,
      title: 'AI Itinerary Planning',
      desc: 'Four specialized AI agents plan, research, validate, and finalize your trip.',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: <TravelExplore className="text-3xl text-white" />,
      title: 'Verified Local Guides',
      desc: 'Real Sri Lankan experts publishing authentic experiences in every destination.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <AttachMoney className="text-3xl text-white" />,
      title: 'Smart Budget Tracking',
      desc: 'Real-time alerts when costs exceed your budget or any category exceeds 40%.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: <QrCode2 className="text-3xl text-white" />,
      title: 'QR Check-In',
      desc: 'Scan a QR code on trip day — instant verification, no paperwork.',
      color: 'from-sky-500 to-blue-600',
    },
    {
      icon: <Payment className="text-3xl text-white" />,
      title: 'Secure Payments & Refunds',
      desc: 'PayHere gateway integration with transparent refund policies.',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: <SmartToy className="text-3xl text-white" />,
      title: 'Multi-Agent Orchestration',
      desc: 'Human-in-the-loop approval ensures quality before booking opens.',
      color: 'from-violet-500 to-fuchsia-600',
    },
  ];

  const steps = [
    { num: '01', title: 'Create Trip with AI', desc: 'Enter destination, dates, budget, and interests.' },
    { num: '02', title: 'Agent Reviews', desc: 'Travel Agent approves your AI itinerary.' },
    { num: '03', title: 'Book Experiences', desc: 'Reserve your spots with local guides.' },
    { num: '04', title: 'Pay & Confirm', desc: 'Secure payment + instant confirmation.' },
    { num: '05', title: 'QR Check-In', desc: 'Scan on trip day and enjoy the journey.' },
  ];

  const agents = [
    {
      icon: <Psychology className="text-4xl text-white" />,
      name: 'Planner Agent',
      desc: 'Creates the day-by-day structured itinerary plan.',
      color: 'from-indigo-500 to-indigo-700',
    },
    {
      icon: <SearchOutlined className="text-4xl text-white" />,
      name: 'Research Agent',
      desc: 'Finds matching experiences using live Weather API data.',
      color: 'from-emerald-500 to-emerald-700',
    },
    {
      icon: <AttachMoney className="text-4xl text-white" />,
      name: 'Budget Agent',
      desc: 'Validates total cost against budget with category limits.',
      color: 'from-amber-500 to-amber-700',
    },
    {
      icon: <CheckCircle className="text-4xl text-white" />,
      name: 'Approval Agent',
      desc: 'Pauses for human review — final safety net before booking.',
      color: 'from-rose-500 to-rose-700',
    },
  ];

  const destinations = [
    { name: 'Colombo', img: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=600&q=80', tag: 'Urban & Culture' },
    { name: 'Ella', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&q=80', tag: 'Hills & Tea' },
    { name: 'Kandy', img: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=600&q=80', tag: 'Sacred & Heritage' },
    { name: 'Galle', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', tag: 'Beach & Fort' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Traveler from USA',
      quote: 'The AI planned a 5-day Ella trip in under a minute. The local guide was fantastic. Best trip ever!',
      avatar: 'S',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      name: 'Kasun Perera',
      role: 'Local Guide · Kandy',
      quote: 'I posted my tea factory experience and got 20 bookings in the first month. The platform just works.',
      avatar: 'K',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'Mike Chen',
      role: 'Travel Agent',
      quote: 'Reviewing AI itineraries is now my favorite part of the job. Everything is transparent and auditable.',
      avatar: 'M',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* ==================== NAVBAR ==================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-md border-b border-slate-200' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FlightTakeoff className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-slate-900">TripCraft</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-slate-600 hover:text-indigo-600 transition">Features</a>
            <a href="#how" className="text-slate-600 hover:text-indigo-600 transition">How it Works</a>
            <a href="#agents" className="text-slate-600 hover:text-indigo-600 transition">AI Agents</a>
            <a href="#roles" className="text-slate-600 hover:text-indigo-600 transition">Roles</a>
            <a href="#destinations" className="text-slate-600 hover:text-indigo-600 transition">Destinations</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/40 transition-all"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white mt-3 mx-4 rounded-2xl p-4 space-y-3 shadow-lg border border-slate-200">
            <a href="#features" className="block text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how" className="block text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#agents" className="block text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>AI Agents</a>
            <a href="#roles" className="block text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>Roles</a>
            <a href="#destinations" className="block text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>Destinations</a>
            <hr className="border-slate-200" />
            <Link to="/login" className="block text-slate-700 py-2">Sign In</Link>
            <Link to="/register" className="block text-center py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Background image with light overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=1920&q=80"
            alt="Sri Lanka"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/90 to-slate-50" />
        </div>

        {/* Animated glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 mb-8">
            <AutoAwesome className="text-amber-500 text-sm" />
            <span className="text-xs font-medium text-slate-700">Powered by 4 Autonomous AI Agents</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-slate-900">
            Plan. <span className="gradient-text">Explore.</span> Experience.
            <br />
            Sri Lanka with AI.
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            TripCraft fuses cutting-edge AI itinerary planning with real local guides
            to craft your perfect Sri Lankan journey — from first click to final memory.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-base shadow-lg hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Start Planning Free
              <ArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-white border border-slate-200 font-semibold text-base text-slate-700 hover:bg-slate-100 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div ref={tripsRef} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{tripsCount.toLocaleString()}+</div>
              <div className="text-xs text-slate-500 mt-1">Trips Planned</div>
            </div>
            <div ref={guidesRef} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{guidesCount}+</div>
              <div className="text-xs text-slate-500 mt-1">Local Guides</div>
            </div>
            <div ref={agentsRef} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{agentsCount}</div>
              <div className="text-xs text-slate-500 mt-1">AI Agents</div>
            </div>
            <div ref={satisfactionRef} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{satisfactionCount}%</div>
              <div className="text-xs text-slate-500 mt-1">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-slate-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Features</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-slate-900">
                Everything you need for the <span className="gradient-text">perfect trip</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                From AI planning to QR check-in — every layer built for real travel.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how" className="relative py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">How it Works</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-slate-900">
                From <span className="gradient-text">idea</span> to <span className="gradient-text">adventure</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Five simple steps. Four AI agents working behind the scenes.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 120}>
                <div className="relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all h-full">
                  <div className="text-5xl font-black text-indigo-100 mb-3">{s.num}</div>
                  <h3 className="text-base font-bold mb-2 text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== AI AGENTS ==================== */}
      <section id="agents" className="relative py-24 px-6 bg-white overflow-hidden">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse-glow" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Agentic AI</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-slate-900">
                Meet your <span className="gradient-text">4 AI agents</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Each agent has a distinct role. Together, they plan every trip flawlessly.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((a, i) => (
              <ScrollReveal key={a.name} delay={i * 120}>
                <div className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform`}>
                    {a.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{a.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{a.desc}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-600 font-medium">Active</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ROLES ==================== */}
      <section id="roles" className="relative py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Built for Everyone</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-slate-900">
                One platform, <span className="gradient-text">four roles</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Travelers, guides, agents, and admins — each with the tools they need.
              </p>
            </div>
          </ScrollReveal>

          {/* Tabs */}
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {Object.keys(roles).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeRole === role
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal key={activeRole}>
            <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
              <div className={`p-10 rounded-3xl bg-gradient-to-br ${roles[activeRole].color} shadow-2xl`}>
                <div className="mb-4">{roles[activeRole].icon}</div>
                <h3 className="text-3xl font-bold mb-2 text-white">{roles[activeRole].title}</h3>
                <p className="text-white/90">{roles[activeRole].subtitle}</p>
              </div>
              <div className="space-y-4">
                {roles[activeRole].points.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== DESTINATIONS ==================== */}
      <section id="destinations" className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Destinations</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-slate-900">
                Explore <span className="gradient-text">paradise</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                From misty tea hills to golden beaches — Sri Lanka awaits.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((d, i) => (
              <ScrollReveal key={d.name} delay={i * 100}>
                <div className="group relative rounded-2xl overflow-hidden h-80 cursor-pointer shadow-lg">
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-medium mb-2 text-white">
                      {d.tag}
                    </span>
                    <h3 className="text-2xl font-bold text-white">{d.name}</h3>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="relative py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-slate-900">
                Loved by <span className="gradient-text">travelers & guides</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 120}>
                <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="text-amber-500 text-sm" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-24 px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        <ScrollReveal>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900">
              Your next <span className="gradient-text">adventure</span> starts here.
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Join thousands of travelers planning their Sri Lankan dream trip with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowForward className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative py-12 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FlightTakeoff className="text-white text-sm" />
              </div>
              <span className="font-bold text-slate-900">TripCraft</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#features" className="hover:text-indigo-600 transition">Features</a>
              <a href="#agents" className="hover:text-indigo-600 transition">AI Agents</a>
              <a href="#roles" className="hover:text-indigo-600 transition">Roles</a>
              <Link to="/login" className="hover:text-indigo-600 transition">Sign In</Link>
            </div>

            <p className="text-xs text-slate-400">
              © 2026 TripCraft · All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;