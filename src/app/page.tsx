'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  ChevronRight,
  Shield,
  Zap,
  Users,
  Award,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Trophy,
  Coffee,
  HeartPulse,
  Activity,
  UserCheck,
  Send,
  Check
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  features: string; // JSON or comma separated
  isActive: boolean;
}

const TRAINERS = [
  {
    name: 'Vikram Rao',
    role: 'Head Strength Coach & Founder',
    experience: '12+ Years Experience',
    specialties: ['Powerlifting', 'Olympic Weightlifting', 'Athletic Conditioning'],
    certifications: 'CSCS, K11 Certified Master Trainer',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Priya Sharma',
    role: 'Senior Functional & Movement Coach',
    experience: '8+ Years Experience',
    specialties: ['HIIT & Metabolic Conditioning', 'Power Yoga', 'Mobility & Posture'],
    certifications: 'ACE Certified Personal Trainer, 500hr RYT',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rohit Sen',
    role: 'Bodybuilding & Hypertrophy Specialist',
    experience: '7+ Years Experience',
    specialties: ['Hypertrophy Science', 'Contest Prep', 'Sports Nutrition'],
    certifications: 'ISSA Bodybuilding Specialist, Precision Nutrition L1',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
  },
];

const TRANSFORMATIONS = [
  {
    name: 'Arjun Menon',
    duration: '16 Weeks',
    result: '-14 kg Fat Loss & Visible Abs',
    quote: 'The coaching structure, tracking app, and motivating crowd at Iron Forge completely transformed my physique and discipline.',
    stats: { beforeWeight: '88 kg', afterWeight: '74 kg', bodyFat: '-12%' },
    photoBefore: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80',
    photoAfter: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sneha Reddy',
    duration: '24 Weeks',
    result: 'Deadlift 110 kg & Postpartum Strength',
    quote: 'From zero gym experience to deadlifting more than my body weight. The trainers focus obsessively on proper technique and injury prevention.',
    stats: { beforeWeight: '66 kg', afterWeight: '58 kg', strength: '+250%' },
    photoBefore: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&auto=format&fit=crop&q=80',
    photoAfter: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Karthik Rao',
    duration: '12 Weeks',
    result: '+6.5 kg Lean Muscle & Peak Conditioning',
    quote: 'Having the custom PWA app track my progressive overload every set gave me laser focus. Best strength equipment in Bangalore.',
    stats: { beforeWeight: '62 kg', afterWeight: '68.5 kg', benchPress: '+35 kg' },
    photoBefore: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=300&auto=format&fit=crop&q=80',
    photoAfter: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=300&auto=format&fit=crop&q=80',
  },
];

const SCHEDULE_PREVIEW = [
  { day: 'Mon, Wed, Fri', time: '06:30 AM', name: 'Metabolic HIIT Surge', trainer: 'Priya Sharma', intensity: 'High' },
  { day: 'Tue, Thu, Sat', time: '07:30 AM', name: 'Powerlifting Foundations', trainer: 'Vikram Rao', intensity: 'Very High' },
  { day: 'Mon, Wed, Fri', time: '06:00 PM', name: 'Zumba & Dance Cardio', trainer: 'Ananya Bose', intensity: 'Medium' },
  { day: 'Tue, Thu, Sun', time: '07:00 PM', name: 'Iron Forge Cross-Train', trainer: 'Rohit Sen', intensity: 'High' },
  { day: 'Saturday', time: '08:00 AM', name: 'Power Yoga & Mobility', trainer: 'Priya Sharma', intensity: 'Recovery' },
];

export default function MarketingLandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Free Trial Form
  const [trialForm, setTrialForm] = useState({
    name: '',
    phone: '',
    email: '',
    fitnessGoal: 'Muscle Building & Strength',
    preferredTime: 'Morning (6 AM - 10 AM)',
  });
  const [submittingTrial, setSubmittingTrial] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch('/api/admin/plans');
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans || []);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.name || !trialForm.phone) {
      setTrialError('Please provide your name and 10-digit phone number');
      return;
    }

    try {
      setSubmittingTrial(true);
      setTrialError(null);
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trialForm,
          source: 'WEBSITE',
          notes: `Requested via homepage Free Trial Form (${trialForm.fitnessGoal}, ${trialForm.preferredTime})`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTrialSuccess(true);
        setTrialForm({
          name: '',
          phone: '',
          email: '',
          fitnessGoal: 'Muscle Building & Strength',
          preferredTime: 'Morning (6 AM - 10 AM)',
        });
      } else {
        setTrialError(data.error || 'Failed to submit trial request. Please try again.');
      }
    } catch (err) {
      console.error('Trial submit error:', err);
      setTrialError('Something went wrong. Please check your connection.');
    } finally {
      setSubmittingTrial(false);
    }
  };

  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    'Hi Iron Forge Fitness! I am interested in joining and would like to claim my free 1-day workout trial pass.'
  )}`;

  // Default plans if none seeded or fetched
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 'default-1',
      name: 'Monthly Classic',
      durationMonths: 1,
      price: 2499,
      features: '["Unlimited Gym Floor Access", "Full Locker & Steam Access", "Member Workout PWA App", "1 Free InBody Assessment"]',
      isActive: true,
    },
    {
      id: 'default-2',
      name: 'Quarterly Transformation',
      durationMonths: 3,
      price: 6499,
      features: '["Everything in Monthly", "Custom Macro & Nutrition Plan", "2 Personal Training Sessions", "Class Access (Zumba & Yoga)", "Member Discount on Cafe"]',
      isActive: true,
    },
    {
      id: 'default-3',
      name: 'Annual VIP Athlete',
      durationMonths: 12,
      price: 19999,
      features: '["Full 365 Days Unrestricted Access", "6 Free 1-on-1 PT Sessions", "Unlimited Studio Classes", "Complimentary Iron Forge Gym Bag & Shaker", "1 Month Membership Freeze Included"]',
      isActive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* LocalBusiness Schema for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HealthClub',
            name: 'Iron Forge Fitness',
            description:
              'Bengaluru’s premier high-performance strength and conditioning gym. Heavy iron, certified coaching, group classes, and real-time workout tracking.',
            url: 'https://ironforgefitness.in',
            telephone: '+919876543210',
            priceRange: '₹₹',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '42, 100 Feet Road, HAL 2nd Stage, Indiranagar',
              addressLocality: 'Bengaluru',
              addressRegion: 'Karnataka',
              postalCode: '560038',
              addressCountry: 'IN',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 12.9719,
              longitude: 77.6412,
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '06:00',
                closes: '22:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Sunday'],
                opens: '07:00',
                closes: '14:00',
              },
            ],
          }),
        }}
      />

      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-slate-950 text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>LIMITED SLOTS: Book your free 1-Day Trial workout with certified coach Vikram Rao today!</span>
        <a href="#trial" className="underline font-black hover:text-black">
          Claim Pass →
        </a>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#070A12]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                IRON FORGE <span className="text-emerald-400 font-extrabold text-sm">FITNESS</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Indiranagar • Bengaluru</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Facility
            </a>
            <a href="#classes" className="hover:text-emerald-400 transition-colors">
              Classes
            </a>
            <a href="#trainers" className="hover:text-emerald-400 transition-colors">
              Trainers
            </a>
            <a href="#plans" className="hover:text-emerald-400 transition-colors">
              Pricing
            </a>
            <a href="#transformations" className="hover:text-emerald-400 transition-colors">
              Results
            </a>
            <a href="#location" className="hover:text-emerald-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Member App
            </Link>

            <a
              href="#trial"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              Free Trial
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>#1 Ranked Strength & Athletic Gym in Indiranagar</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
                FORGE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">STRONGEST</span> SELF.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                No gimmicks. Heavy Olympic grade equipment, certified biomechanics coaching, 
                high-intensity group conditioning, and the smart <strong className="text-white">Iron Forge PWA App</strong> to track every single rep, set, and PR in real time.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#trial"
                  className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 group"
                >
                  <span>Book Free 1-Day Trial Pass</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#plans"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>View Membership Plans (₹)</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-white">12,000+</div>
                  <div className="text-xs text-slate-400">Sq Ft Training Floor</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">105+</div>
                  <div className="text-xs text-slate-400">Precision Workouts</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">4.9 ★</div>
                  <div className="text-xs text-slate-400">Google Verified (420+ Reviews)</div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-emerald-500/10 bg-gradient-to-b from-[#121B2F] to-[#0A101D] p-2">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80"
                  alt="Iron Forge Gym Interior with Barbells"
                  className="rounded-2xl object-cover w-full h-[400px]"
                />

                {/* Overlay Floating Badges */}
                <div className="absolute top-6 left-6 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 flex items-center gap-3 shadow-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Real-Time Crowd</div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Moderate Capacity (42%)
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 flex items-center gap-3 shadow-xl">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Member PR Detected</div>
                    <div className="text-[11px] text-slate-300">Arjun M. hit 140kg Deadlift!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gym Features / USP Section */}
      <section id="features" className="py-20 bg-[#0B0F1D] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">World-Class Infrastructure</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Everything You Need To Break Plateaus</h2>
            <p className="text-sm text-slate-400">
              Built by athletes for serious lifters, beginners, and functional enthusiasts alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#10172A] border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Heavy Olympic Lifting Platforms</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                4 full-size drop platforms with competition Eleiko and Rogue barbells, calibrated bumper plates, and urethane dumbbells up to 50 kg.
              </p>
            </div>

            <div className="bg-[#10172A] border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Instant Offline PWA Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log your sets, reps, weight steppers, and rest timer right on your mobile phone even with zero basement network. Auto-syncs when online.
              </p>
            </div>

            <div className="bg-[#10172A] border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Protein Bar & Steam Recovery</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fresh whey protein shakes, BCAA coolers, cold brew espresso, alongside sanitized eucalyptus steam suites and clean private showers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Class Schedule Section */}
      <section id="classes" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">High Energy Group Sessions</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Weekly Group Studio Schedule</h2>
            <p className="text-sm text-slate-400 mt-2">
              All classes led by elite certified coaches. Included with Quarterly and Annual memberships.
            </p>
          </div>
          <a
            href="#trial"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
          >
            <span>Book a trial in any class</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCHEDULE_PREVIEW.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0D1322] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.day}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">{item.name}</h4>
                <p className="text-xs text-slate-400 mt-1">Instructor: {item.trainer}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Intensity: <strong className="text-white">{item.intensity}</strong>
                </span>
                <a
                  href="#trial"
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
                >
                  Join Class
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trainers Showcase */}
      <section id="trainers" className="py-20 bg-[#0B0F1D] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Certified Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Meet Your Coaches</h2>
            <p className="text-sm text-slate-400">
              No bro-science. Scientifically structured programming tailored to your individual anatomy and lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRAINERS.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#10172A] border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-slate-700">
                    {t.experience}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{t.name}</h3>
                    <p className="text-xs font-semibold text-emerald-400 mt-0.5">{t.role}</p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">{t.certifications}</p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-300 mb-2">Specialties:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.specialties.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Transformations / Social Proof */}
      <section id="transformations" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Real Results</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Member Transformations</h2>
          <p className="text-sm text-slate-400">
            Real people. Real consistency. See what happens when dedication meets precision programming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRANSFORMATIONS.map((tr, idx) => (
            <div
              key={idx}
              className="bg-[#0D1322] border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">{tr.name}</h4>
                    <span className="text-xs text-emerald-400 font-bold">{tr.result}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {tr.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;{tr.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                {Object.entries(tr.stats).map(([k, v], sIdx) => (
                  <div key={sIdx} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-white">{v}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Membership Plans */}
      <section id="plans" className="py-20 bg-[#0B0F1D] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Membership Plans</h2>
            <p className="text-sm text-slate-400">
              No hidden admission fees. All plans include full floor access and the Iron Forge PWA companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {displayPlans.map((plan, idx) => {
              const isPopular = idx === 1; // Highlight middle plan
              let featuresList: string[] = [];
              try {
                featuresList = Array.isArray(plan.features)
                  ? plan.features
                  : JSON.parse(plan.features);
              } catch {
                featuresList = plan.features ? plan.features.split(',') : [];
              }

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'bg-[#121B2F] border-2 border-emerald-500 shadow-2xl shadow-emerald-500/15'
                      : 'bg-[#10172A] border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Duration: {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-400">₹</span>
                      <span className="text-4xl font-black text-white">{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400 font-medium">/ period</span>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      {featuresList.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <a
                      href="#trial"
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isPopular
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Get Started with Trial</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            * Note: Payments are received manually at the front desk via UPI or Cash. Digital tax invoices provided with 18% GST breakdown.
          </p>
        </div>
      </section>

      {/* Free Trial Form Section */}
      <section id="trial" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#0D1322] border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-14">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Experience Iron Forge</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Claim Your Free 1-Day Trial Pass
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Step onto the training floor, test our heavy barbells, consult with coach Vikram, and experience the facility firsthand before making any commitment.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero sales pressure or forced contracts</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Complimentary InBody body composition scan included</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Free locker and recovery steam session access</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                <img
                  className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Member"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Member"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Member"
                />
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-white font-bold">140+ people</strong> claimed free trials this month
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 bg-[#12192C] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
            {trialSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Trial Pass Reserved!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Thank you! Our front desk team has received your inquiry. We have sent a confirmation message on WhatsApp and look forward to welcoming you.
                </p>
                <button
                  onClick={() => setTrialSuccess(false)}
                  className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleTrialSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Book Your Visit</h3>

                {trialError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold">
                    {trialError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={trialForm.name}
                    onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                    className="w-full bg-[#0A101D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">10-Digit Mobile / WhatsApp *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-700 bg-slate-900 text-slate-400 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={trialForm.phone}
                      onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                      className="w-full bg-[#0A101D] border border-slate-700 rounded-r-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={trialForm.email}
                    onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                    className="w-full bg-[#0A101D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Goal</label>
                    <select
                      value={trialForm.fitnessGoal}
                      onChange={(e) => setTrialForm({ ...trialForm, fitnessGoal: e.target.value })}
                      className="w-full bg-[#0A101D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Fat Loss & Toning">Fat Loss & Toning</option>
                      <option value="Muscle Building & Strength">Muscle Building & Strength</option>
                      <option value="General Health & Mobility">General Health & Mobility</option>
                      <option value="Athletic Conditioning">Athletic Conditioning</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Time</label>
                    <select
                      value={trialForm.preferredTime}
                      onChange={(e) => setTrialForm({ ...trialForm, preferredTime: e.target.value })}
                      className="w-full bg-[#0A101D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Morning (6 AM - 10 AM)">Morning (6 AM - 10 AM)</option>
                      <option value="Afternoon (11 AM - 4 PM)">Afternoon (11 AM - 4 PM)</option>
                      <option value="Evening (5 PM - 10 PM)">Evening (5 PM - 10 PM)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingTrial}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mt-2"
                >
                  {submittingTrial ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm Free Trial Workout</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Location, Hours & Map Section */}
      <section id="location" className="py-20 bg-[#0B0F1D] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Visit Our Facility</span>
              <h2 className="text-3xl font-black text-white">Located in the Heart of Indiranagar</h2>
              <p className="text-sm text-slate-400">
                Spanning 3 expansive floors on 100 Feet Road with dedicated basement parking and valet service.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Address</h5>
                    <p className="text-xs text-slate-400">42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Operating Hours</h5>
                    <p className="text-xs text-slate-400">Monday – Saturday: 06:00 AM – 10:00 PM</p>
                    <p className="text-xs text-slate-400">Sunday: 07:00 AM – 02:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Contact & Support</h5>
                    <p className="text-xs text-slate-400">+91 98765 43210 / contact@ironforgefitness.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Google Map / Location Card */}
            <div className="lg:col-span-7 bg-[#10172A] border border-slate-800 rounded-3xl overflow-hidden p-3 shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden h-[340px] bg-slate-900 border border-slate-800 flex items-center justify-center">
                <iframe
                  title="Iron Forge Fitness Gym Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.97155077464!2d77.641208!3d12.971940!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a69365c711%3A0x7d6f51c726b2b73!2sIndiranagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-white shadow-xl flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Iron Forge Fitness • 100 Feet Rd</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05070D] border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="font-black text-lg text-white">IRON FORGE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bengaluru’s premier high-performance strength and conditioning facility. Dedicated to elite coaching and progressive overload.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Navigation</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-emerald-400">Facility & Barbells</a></li>
                <li><a href="#classes" className="hover:text-emerald-400">Class Timetable</a></li>
                <li><a href="#trainers" className="hover:text-emerald-400">Head Coaches</a></li>
                <li><a href="#plans" className="hover:text-emerald-400">Membership Tiers</a></li>
                <li><a href="#trial" className="hover:text-emerald-400">Book Free Trial</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Digital Portals</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/app" className="hover:text-emerald-400">Member Mobile App</Link></li>
                <li><Link href="/app/workout" className="hover:text-emerald-400">Workout Logger</Link></li>
                <li><Link href="/app/leaderboard" className="hover:text-emerald-400">Gym Leaderboard</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400">Staff & Admin Login</Link></li>
                <li><Link href="/admin" className="hover:text-emerald-400">Owner Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Front Desk Contact</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Call / WhatsApp: +91 98765 43210<br />
                Indiranagar, Bengaluru, KA 560038<br />
                GSTIN: 29AAAAA0000A1Z5
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Iron Forge Fitness Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/login" className="hover:text-slate-300">Staff Portal</Link>
              <Link href="/app" className="hover:text-slate-300">Member PWA</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center transition-all hover:scale-110 group"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out px-0 group-hover:px-2 text-xs font-bold">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
