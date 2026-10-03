import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Gym Buddy...');

  // Clear existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.productSale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.memberBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.trainerSession.deleteMany();
  await prisma.classBooking.deleteMany();
  await prisma.gymClass.deleteMany();
  await prisma.dietPlan.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.food.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.bodyMetric.deleteMany();
  await prisma.personalRecord.deleteMany();
  await prisma.workoutSet.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.planDay.deleteMany();
  await prisma.planAssignment.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Gym Settings
  console.log('⚙️ Seeding Gym Settings...');
  await prisma.setting.createMany({
    data: [
      {
        key: 'gym_profile',
        valueJson: JSON.stringify({
          gymName: 'IRON FORGE FITNESS',
          tagline: 'Forge Your Strongest Self',
          logoUrl: '/logo.png',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          email: 'contact@ironforgegym.in',
          address: '42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
          googleMapsUrl: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
          openingHours: 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 8:00 PM',
          gstin: '29ABCDE1234F1Z5',
          currency: 'INR',
          currencySymbol: '₹',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
        }),
      },
      {
        key: 'theme_config',
        valueJson: JSON.stringify({
          primaryColor: '#10B981', // Electric Emerald / Lime
          accentColor: '#F59E0B',
          darkBg: '#090D16',
          cardBg: '#131A29',
          brandName: 'Iron Forge',
        }),
      },
      {
        key: 'capacity_config',
        valueJson: JSON.stringify({
          maxCapacity: 80,
          currentCountWindowMins: 75,
          peakHours: {
            morning: '06:00 - 09:30',
            evening: '18:00 - 21:30',
          },
        }),
      },
    ],
  });

  // 2. Users & Staff
  console.log('👤 Seeding Staff Users...');
  const owner = await prisma.user.create({
    data: {
      name: 'Raghav Singhania',
      email: 'owner@gymbuddy.com',
      phone: '9876543210',
      passwordHash,
      role: 'OWNER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Aman Verma',
      email: 'manager@gymbuddy.com',
      phone: '9876543211',
      passwordHash,
      role: 'MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const trainer1 = await prisma.user.create({
    data: {
      name: 'Vikram "The Titan" Rao',
      email: 'trainer@gymbuddy.com',
      phone: '9876543212',
      passwordHash,
      role: 'TRAINER',
      avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150',
    },
  });

  const trainer2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@gymbuddy.com',
      phone: '9876543214',
      passwordHash,
      role: 'TRAINER',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'Neha Kapoor',
      email: 'reception@gymbuddy.com',
      phone: '9876543213',
      passwordHash,
      role: 'RECEPTIONIST',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  // 3. Membership Plans
  console.log('💳 Seeding Membership Plans...');
  const monthlyPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Monthly Kickstart',
      durationMonths: 1,
      durationDays: 30,
      price: 2499,
      joiningFee: 500,
      featuresJson: JSON.stringify([
        'Full gym floor access',
        'Locker & steam room',
        '1 Free trainer induction',
        'Basic mobile app access',
      ]),
    },
  });

  const quarterlyPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Quarterly Pro',
      durationMonths: 3,
      durationDays: 90,
      price: 6499,
      joiningFee: 0,
      featuresJson: JSON.stringify([
        'Full gym & cardio floor access',
        'Unlimited group classes (Zumba, HIIT)',
        'Bi-weekly InBody assessment',
        'Workout & nutrition tracker app',
        'Free 15-day membership freeze',
      ]),
    },
  });

  const halfYearlyPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Half-Yearly Elite',
      durationMonths: 6,
      durationDays: 180,
      price: 11499,
      joiningFee: 0,
      featuresJson: JSON.stringify([
        'All Quarterly features',
        '1 Personal training session / month',
        'Custom workout & diet chart',
        'Complimentary gym duffle bag',
        'Free 30-day membership freeze',
      ]),
    },
  });

  const annualPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Annual VIP Iron Pass',
      durationMonths: 12,
      durationDays: 365,
      price: 18999,
      joiningFee: 0,
      featuresJson: JSON.stringify([
        'All-access 365 days VIP pass',
        'Priority slot booking for classes',
        '4 Personal training starter sessions',
        'Unlimited InBody scans',
        'Free 45-day membership freeze',
        'Complimentary gym merchandise kit',
      ]),
    },
  });

  const plans = [monthlyPlan, quarterlyPlan, halfYearlyPlan, annualPlan];

  // 4. Badges
  console.log('🏆 Seeding Badges...');
  const badgesList = [
    { code: 'FIRST_WORKOUT', name: 'First Blood', description: 'Logged your very first workout in the gym', iconName: 'Flame', category: 'Consistency', threshold: 1 },
    { code: 'STREAK_7', name: 'Week on Fire', description: 'Maintained a 7-day attendance streak', iconName: 'Zap', category: 'Consistency', threshold: 7 },
    { code: 'STREAK_30', name: 'Iron Discipline', description: 'Crushed a 30-day attendance streak', iconName: 'Award', category: 'Consistency', threshold: 30 },
    { code: 'PR_BREAKER', name: 'PR Crusher', description: 'Set a new Personal Record on any main lift', iconName: 'Trophy', category: 'Strength', threshold: 1 },
    { code: 'CLUB_100', name: 'Centurion', description: 'Logged 100 completed workouts', iconName: 'Crown', category: 'Loyalty', threshold: 100 },
    { code: 'EARLY_BIRD', name: 'Dawn Warrior', description: 'Checked in before 7:00 AM 10 times', iconName: 'Sun', category: 'Consistency', threshold: 10 },
  ];

  const createdBadges = [];
  for (const b of badgesList) {
    const badge = await prisma.badge.create({ data: b });
    createdBadges.push(badge);
  }

  // 5. 20 Members
  console.log('🏋️ Seeding 20 Members with profiles, memberships & history...');
  const memberData = [
    { name: 'Arjun Mehta', email: 'arjun@gmail.com', phone: '9811122331', gender: 'Male', goal: 'Muscle Gain', height: 178, weight: 76, plan: annualPlan, daysOffset: 120, status: 'ACTIVE' },
    { name: 'Rohan Sharma', email: 'rohan@gmail.com', phone: '9811122332', gender: 'Male', goal: 'Strength', height: 182, weight: 84, plan: halfYearlyPlan, daysOffset: 45, status: 'ACTIVE' },
    { name: 'Ananya Iyer', email: 'ananya@gmail.com', phone: '9811122333', gender: 'Female', goal: 'Fat Loss', height: 165, weight: 62, plan: quarterlyPlan, daysOffset: 5, status: 'EXPIRING_SOON' },
    { name: 'Kavita Nair', email: 'kavita@gmail.com', phone: '9811122334', gender: 'Female', goal: 'General Fitness', height: 160, weight: 58, plan: monthlyPlan, daysOffset: -3, status: 'EXPIRED' },
    { name: 'Siddharth Roy', email: 'sid@gmail.com', phone: '9811122335', gender: 'Male', goal: 'Muscle Gain', height: 175, weight: 70, plan: annualPlan, daysOffset: 200, status: 'ACTIVE' },
    { name: 'Sneha Patel', email: 'sneha@gmail.com', phone: '9811122336', gender: 'Female', goal: 'Fat Loss', height: 162, weight: 68, plan: quarterlyPlan, daysOffset: 30, status: 'ACTIVE' },
    { name: 'Aditya Kulkarni', email: 'aditya@gmail.com', phone: '9811122337', gender: 'Male', goal: 'Strength', height: 180, weight: 88, plan: halfYearlyPlan, daysOffset: 80, status: 'ACTIVE' },
    { name: 'Deepika Rao', email: 'deepika@gmail.com', phone: '9811122338', gender: 'Female', goal: 'General Fitness', height: 168, weight: 60, plan: monthlyPlan, daysOffset: 2, status: 'EXPIRING_SOON' },
    { name: 'Karan Malhotra', email: 'karan@gmail.com', phone: '9811122339', gender: 'Male', goal: 'Muscle Gain', height: 177, weight: 74, plan: annualPlan, daysOffset: 150, status: 'ACTIVE' },
    { name: 'Pooja Reddy', email: 'pooja@gmail.com', phone: '9811122340', gender: 'Female', goal: 'Fat Loss', height: 158, weight: 55, plan: quarterlyPlan, daysOffset: -10, status: 'EXPIRED' },
    { name: 'Varun Joshi', email: 'varun@gmail.com', phone: '9811122341', gender: 'Male', goal: 'Strength', height: 174, weight: 79, plan: halfYearlyPlan, daysOffset: 60, status: 'FROZEN' },
    { name: 'Meera Chawla', email: 'meera@gmail.com', phone: '9811122342', gender: 'Female', goal: 'General Fitness', height: 164, weight: 59, plan: monthlyPlan, daysOffset: 18, status: 'ACTIVE' },
    { name: 'Gaurav Sen', email: 'gaurav@gmail.com', phone: '9811122343', gender: 'Male', goal: 'Muscle Gain', height: 185, weight: 92, plan: annualPlan, daysOffset: 95, status: 'ACTIVE' },
    { name: 'Ishita Bansal', email: 'ishita@gmail.com', phone: '9811122344', gender: 'Female', goal: 'Fat Loss', height: 161, weight: 64, plan: quarterlyPlan, daysOffset: 4, status: 'EXPIRING_SOON' },
    { name: 'Tanmay Bhatt', email: 'tanmay@gmail.com', phone: '9811122345', gender: 'Male', goal: 'Fat Loss', height: 172, weight: 96, plan: halfYearlyPlan, daysOffset: 110, status: 'ACTIVE' },
    { name: 'Ritu Deshmukh', email: 'ritu@gmail.com', phone: '9811122346', gender: 'Female', goal: 'General Fitness', height: 166, weight: 61, plan: monthlyPlan, daysOffset: 25, status: 'ACTIVE' },
    { name: 'Nikhil Saxena', email: 'nikhil@gmail.com', phone: '9811122347', gender: 'Male', goal: 'Strength', height: 179, weight: 81, plan: annualPlan, daysOffset: 310, status: 'ACTIVE' },
    { name: 'Divya Nambiar', email: 'divya@gmail.com', phone: '9811122348', gender: 'Female', goal: 'General Fitness', height: 163, weight: 57, plan: quarterlyPlan, daysOffset: 50, status: 'ACTIVE' },
    { name: 'Manish Tiwari', email: 'manish@gmail.com', phone: '9811122349', gender: 'Male', goal: 'Muscle Gain', height: 176, weight: 73, plan: halfYearlyPlan, daysOffset: -5, status: 'EXPIRED' },
    { name: 'Simran Kaur', email: 'simran@gmail.com', phone: '9811122350', gender: 'Female', goal: 'Fat Loss', height: 167, weight: 63, plan: annualPlan, daysOffset: 180, status: 'ACTIVE' },
  ];

  const createdMembers = [];
  const now = new Date();

  for (let i = 0; i < memberData.length; i++) {
    const md = memberData[i];
    const user = await prisma.user.create({
      data: {
        name: md.name,
        email: md.email,
        phone: md.phone,
        passwordHash,
        role: 'MEMBER',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${md.name}`,
      },
    });

    const memberCode = `IF-${1001 + i}`;
    const referralCode = `FORGE${100 + i}`;
    
    // Calculate expiry based on daysOffset (positive means days remaining, negative means days expired)
    const expiryDate = new Date(now.getTime() + md.daysOffset * 24 * 60 * 60 * 1000);
    const startDate = new Date(expiryDate.getTime() - md.plan.durationDays * 24 * 60 * 60 * 1000);

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        memberCode,
        dob: '1995-05-15',
        gender: md.gender,
        heightCm: md.height,
        weightKg: md.weight,
        fitnessGoal: md.goal,
        emergencyName: 'Emergency Contact',
        emergencyPhone: '9876500000',
        healthNotes: i === 0 ? 'Mild lower back sensitivity on heavy deadlifts' : undefined,
        referralCode,
        status: md.status,
        currentPlanId: md.plan.id,
        currentExpiryDate: expiryDate,
        streakCurrent: i % 2 === 0 ? 5 + (i % 7) : (i % 3),
        streakLongest: 14 + i,
        lastWorkoutDate: new Date(now.getTime() - (i % 3) * 24 * 60 * 60 * 1000),
        frozenAt: md.status === 'FROZEN' ? new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) : null,
      },
    });

    createdMembers.push({ member, user, plan: md.plan, startDate, expiryDate });

    // Create Membership record
    const membership = await prisma.membership.create({
      data: {
        memberId: member.id,
        planId: md.plan.id,
        startDate,
        endDate: expiryDate,
        price: md.plan.price,
        discountAmount: i % 4 === 0 ? 500 : 0,
        finalAmount: i % 4 === 0 ? md.plan.price - 500 : md.plan.price,
        status: md.status === 'EXPIRED' ? 'EXPIRED' : md.status === 'FROZEN' ? 'FROZEN' : 'ACTIVE',
      },
    });

    // Create Payment and Invoice record
    const invoiceNum = `INV-2026-${(1000 + i).toString()}`;
    const payment = await prisma.payment.create({
      data: {
        invoiceNumber: invoiceNum,
        memberId: member.id,
        membershipId: membership.id,
        amount: membership.finalAmount,
        discount: membership.discountAmount,
        paymentMode: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'CASH' : 'CARD',
        referenceId: i % 3 === 0 ? `UPI-TXN-${992000 + i}` : undefined,
        paymentDate: startDate,
        duesRemaining: 0,
        recordedByUserId: receptionist.id,
        notes: `Membership payment for ${md.plan.name}`,
      },
    });

    await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNum,
        paymentId: payment.id,
        memberId: member.id,
        gymDetailsJson: JSON.stringify({
          name: 'IRON FORGE FITNESS',
          gstin: '29ABCDE1234F1Z5',
          address: '42, 100 Feet Road, Indiranagar, Bengaluru 560038',
          phone: '+91 98765 43210',
          email: 'contact@ironforgegym.in',
        }),
        memberDetailsJson: JSON.stringify({
          name: md.name,
          phone: md.phone,
          memberCode,
        }),
        itemsJson: JSON.stringify([
          { description: `${md.plan.name} (${md.plan.durationMonths} Month)`, amount: md.plan.price },
          ...(membership.discountAmount > 0 ? [{ description: 'Seasonal Discount', amount: -membership.discountAmount }] : []),
        ]),
        subtotal: md.plan.price,
        taxAmount: Math.round(membership.finalAmount * 0.18),
        totalAmount: membership.finalAmount,
      },
    });

    // Assign badges
    await prisma.memberBadge.create({
      data: {
        memberId: member.id,
        badgeId: createdBadges[0].id, // First workout
        awardedAt: startDate,
      },
    });
    if (member.streakCurrent >= 5) {
      await prisma.memberBadge.create({
        data: {
          memberId: member.id,
          badgeId: createdBadges[1].id, // Streak
          awardedAt: now,
        },
      });
    }

    // Seed Attendance for the last 14 days
    for (let day = 0; day < 14; day++) {
      if ((day + i) % 3 !== 0) { // realistic attendance pattern
        const attDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
        const dateStr = attDate.toISOString().split('T')[0];
        const checkInHour = 6 + (i % 4);
        attDate.setHours(checkInHour, (i * 7) % 60, 0, 0);
        const checkOut = new Date(attDate.getTime() + (65 + (i % 25)) * 60 * 1000);

        await prisma.attendance.create({
          data: {
            memberId: member.id,
            checkInTime: attDate,
            checkOutTime: checkOut,
            checkInMethod: day % 2 === 0 ? 'QR_SCAN' : 'MANUAL_STAFF',
            dateString: dateStr,
          },
        });
      }
    }
  }

  // 6. 100+ Exercise Library
  console.log('🏋️‍♂️ Seeding 100+ Exercise Library...');
  const exercisesRaw = [
    // CHEST (15)
    { name: 'Barbell Bench Press', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Triceps, Front Delts', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Lie back on a flat bench. Grip the bar slightly wider than shoulder width. Lower bar smoothly to mid-chest, then press forcefully back up to full extension.', tips: 'Keep your shoulder blades retracted and feet planted firmly on the floor.' },
    { name: 'Incline Dumbbell Press', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Front Delts, Triceps', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Set bench to 30-45 degrees. Press dumbbells up from chest level until arms are extended, lower with controlled tempo.', tips: 'Avoid flaring elbows 90 degrees; tuck them to approximately 45-60 degrees.' },
    { name: 'Decline Barbell Press', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Lower Pecs, Triceps', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Secure legs in decline bench, lower bar to lower chest, press upwards in a slight arch.', tips: 'Do not bounce the bar off ribs.' },
    { name: 'Dumbbell Flyes', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Front Delts', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Lie flat, hold dumbbells above chest with slight elbow bend. Open arms wide until chest stretches, then squeeze back up.', tips: 'Focus on hugging a wide barrel; do not turn this into a press.' },
    { name: 'Cable Crossover High-to-Low', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Lower Chest', equipment: 'Cable', difficulty: 'Intermediate', instructions: 'Set pulleys high. Step forward, pull handles down and together in front of hips.', tips: 'Keep core tight and squeeze at the bottom for 1 second.' },
    { name: 'Cable Low-to-High Fly', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Upper Chest', equipment: 'Cable', difficulty: 'Intermediate', instructions: 'Set pulleys low. Bring handles upward and together at upper chest level.', tips: 'Lead with the elbows and keep tension steady.' },
    { name: 'Push-Ups (Standard)', category: 'Bodyweight', muscleGroup: 'Chest', secondaryMuscles: 'Triceps, Core', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Plank position with hands slightly wider than shoulders. Lower chest to floor and push back up.', tips: 'Keep body in a straight line from heels to head.' },
    { name: 'Chest Dips', category: 'Bodyweight', muscleGroup: 'Chest', secondaryMuscles: 'Triceps, Shoulders', equipment: 'Bodyweight', difficulty: 'Advanced', instructions: 'Grip parallel bars, lean torso forward 30 degrees, lower down until elbows reach 90 degrees, press up.', tips: 'Leaning forward emphasizes pecs over triceps.' },
    { name: 'Machine Chest Press', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Adjust seat height so handles align with mid-chest. Press forward and return under control.', tips: 'Great for high repetition burnouts safely.' },
    { name: 'Incline Barbell Bench Press', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Upper Chest, Delts', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Set bench to 30 degrees, lower barbell to clavicle, press back up.', tips: 'Do not use excessive arching on incline.' },
    { name: 'Pec Deck Machine Fly', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Serratus Anterior', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Sit upright with forearms on pads or hands on levers. Squeeze together in front of chest.', tips: 'Hold contraction for full muscle fiber recruitment.' },
    { name: 'Close-Grip Push-Ups (Diamond)', category: 'Bodyweight', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Place thumbs and index fingers together forming a diamond. Lower chest to hands and press up.', tips: 'Intense triceps and inner chest activator.' },
    { name: 'Dumbbell Pullover', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Lats, Serratus', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Lie perpendicular across bench. Hold dumbbell with both hands, lower overhead in an arc, pull back above chest.', tips: 'Feel the stretch through the ribcage and pecs.' },
    { name: 'Smith Machine Incline Press', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Upper Chest', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Unrack Smith bar at 30-degree incline, lower to upper chest, drive upward.', tips: 'Allows focus on pure chest contraction without stabilization worries.' },
    { name: 'Floor Press with Dumbbells', category: 'Strength', muscleGroup: 'Chest', secondaryMuscles: 'Triceps', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Lie flat on floor. Press dumbbells until arms lock, lower until elbows gently touch floor.', tips: 'Safe on shoulders and excellent for lockout strength.' },

    // BACK (15)
    { name: 'Conventional Deadlift', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Glutes, Hamstrings, Forearms', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Stand with bar over midfoot. Grip bar outside knees, brace core, push floor away through heels.', tips: 'Keep bar in contact with shins and thighs throughout the pull.' },
    { name: 'Barbell Bent-Over Row', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Biceps, Rear Delts', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Hinge at hips at 45 degrees. Pull bar toward belly button, squeezing lats and upper back.', tips: 'Do not yank with lower back momentum.' },
    { name: 'Lat Pulldown (Wide Grip)', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Biceps', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Sit snug under pads. Pull bar down toward upper chest, driving elbows down and back.', tips: 'Avoid leaning back excessively.' },
    { name: 'Seated Cable Row', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Rhomboids, Biceps', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Keep torso upright with slight natural arch. Pull handle to lower abdomen, squeezing shoulder blades.', tips: 'Stretch forward on the eccentric without rounding lower back.' },
    { name: 'Single-Arm Dumbbell Row', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Biceps, Lats', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Place one knee and hand on bench. Row dumbbell up toward hip pocket.', tips: 'Think about pulling from the elbow rather than the hand.' },
    { name: 'Pull-Ups (Overhand)', category: 'Bodyweight', muscleGroup: 'Back', secondaryMuscles: 'Biceps, Core', equipment: 'Bodyweight', difficulty: 'Advanced', instructions: 'Grip pull-up bar palms facing away. Pull chest up until chin clears the bar.', tips: 'Initiate by depressing the scapulae first.' },
    { name: 'Chin-Ups (Underhand)', category: 'Bodyweight', muscleGroup: 'Back', secondaryMuscles: 'Biceps Heavy', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Grip bar with palms facing you. Pull up to bar with high bicep and lat engagement.', tips: 'Full range of motion: dead hang to chest near bar.' },
    { name: 'T-Bar Row', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Traps, Rhomboids', equipment: 'Machine', difficulty: 'Intermediate', instructions: 'Straddle bar, brace chest or stay hinged, pull handles toward chest.', tips: 'Great mass builder for middle back thickness.' },
    { name: 'Straight-Arm Cable Pulldown', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Triceps Long Head', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Stand tall with slight hip hinge. With arms extended, push bar down to thighs using lats.', tips: 'Isolates the lats without involving biceps.' },
    { name: 'Hyperextensions (Back Extensions)', category: 'Bodyweight', muscleGroup: 'Back', secondaryMuscles: 'Hamstrings, Glutes', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Set hip pad below waist. Lower torso forward, contract glutes and spinal erectors to return.', tips: 'Do not hyperextend past neutral spine at the top.' },
    { name: 'Rack Pulls', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Traps, Erector Spinae', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Set barbell on power rack pins just below knee height. Pull to lockout.', tips: 'Focus on upper back and trap thickness with heavy loads.' },
    { name: 'Face Pulls', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Rear Delts, Rotator Cuff', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Attach rope to high pulley. Pull towards forehead, rotating thumbs backwards.', tips: 'Crucial exercise for shoulder health and posture.' },
    { name: 'Barbell Shrugs', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Upper Traps', equipment: 'Barbell', difficulty: 'Beginner', instructions: 'Hold barbell at thighs, elevate shoulders straight up toward ears, hold and release.', tips: 'Do not roll shoulders; move straight up and down.' },
    { name: 'Dumbbell Incline Chest-Supported Row', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Mid Back', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Lie face down on 45-degree bench. Row dumbbells up, pinching shoulder blades together.', tips: 'Eliminates cheating and spares the lower back.' },
    { name: 'Neutral-Grip Lat Pulldown', category: 'Strength', muscleGroup: 'Back', secondaryMuscles: 'Lats, Brachialis', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Use V-bar handle. Pull down to collarbone emphasizing lower lats.', tips: 'Keep elbows tucked tightly to sides.' },

    // LEGS & LOWER BODY (18)
    { name: 'Barbell Back Squat', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Glutes, Core, Lower Back', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Rest bar on upper traps. Descend by bending knees and hips until thighs are parallel to ground, drive up.', tips: 'Knees track in line with toes, chest upright.' },
    { name: 'Front Squat', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quads Heavy, Core', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Rest bar on anterior deltoids in front rack position. Squat deep keeping torso upright.', tips: 'High quad emphasis and less spinal shear.' },
    { name: 'Romanian Deadlift (RDL)', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Hamstrings, Glutes, Erector Spinae', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Hold bar at thighs. Push hips backwards with slight knee bend until deep hamstring stretch, thrust hips forward.', tips: 'Hips go backward, not down. Feel the hamstring tension.' },
    { name: 'Leg Press 45-Degree', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quads, Glutes', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Place feet shoulder-width on sled. Lower sled until knees hit 90 degrees, press through whole foot.', tips: 'Do not lock out knees violently at top.' },
    { name: 'Walking Dumbbell Lunges', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quads, Glutes, Calves', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Hold dumbbells by sides. Step forward into lunge until back knee nearly touches floor, alternate legs.', tips: 'Keep torso upright and step far enough for 90-degree angles.' },
    { name: 'Bulgarian Split Squat', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quads, Glutes Balance', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Rear foot elevated on a bench behind you. Lower hips until front thigh is parallel, push back up.', tips: 'One of the most potent single-leg builders.' },
    { name: 'Leg Extension Machine', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quad Peak', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Align knee joint with machine pivot. Extend legs until straight, squeeze quads for 1 second, lower slowly.', tips: 'Control the descent; do not let weights slam.' },
    { name: 'Lying Leg Curl Machine', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Hamstrings Isolation', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Lie face down with pad behind ankles. Curl heels toward glutes, pause, lower slowly.', tips: 'Keep hips pinned down against the pad.' },
    { name: 'Seated Leg Curl Machine', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Hamstrings', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Lock lap pad down. Flex knees to pull heel pad underneath chair.', tips: 'Seated position places hamstrings in a lengthened stretch.' },
    { name: 'Standing Calf Raise', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Gastrocnemius', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Balls of feet on block, lower heels into deep stretch, drive onto tiptoes and hold peak.', tips: 'Full stretch at bottom, pause 2 seconds to eliminate bounce.' },
    { name: 'Seated Calf Raise', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Soleus', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Pads on lower thighs. Lower heels down, raise up on toes and hold.', tips: 'Targets the soleus muscle underneath the calf.' },
    { name: 'Barbell Hip Thrust', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Glute Max, Hamstrings', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Upper back against bench, barbell across hips with pad. Drive hips up toward ceiling until tabletop.', tips: 'Chin tucked forward, squeeze glutes hard at top.' },
    { name: 'Goblet Squat', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quads, Core', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Hold dumbbell vertically against chest. Squat down with elbows tracking inside knees.', tips: 'Fantastic beginner pattern to master squat depth.' },
    { name: 'Hack Squat Machine', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Quads', equipment: 'Machine', difficulty: 'Intermediate', instructions: 'Shoulders against pads, back flat on board. Squat down to parallel, press platform away.', tips: 'Great quad isolation with guided spine support.' },
    { name: 'Sumo Deadlift', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Adductors, Glutes, Quads', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Wide stance with toes angled out. Grip inside legs, keep torso upright, drive floor away.', tips: 'Spread the floor with your feet to activate hips.' },
    { name: 'Step-Ups with Dumbbells', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Glutes, Quads', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Step onto a 18-24 inch box, drive through leading heel to stand, lower back down under control.', tips: 'Minimize push-off from the trailing back foot.' },
    { name: 'Sissy Squat (Machine/Free)', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Rectus Femoris', equipment: 'Bodyweight', difficulty: 'Advanced', instructions: 'Lock calves into pad, lean backward while bending knees, return upright.', tips: 'Extreme stretch on the anterior quads.' },
    { name: 'Good Mornings', category: 'Strength', muscleGroup: 'Legs', secondaryMuscles: 'Hamstrings, Glutes, Lower Back', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Barbell on upper back. Hinge forward at hips keeping back flat, return upright.', tips: 'Use light weight and maintain micro-knee bend.' },

    // SHOULDERS & DELTS (15)
    { name: 'Overhead Barbell Military Press', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Triceps, Upper Chest, Core', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Stand tall with bar at collarbone. Press bar overhead in a straight line, locking arms.', tips: 'Squeeze glutes and abs to avoid excessive lumbar hyperextension.' },
    { name: 'Seated Dumbbell Shoulder Press', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Triceps, Deltoids', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Sit on upright bench. Press dumbbells from ear level overhead until they tap gently.', tips: 'Keep elbows slightly in front of the coronal plane.' },
    { name: 'Dumbbell Lateral Raise', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Lateral Deltoid Isolation', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Stand with dumbbells at sides. Raise arms out to parallel with palms facing down.', tips: 'Lead with elbows and pour a glass of water at the top.' },
    { name: 'Cable Lateral Raise', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Side Delts', equipment: 'Cable', difficulty: 'Intermediate', instructions: 'Set cable to hip height, raise hand away from body across torso to shoulder height.', tips: 'Provides constant mechanical tension throughout the entire arc.' },
    { name: 'Bent-Over Rear Delt Flyes', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Rear Delts, Rhomboids', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Hinge forward at waist. Fly dumbbells outward keeping arms nearly straight.', tips: 'Pull with the rear shoulders, not traps.' },
    { name: 'Arnold Press', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Front and Side Delts', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Start with dumbbells at chin palms facing you. Rotate outward while pressing up.', tips: 'Smooth continuous rotational movement.' },
    { name: 'Barbell Upright Row', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Side Delts, Traps', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Grip bar shoulder width. Pull bar straight up chest height leading with elbows.', tips: 'Do not use excessively narrow grip to protect wrists.' },
    { name: 'Front Dumbbell Raise', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Anterior Deltoid', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Raise dumbbells one by one or together to eye level in front of you.', tips: 'Avoid swinging hips for momentum.' },
    { name: 'Reverse Pec Deck Fly', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Rear Delts', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Sit facing the machine. Sweep arms back into a horizontal T-position.', tips: 'Lock elbows with a slight bend and focus on rear delt pinch.' },
    { name: 'Push Press', category: 'Olympic', muscleGroup: 'Shoulders', secondaryMuscles: 'Full Body, Triceps', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Dip knees slightly and use leg explosion to drive heavy barbell overhead.', tips: 'Combines lower body power with upper body lockout.' },
    { name: 'Landmine Shoulder Press', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Serratus, Triceps', equipment: 'Barbell', difficulty: 'Beginner', instructions: 'Place one end of barbell in landmine anchor. Press other end up at 45 degrees.', tips: 'Very shoulder-friendly pressing plane.' },
    { name: 'Single-Arm Cable Front Raise', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Front Delts', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Low pulley between legs, raise cable straight out ahead to shoulder level.', tips: 'Smooth tension throughout.' },
    { name: 'Dumbbell Shrugs (Seated or Standing)', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Upper Traps', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Hold heavy dumbbells at sides, shrug straight up, pause for a count of 2.', tips: 'Heavy controlled holds generate great trap growth.' },
    { name: 'Pike Push-Ups', category: 'Bodyweight', muscleGroup: 'Shoulders', secondaryMuscles: 'Triceps', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Hips high in downward dog shape. Lower crown of head toward floor, press back.', tips: 'Great bodyweight overhead pressing alternative.' },
    { name: 'Behind-the-Neck Barbell Press', category: 'Strength', muscleGroup: 'Shoulders', secondaryMuscles: 'Lateral Delts', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Carefully lower bar behind head to ear level, press up. For mobile lifters only.', tips: 'Only perform if you have adequate shoulder external mobility.' },

    // ARMS (BICEPS, TRICEPS, FOREARMS) (18)
    { name: 'Barbell Bicep Curl', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Forearms', equipment: 'Barbell', difficulty: 'Beginner', instructions: 'Stand tall with supinated grip on bar. Curl weight toward shoulders without swinging elbows.', tips: 'Keep upper arms glued to sides.' },
    { name: 'Incline Dumbbell Curl', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Biceps Long Head', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Lie back on 60-degree incline. Curl dumbbells up, feeling maximal stretch at bottom.', tips: 'Long head stretch creates great peak.' },
    { name: 'Hammer Curls', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Brachialis, Brachioradialis', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Hold dumbbells with neutral grip (palms facing each other). Curl up toward shoulders.', tips: 'Builds arm thickness and forearm size.' },
    { name: 'Preacher Curl (EZ Bar)', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Biceps Short Head', equipment: 'Barbell', difficulty: 'Beginner', instructions: 'Armpits over preacher pad. Lower bar until arms are near extended, curl back up.', tips: 'Avoid hyperextending elbows at the bottom.' },
    { name: 'Concentration Curls', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Bicep Peak', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Sit on bench, brace elbow against inner thigh, curl dumbbell toward face.', tips: 'Strictly isolate the bicep without any shoulder contribution.' },
    { name: 'Cable Rope Bicep Curl', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Biceps, Forearms', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Attach rope to low pulley. Curl up and spread ends of rope apart at the top.', tips: 'Constant tension through the full range.' },
    { name: 'Overhead Cable Bicep Curl (High Pulleys)', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Biceps Peak', equipment: 'Cable', difficulty: 'Intermediate', instructions: 'Stand between high cable towers holding single handles. Curl handles toward ears.', tips: 'Looks like a front double bicep bodybuilding pose.' },
    { name: 'Tricep Rope Pushdown', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Lateral Tricep Head', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Hold rope at chest height. Push down until arms lock, flaring rope ends outward.', tips: 'Lock elbows in place against ribs.' },
    { name: 'Skull Crushers (Lying EZ Bar Extension)', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Long Head Triceps', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Lie on bench holding bar above chest. Bend elbows to lower bar toward forehead, extend back up.', tips: 'Lower to the crown of head or behind bench for a safer stretch.' },
    { name: 'Close-Grip Barbell Bench Press', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Triceps Mass, Inner Pecs', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Grip bar with hands shoulder-width apart. Lower to sternum, press explosively.', tips: 'Keep elbows tucked tightly to ribs.' },
    { name: 'Overhead Dumbbell Tricep Extension', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Triceps Long Head', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Hold dumbbell vertically overhead with two hands. Lower behind neck and press up.', tips: 'Deep stretch on the long head of the triceps.' },
    { name: 'Dip Machine / Bench Dips', category: 'Bodyweight', muscleGroup: 'Arms', secondaryMuscles: 'Triceps, Front Delts', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Hands on bench or dip handles, lower hips by bending elbows to 90 degrees, press up.', tips: 'Keep back close to the bench to avoid shoulder impingement.' },
    { name: 'Cable Overhead Tricep Extension with Rope', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Triceps Long Head', equipment: 'Cable', difficulty: 'Intermediate', instructions: 'Face away from high cable pulley, extend arms forward and overhead.', tips: 'Keep upper arms stable and let elbows do the hinging.' },
    { name: 'Barbell Wrist Curls', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Forearm Flexors', equipment: 'Barbell', difficulty: 'Beginner', instructions: 'Forearms resting on thighs with wrists hanging over knees. Curl bar with wrists.', tips: 'Direct grip and forearm thickness builder.' },
    { name: 'Reverse Barbell Curl', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Brachioradialis, Forearm Extensors', equipment: 'Barbell', difficulty: 'Beginner', instructions: 'Overhand grip on barbell. Curl bar upward towards chest.', tips: 'Builds impressive upper forearm mass.' },
    { name: 'Farmer\'s Walk', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Grip, Traps, Core', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Pick up two heavy dumbbells or kettlebells. Walk with tall posture for distance/time.', tips: 'Brace core and do not let weights swing.' },
    { name: 'Single-Arm Cable Tricep Kickback', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Triceps', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Lean forward with cable handle. Straighten arm behind you until locked.', tips: 'Avoid shoulder movement; pure elbow extension.' },
    { name: 'Spider Curls', category: 'Strength', muscleGroup: 'Arms', secondaryMuscles: 'Biceps Short Head', equipment: 'Barbell', difficulty: 'Intermediate', instructions: 'Lie face down on 45-degree incline bench with arms hanging vertically. Curl bar up.', tips: 'Strict bicep isolation with no body momentum possible.' },

    // CORE & ABS (12)
    { name: 'Hanging Leg Raises', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Hip Flexors, Grip', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Hang from pull-up bar. Keeping legs as straight as possible, raise feet to bar level.', tips: 'Tilt pelvis backward to engage lower abs rather than just hip flexors.' },
    { name: 'Cable Woodchopper', category: 'Strength', muscleGroup: 'Core', secondaryMuscles: 'Obliques', equipment: 'Cable', difficulty: 'Beginner', instructions: 'High cable position. Pull handle diagonally across body down to opposite hip with torso rotation.', tips: 'Pivot on back foot and control the return.' },
    { name: 'Ab Wheel Rollout', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Lats, Shoulders', equipment: 'Bodyweight', difficulty: 'Advanced', instructions: 'Kneel on mat holding ab wheel. Roll wheel forward until body is near horizontal, pull back.', tips: 'Maintain a slightly rounded upper back to protect lumbar spine.' },
    { name: 'Standard Plank', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Full Core, Glutes', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Forearms on ground, body in rigid straight line. Squeeze glutes and brace core for time.', tips: 'Do not let hips sag or rise into a pyramid.' },
    { name: 'Russian Twists with Weight Plate', category: 'Strength', muscleGroup: 'Core', secondaryMuscles: 'Obliques', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Sit on floor with knees bent and feet elevated. Rotate weight plate from side to side.', tips: 'Rotate through thoracic spine, not just moving arms.' },
    { name: 'Decline Bench Sit-Ups', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Upper Abs', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Lock shins into decline bench. Perform controlled sit-ups curling spine vertebra by vertebra.', tips: 'Add a weight plate against chest for added overload.' },
    { name: 'Side Plank', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Obliques, QL', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Lie on side supported by forearm. Lift hips to form straight line, hold for time.', tips: 'Keep neck neutral and top hip stacked directly above bottom hip.' },
    { name: 'Cable Rope Crunch', category: 'Strength', muscleGroup: 'Core', secondaryMuscles: 'Rectus Abdominis', equipment: 'Cable', difficulty: 'Beginner', instructions: 'Kneel holding rope beside head. Crunch ribcage down toward pelvis.', tips: 'Do not sit back onto heels; isolate the abdominal spine flex.' },
    { name: 'Dead Bug', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Deep Core Stabilizers', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Lie on back with arms up and knees at 90 degrees. Lower opposite arm and leg while keeping lower back flat.', tips: 'Lower back must remain glued to floor at all times.' },
    { name: 'Bicycle Crunches', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Obliques, Rectus Abdominis', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Lie on back, bring opposite elbow to knee while extending other leg, alternate.', tips: 'Slow and deliberate cadence beats fast chaotic thrashing.' },
    { name: 'Dragon Flag', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Whole Core, Lats', equipment: 'Bodyweight', difficulty: 'Advanced', instructions: 'Lie on bench gripping top edges. Lift entire body on shoulders and lower down in a rigid line.', tips: 'Legendary core exercise popularized by Bruce Lee.' },
    { name: 'Captain\'s Chair Knee Raise', category: 'Bodyweight', muscleGroup: 'Core', secondaryMuscles: 'Lower Abs', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Support forearms on tower pads. Raise knees toward chest, pause, lower slowly.', tips: 'Curl the tailbone upward at the top of the stroke.' },

    // CARDIO & FULL BODY (12)
    { name: 'Treadmill Incline Walk', category: 'Cardio', muscleGroup: 'Full Body', secondaryMuscles: 'Calves, Glutes', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Set speed to 4.5-5.5 km/h and incline to 10-15%. Walk with steady rhythm without holding handrails.', tips: 'Terrific low-impact fat-burning protocol that preserves muscle mass.' },
    { name: 'Rowing Machine (Ergometer)', category: 'Cardio', muscleGroup: 'Full Body', secondaryMuscles: 'Back, Legs, Core', equipment: 'Machine', difficulty: 'Intermediate', instructions: 'Drive with legs, lean slightly back, pull handle to lower ribs. Reverse smoothly.', tips: 'Power comes 60% legs, 20% core, 20% arms.' },
    { name: 'Assault / Air Bike Sprints', category: 'Cardio', muscleGroup: 'Full Body', secondaryMuscles: 'Full Body Endurance', equipment: 'Machine', difficulty: 'Advanced', instructions: 'Pedal and push/pull handles with maximum intensity in intervals (e.g. 20s sprint, 40s rest).', tips: 'Brutal calorie burner and VO2 max builder.' },
    { name: 'Kettlebell Swings', category: 'Strength', muscleGroup: 'Full Body', secondaryMuscles: 'Hamstrings, Glutes, Core', equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: 'Hinge back with kettlebell between thighs. Thrust hips explosively to swing bell to eye height.', tips: 'This is a hip hinge, not a squat. Snap hips forcefully.' },
    { name: 'Burpees', category: 'Cardio', muscleGroup: 'Full Body', secondaryMuscles: 'Chest, Quads, Core', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Drop into push-up, press up, jump feet forward and jump up with hands overhead.', tips: 'Pace yourself consistently through timed rounds.' },
    { name: 'Jump Rope / Skipping', category: 'Cardio', muscleGroup: 'Full Body', secondaryMuscles: 'Calves, Coordination', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Turn rope with wrists, stay light on balls of feet with minimal knee bend.', tips: 'Low bounce just clearing the rope ensures longevity.' },
    { name: 'Box Jumps', category: 'Olympic', muscleGroup: 'Full Body', secondaryMuscles: 'Quads, Calves, Glutes', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: 'Swing arms and jump onto plyo box landing softly in quarter squat, step down.', tips: 'Always step down instead of jumping down to protect Achilles tendon.' },
    { name: 'Battle Ropes', category: 'Cardio', muscleGroup: 'Full Body', secondaryMuscles: 'Shoulders, Core, Forearms', equipment: 'Bodyweight', difficulty: 'Beginner', instructions: 'Grip rope ends, alternate arms making continuous fluid waves into the anchor point.', tips: 'Stay in a sturdy quarter squat athletic base.' },
    { name: 'Stair Climber / StairMaster', category: 'Cardio', muscleGroup: 'Legs', secondaryMuscles: 'Glutes, Quads', equipment: 'Machine', difficulty: 'Beginner', instructions: 'Climb stairs at steady rhythm. Keep chest upright and feet fully on the steps.', tips: 'Do not lean onto the console; keep self-supported.' },
    { name: 'Medicine Ball Slams', category: 'Strength', muscleGroup: 'Full Body', secondaryMuscles: 'Lats, Core, Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: 'Lift non-bouncing slam ball overhead, slam forcefully into floor between feet, catch and repeat.', tips: 'Use entire body flexion and hip snap for maximum power.' },
    { name: 'Barbell Clean and Press', category: 'Olympic', muscleGroup: 'Full Body', secondaryMuscles: 'Full Posterior Chain, Shoulders', equipment: 'Barbell', difficulty: 'Advanced', instructions: 'Pull bar from floor, clean to shoulders, press overhead in one fluid athletic sequence.', tips: 'Superb compound developer of athletic power.' },
    { name: 'Sled Push (Prowler)', category: 'Strength', muscleGroup: 'Full Body', secondaryMuscles: 'Quads, Calves, Conditioning', equipment: 'Machine', difficulty: 'Intermediate', instructions: 'Grip sled poles, lean at 45 degrees, drive through balls of feet down the turf track.', tips: 'Incredible functional leg drive with zero eccentric soreness.' },
  ];

  const createdExercises = [];
  for (const ex of exercisesRaw) {
    const created = await prisma.exercise.create({
      data: {
        name: ex.name,
        category: ex.category,
        muscleGroup: ex.muscleGroup,
        secondaryMuscles: ex.secondaryMuscles,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        instructions: ex.instructions,
        tips: ex.tips,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    });
    createdExercises.push(created);
  }
  console.log(`✅ Seeded ${createdExercises.length} Exercises`);

  // 7. 50+ Indian Foods Database
  console.log('🍛 Seeding Indian Foods Database...');
  const indianFoods = [
    { name: 'Paneer (Raw / Cottage Cheese)', hindiName: 'पनीर', category: 'Dairy', servingSize: '100g', calories: 265, protein: 18.3, carbs: 3.5, fat: 20.8, fiber: 0 },
    { name: 'Tofu (Firm)', hindiName: 'सोया पनीर', category: 'Vegetables', servingSize: '100g', calories: 144, protein: 15.5, carbs: 2.8, fat: 8.7, fiber: 1.2 },
    { name: 'Roti (Whole Wheat Chapati)', hindiName: 'गेहूं की रोटी', category: 'Grains', servingSize: '1 medium (35g)', calories: 104, protein: 3.2, carbs: 20.5, fat: 0.8, fiber: 3.0 },
    { name: 'White Rice (Cooked)', hindiName: 'सफेद चावल', category: 'Grains', servingSize: '1 cup (150g)', calories: 195, protein: 4.1, carbs: 43.0, fat: 0.4, fiber: 0.6 },
    { name: 'Brown Rice (Cooked)', hindiName: 'ब्राउन राइस', category: 'Grains', servingSize: '1 cup (150g)', calories: 168, protein: 3.8, carbs: 35.5, fat: 1.5, fiber: 2.8 },
    { name: 'Yellow Moong Dal (Cooked)', hindiName: 'मूंग दाल', category: 'Dal & Legumes', servingSize: '1 bowl (150g)', calories: 145, protein: 9.2, carbs: 22.0, fat: 2.1, fiber: 4.5 },
    { name: 'Toor / Arhar Dal (Cooked)', hindiName: 'अरहर / तूर दाल', category: 'Dal & Legumes', servingSize: '1 bowl (150g)', calories: 150, protein: 8.5, carbs: 24.0, fat: 2.3, fiber: 5.0 },
    { name: 'Rajma / Kidney Beans (Cooked)', hindiName: 'राजमा', category: 'Dal & Legumes', servingSize: '1 bowl (150g)', calories: 185, protein: 11.2, carbs: 30.5, fat: 1.2, fiber: 8.0 },
    { name: 'Chole / Chickpeas Curry', hindiName: 'चना / छोले', category: 'Dal & Legumes', servingSize: '1 bowl (150g)', calories: 210, protein: 10.5, carbs: 32.0, fat: 4.8, fiber: 7.5 },
    { name: 'Black Chana (Boiled)', hindiName: 'काला चना', category: 'Dal & Legumes', servingSize: '1 cup (100g)', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
    { name: 'Chicken Breast (Boneless, Cooked)', hindiName: 'चिकन ब्रेस्ट', category: 'Poultry', servingSize: '100g', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
    { name: 'Egg (Whole, Boiled)', hindiName: 'उबला अंडा', category: 'Poultry', servingSize: '1 large (50g)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
    { name: 'Egg Whites (Boiled)', hindiName: 'अंडे की सफेदी', category: 'Poultry', servingSize: '1 large white (33g)', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0 },
    { name: 'Chicken Curry (Home Style)', hindiName: 'चिकन करी', category: 'Poultry', servingSize: '1 bowl (180g)', calories: 260, protein: 24.5, carbs: 6.0, fat: 14.5, fiber: 1.5 },
    { name: 'Mutton Curry (Home Style)', hindiName: 'मटन करी', category: 'Meat', servingSize: '1 bowl (180g)', calories: 340, protein: 26.0, carbs: 5.0, fat: 23.0, fiber: 1.0 },
    { name: 'Fish Curry (Rohu / Katla)', hindiName: 'मछली करी', category: 'Meat', servingSize: '1 bowl (150g)', calories: 210, protein: 22.0, carbs: 4.5, fat: 11.0, fiber: 1.0 },
    { name: 'Curd / Dahi (Plain Whole Milk)', hindiName: 'दही', category: 'Dairy', servingSize: '1 bowl (150g)', calories: 140, protein: 5.8, carbs: 7.0, fat: 9.5, fiber: 0 },
    { name: 'Greek Yogurt (Plain, Low Fat)', hindiName: 'ग्रीक योगर्ट', category: 'Dairy', servingSize: '100g', calories: 75, protein: 10.0, carbs: 4.0, fat: 2.0, fiber: 0 },
    { name: 'Whey Protein (Standard Scoop)', hindiName: 'व्हे प्रोटीन', category: 'Supplements', servingSize: '1 scoop (33g)', calories: 130, protein: 25.0, carbs: 3.0, fat: 1.5, fiber: 0 },
    { name: 'Sattu Powder (Roasted Gram Flour)', hindiName: 'सत्तू', category: 'Dal & Legumes', servingSize: '50g (3 tbsp)', calories: 205, protein: 12.8, carbs: 32.0, fat: 2.5, fiber: 8.5 },
    { name: 'Oats (Rolled / Instant, Raw)', hindiName: 'ओट्स', category: 'Grains', servingSize: '50g', calories: 190, protein: 6.5, carbs: 33.0, fat: 3.5, fiber: 5.0 },
    { name: 'Idli (Steamed)', hindiName: 'इडली', category: 'Grains', servingSize: '2 medium (80g)', calories: 135, protein: 4.2, carbs: 28.0, fat: 0.5, fiber: 2.0 },
    { name: 'Plain Dosa', hindiName: 'डोसा', category: 'Grains', servingSize: '1 medium (90g)', calories: 175, protein: 3.8, carbs: 30.0, fat: 4.5, fiber: 1.8 },
    { name: 'Sambar', hindiName: 'सांभर', category: 'Dal & Legumes', servingSize: '1 bowl (150g)', calories: 110, protein: 4.5, carbs: 18.0, fat: 2.5, fiber: 3.5 },
    { name: 'Upma (Semolina/Rava)', hindiName: 'उपमा', category: 'Grains', servingSize: '1 bowl (150g)', calories: 220, protein: 4.8, carbs: 36.0, fat: 6.5, fiber: 2.5 },
    { name: 'Poha (Flattened Rice with Peanuts)', hindiName: 'पोहा', category: 'Grains', servingSize: '1 bowl (150g)', calories: 245, protein: 5.2, carbs: 42.0, fat: 7.0, fiber: 3.0 },
    { name: 'Sprouted Moong Salad', hindiName: 'अंकुरित मूंग सलाद', category: 'Dal & Legumes', servingSize: '1 bowl (120g)', calories: 125, protein: 9.0, carbs: 20.0, fat: 1.2, fiber: 6.0 },
    { name: 'Almonds (Badam)', hindiName: 'बादाम', category: 'Snacks', servingSize: '15 nuts (18g)', calories: 105, protein: 4.0, carbs: 3.8, fat: 9.0, fiber: 2.2 },
    { name: 'Peanut Butter (Unsweetened)', hindiName: 'पीनट बटर', category: 'Snacks', servingSize: '1 tbsp (32g)', calories: 190, protein: 8.0, carbs: 6.0, fat: 16.0, fiber: 2.0 },
    { name: 'Banana', hindiName: 'केला', category: 'Fruits', servingSize: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, fiber: 3.1 },
    { name: 'Apple', hindiName: 'सेब', category: 'Fruits', servingSize: '1 medium (150g)', calories: 80, protein: 0.4, carbs: 21.0, fat: 0.3, fiber: 4.0 },
    { name: 'Papaya', hindiName: 'पपीता', category: 'Fruits', servingSize: '1 bowl (150g)', calories: 60, protein: 0.9, carbs: 15.0, fat: 0.4, fiber: 2.8 },
    { name: 'Sweet Potato (Boiled)', hindiName: 'शकरकंद', category: 'Vegetables', servingSize: '1 medium (130g)', calories: 112, protein: 2.0, carbs: 26.0, fat: 0.2, fiber: 3.9 },
    { name: 'Palak Paneer', hindiName: 'पालक पनीर', category: 'Dairy', servingSize: '1 bowl (180g)', calories: 240, protein: 13.5, carbs: 8.0, fat: 17.0, fiber: 4.0 },
    { name: 'Aloo Paratha (with Ghee)', hindiName: 'आलू पराठा', category: 'Grains', servingSize: '1 medium (120g)', calories: 290, protein: 6.0, carbs: 45.0, fat: 10.0, fiber: 4.5 },
    { name: 'Paneer Bhurji', hindiName: 'पनीर भुर्जी', category: 'Dairy', servingSize: '1 bowl (150g)', calories: 280, protein: 17.0, carbs: 6.5, fat: 21.0, fiber: 2.0 },
    { name: 'Soy Chunks / Nutrela (Cooked)', hindiName: 'सोयाबीन बड़ी', category: 'Dal & Legumes', servingSize: '50g dry (yields 150g)', calories: 170, protein: 26.0, carbs: 16.5, fat: 0.5, fiber: 6.5 },
    { name: 'Lassi (Sweet)', hindiName: 'मीठी लस्सी', category: 'Dairy', servingSize: '1 glass (250ml)', calories: 210, protein: 6.5, carbs: 32.0, fat: 6.5, fiber: 0 },
    { name: 'Chaas / Buttermilk (Salted Spiced)', hindiName: 'मसाला छाछ', category: 'Dairy', servingSize: '1 glass (250ml)', calories: 55, protein: 3.5, carbs: 5.0, fat: 2.0, fiber: 0 },
    { name: 'Coconut Water (Fresh)', hindiName: 'नारियल पानी', category: 'Fruits', servingSize: '1 glass (240ml)', calories: 45, protein: 1.5, carbs: 9.0, fat: 0.5, fiber: 2.5 },
  ];

  for (const f of indianFoods) {
    await prisma.food.create({ data: f });
  }
  console.log(`✅ Seeded ${indianFoods.length} Indian foods`);

  // 8. Pre-built Workout Programs
  console.log('📋 Seeding Pre-built Workout Programs...');
  const pplPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Push / Pull / Legs (PPL) Hypertrophy',
      description: 'The golden standard 6-day or 3-day split engineered for balanced muscle hypertrophy and strength progression.',
      difficulty: 'Intermediate',
      daysPerWeek: 6,
      targetGoal: 'Muscle Gain',
      isTemplate: true,
      createdByUserId: owner.id,
    },
  });

  await prisma.planDay.createMany({
    data: [
      {
        planId: pplPlan.id,
        dayNumber: 1,
        dayName: 'Day 1: Push (Chest, Shoulders & Triceps)',
        focus: 'Push',
        exercisesJson: JSON.stringify([
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rpe: 8, restSecs: 120 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rpe: 8, restSecs: 90 },
          { name: 'Overhead Barbell Military Press', sets: 3, reps: '8-10', rpe: 8, restSecs: 90 },
          { name: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', rpe: 9, restSecs: 60 },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rpe: 9, restSecs: 60 },
        ]),
      },
      {
        planId: pplPlan.id,
        dayNumber: 2,
        dayName: 'Day 2: Pull (Back, Rear Delts & Biceps)',
        focus: 'Pull',
        exercisesJson: JSON.stringify([
          { name: 'Conventional Deadlift', sets: 3, reps: '5-6', rpe: 8.5, restSecs: 180 },
          { name: 'Lat Pulldown (Wide Grip)', sets: 4, reps: '10-12', rpe: 8, restSecs: 90 },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rpe: 8, restSecs: 90 },
          { name: 'Face Pulls', sets: 3, reps: '15-20', rpe: 8.5, restSecs: 60 },
          { name: 'Barbell Bicep Curl', sets: 3, reps: '10-12', rpe: 8.5, restSecs: 60 },
          { name: 'Hammer Curls', sets: 3, reps: '12-15', rpe: 9, restSecs: 60 },
        ]),
      },
      {
        planId: pplPlan.id,
        dayNumber: 3,
        dayName: 'Day 3: Legs & Abs (Quads, Hamstrings & Core)',
        focus: 'Legs',
        exercisesJson: JSON.stringify([
          { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 8, restSecs: 150 },
          { name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', rpe: 8, restSecs: 120 },
          { name: 'Leg Press 45-Degree', sets: 3, reps: '12-15', rpe: 8.5, restSecs: 90 },
          { name: 'Lying Leg Curl Machine', sets: 3, reps: '12-15', rpe: 9, restSecs: 60 },
          { name: 'Standing Calf Raise', sets: 4, reps: '15-20', rpe: 9, restSecs: 60 },
          { name: 'Hanging Leg Raises', sets: 3, reps: '12-15', rpe: 8, restSecs: 60 },
        ]),
      },
    ],
  });

  const fullBodyPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Full Body 3-Day Blast',
      description: 'Maximum efficiency full-body stimulation 3 days per week. Ideal for busy working professionals and beginners.',
      difficulty: 'Beginner',
      daysPerWeek: 3,
      targetGoal: 'General Fitness',
      isTemplate: true,
      createdByUserId: trainer1.id,
    },
  });

  await prisma.planDay.createMany({
    data: [
      {
        planId: fullBodyPlan.id,
        dayNumber: 1,
        dayName: 'Day 1: Full Body Foundation A',
        focus: 'Full Body',
        exercisesJson: JSON.stringify([
          { name: 'Barbell Back Squat', sets: 3, reps: '8-10', rpe: 7.5, restSecs: 120 },
          { name: 'Barbell Bench Press', sets: 3, reps: '8-10', rpe: 7.5, restSecs: 120 },
          { name: 'Lat Pulldown (Wide Grip)', sets: 3, reps: '10-12', rpe: 7.5, restSecs: 90 },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', rpe: 8, restSecs: 60 },
          { name: 'Plank', sets: 3, reps: '45s hold', rpe: 8, restSecs: 60 },
        ]),
      },
      {
        planId: fullBodyPlan.id,
        dayNumber: 2,
        dayName: 'Day 2: Full Body Foundation B',
        focus: 'Full Body',
        exercisesJson: JSON.stringify([
          { name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', rpe: 7.5, restSecs: 120 },
          { name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10-12', rpe: 8, restSecs: 90 },
          { name: 'Single-Arm Dumbbell Row', sets: 3, reps: '10-12', rpe: 8, restSecs: 90 },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rpe: 8, restSecs: 60 },
          { name: 'Hammer Curls', sets: 3, reps: '12-15', rpe: 8, restSecs: 60 },
        ]),
      },
    ],
  });

  // Assign PPL plan to Arjun Mehta (Member 0)
  await prisma.planAssignment.create({
    data: {
      planId: pplPlan.id,
      memberId: createdMembers[0].member.id,
      assignedByUserId: trainer1.id,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // 9. Workouts, Sets & PRs for Arjun Mehta
  console.log('⚡ Seeding Workout History & PRs for demo member Arjun Mehta...');
  const benchExercise = createdExercises.find(e => e.name === 'Barbell Bench Press')!;
  const squatExercise = createdExercises.find(e => e.name === 'Barbell Back Squat')!;
  const deadliftExercise = createdExercises.find(e => e.name === 'Conventional Deadlift')!;

  const workout1 = await prisma.workout.create({
    data: {
      memberId: createdMembers[0].member.id,
      planId: pplPlan.id,
      name: 'Push Day - Heavy Bench',
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 65 * 60 * 1000),
      durationSeconds: 3900,
      totalVolumeKg: 7850,
      notes: 'Felt explosive on bench today! Hit new 100kg PR.',
      feelingRating: 5,
      isCompleted: true,
      syncedOffline: false,
    },
  });

  // Sets for workout 1
  await prisma.workoutSet.createMany({
    data: [
      { workoutId: workout1.id, exerciseId: benchExercise.id, setNumber: 1, reps: 10, weightKg: 60, isWarmup: true, isCompleted: true },
      { workoutId: workout1.id, exerciseId: benchExercise.id, setNumber: 2, reps: 8, weightKg: 80, rpe: 7.5, isCompleted: true },
      { workoutId: workout1.id, exerciseId: benchExercise.id, setNumber: 3, reps: 6, weightKg: 95, rpe: 8.5, isCompleted: true },
      { workoutId: workout1.id, exerciseId: benchExercise.id, setNumber: 4, reps: 3, weightKg: 100, rpe: 9.5, isCompleted: true },
    ],
  });

  // Seed Personal Records
  await prisma.personalRecord.createMany({
    data: [
      {
        memberId: createdMembers[0].member.id,
        exerciseId: benchExercise.id,
        recordType: 'MAX_WEIGHT',
        value: 100,
        workoutId: workout1.id,
      },
      {
        memberId: createdMembers[0].member.id,
        exerciseId: benchExercise.id,
        recordType: 'ESTIMATED_1RM',
        value: 108,
        workoutId: workout1.id,
      },
      {
        memberId: createdMembers[0].member.id,
        exerciseId: squatExercise.id,
        recordType: 'MAX_WEIGHT',
        value: 140,
      },
      {
        memberId: createdMembers[0].member.id,
        exerciseId: deadliftExercise.id,
        recordType: 'MAX_WEIGHT',
        value: 180,
      },
    ],
  });

  // 10. Body Metrics for Arjun Mehta (showing progress over 3 months)
  console.log('📈 Seeding Body Metrics...');
  const metricDates = [
    { daysAgo: 90, weight: 81.5, waist: 88, chest: 100, arms: 36 },
    { daysAgo: 60, weight: 79.2, waist: 85, chest: 101, arms: 37 },
    { daysAgo: 30, weight: 77.8, waist: 83, chest: 102, arms: 37.5 },
    { daysAgo: 2, weight: 76.0, waist: 81, chest: 103, arms: 38 },
  ];

  for (const m of metricDates) {
    await prisma.bodyMetric.create({
      data: {
        memberId: createdMembers[0].member.id,
        date: new Date(now.getTime() - m.daysAgo * 24 * 60 * 60 * 1000),
        weightKg: m.weight,
        chestCm: m.chest,
        waistCm: m.waist,
        armsCm: m.arms,
        bodyFatPercent: 18 - (90 - m.daysAgo) * 0.05,
      },
    });
  }

  // 11. Diet Plan for Arjun Mehta
  console.log('🥗 Seeding Diet Plan...');
  await prisma.dietPlan.create({
    data: {
      memberId: createdMembers[0].member.id,
      name: 'High-Protein Lean Bulk Plan',
      dailyCaloriesTarget: 2600,
      proteinTarget: 160,
      carbsTarget: 310,
      fatTarget: 70,
      waterTargetMl: 3500,
      mealGuidanceJson: JSON.stringify({
        breakfast: '3 Boiled Eggs (or 100g Paneer) + 50g Oats with Banana and Almonds',
        midMorning: '1 scoop Whey Protein with 250ml Chaas / water',
        lunch: '150g Chicken Breast (or 150g Tofu) + 2 Chapatis + 1 bowl Dal + Cucumber Salad',
        eveningSnack: 'Roasted Chana / Sattu Drink + 1 Apple',
        dinner: '150g Paneer/Fish + 1 cup Brown Rice + 1 bowl Steamed Vegetables + Curd',
      }),
      assignedByUserId: trainer1.id,
      isActive: true,
    },
  });

  // 12. Gym Classes & Timetable
  console.log('🗓️ Seeding Gym Classes & Bookings...');
  const zumbaClass = await prisma.gymClass.create({
    data: {
      name: 'Zumba Dance Fitness',
      description: 'High-energy dance cardio party synced to Latin and Bollywood chartbusters.',
      trainerId: trainer2.id,
      dayOfWeek: 'Monday',
      startTime: '07:00',
      endTime: '08:00',
      capacity: 25,
      room: 'Studio 1 (Mirror Deck)',
      color: '#EC4899',
    },
  });

  const hiitClass = await prisma.gymClass.create({
    data: {
      name: 'HIIT & Functional Core',
      description: 'Fast-paced circuit intervals blasting calories and sculpting functional athletic power.',
      trainerId: trainer1.id,
      dayOfWeek: 'Tuesday',
      startTime: '07:30',
      endTime: '08:30',
      capacity: 20,
      room: 'Main Turf Arena',
      color: '#F97316',
    },
  });

  const yogaClass = await prisma.gymClass.create({
    data: {
      name: 'Power Yoga & Mobility',
      description: 'Deep spinal decompression, hip openers, and breath control for lifters.',
      trainerId: trainer2.id,
      dayOfWeek: 'Wednesday',
      startTime: '06:30',
      endTime: '07:30',
      capacity: 20,
      room: 'Yoga & Zen Shala',
      color: '#10B981',
    },
  });

  const strengthCamp = await prisma.gymClass.create({
    data: {
      name: 'Iron Strength Bootcamp',
      description: 'Barbell technique mastery, compound strength cycles, and conditioning finish.',
      trainerId: trainer1.id,
      dayOfWeek: 'Thursday',
      startTime: '18:30',
      endTime: '19:30',
      capacity: 15,
      room: 'Heavy Lifting Zone',
      color: '#8B5CF6',
    },
  });

  // Bookings for today/upcoming
  const todayDateStr = now.toISOString().split('T')[0];
  await prisma.classBooking.create({
    data: {
      classId: zumbaClass.id,
      memberId: createdMembers[0].member.id,
      bookingDate: todayDateStr,
      status: 'BOOKED',
    },
  });

  // 13. CRM Leads
  console.log('🎯 Seeding CRM Leads...');
  await prisma.lead.createMany({
    data: [
      {
        name: 'Kabir Singhal',
        phone: '9845012345',
        email: 'kabir.s@gmail.com',
        fitnessGoal: 'Muscle Gain',
        preferredTime: 'Evening',
        source: 'WEBSITE',
        status: 'NEW',
        notes: 'Submitted enquiry through website trial form. Interested in annual plan.',
      },
      {
        name: 'Shreya Nair',
        phone: '9845012346',
        email: 'shreya.n@outlook.com',
        fitnessGoal: 'Fat Loss',
        preferredTime: 'Morning',
        source: 'WALK_IN',
        status: 'TRIAL_BOOKED',
        trialDate: todayDateStr,
        notes: 'Walked in with friend. Booked trial class for HIIT with Vikram.',
        assignedToUserId: receptionist.id,
      },
      {
        name: 'Rahul Deshmukh',
        phone: '9845012347',
        email: 'rahul.d@yahoo.com',
        fitnessGoal: 'General Fitness',
        preferredTime: 'Morning',
        source: 'REFERRAL',
        status: 'CONTACTED',
        notes: 'Called for pricing inquiry. Sent WhatsApp brochure.',
        assignedToUserId: manager.id,
      },
    ],
  });

  // 14. Challenges & Community
  console.log('🏅 Seeding Challenges...');
  const challenge = await prisma.challenge.create({
    data: {
      title: '30-Day Attendance Warrior Challenge',
      description: 'Check into the gym at least 20 days within this calendar month to win the exclusive Iron Warrior badge and 15% discount on your next membership renewal!',
      challengeType: 'ATTENDANCE',
      targetGoal: 20,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      badgeRewardId: createdBadges[2].id, // STREAK_30
      isActive: true,
    },
  });

  await prisma.challengeParticipant.create({
    data: {
      challengeId: challenge.id,
      memberId: createdMembers[0].member.id,
      currentProgress: 14,
      isCompleted: false,
    },
  });

  // 15. Announcements
  console.log('📢 Seeding Announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        title: '🔥 New Olympic Lifting Platforms Installed!',
        content: 'We have upgraded Zone B with 3 brand-new Eleiko competition barbells and high-density bumper plates. Check them out this evening!',
        targetSegment: 'ALL',
        isPinned: true,
      },
      {
        title: '⚠️ Special Diwali Weekend Timings',
        content: 'Gym will operate between 6:00 AM - 1:00 PM on Sunday. Evening sessions will remain closed for celebrations.',
        targetSegment: 'ALL',
        isPinned: false,
      },
    ],
  });

  // 16. Equipment & Maintenance
  console.log('🛠️ Seeding Equipment & Maintenance...');
  const eq1 = await prisma.equipment.create({
    data: {
      name: 'Life Fitness Commercial Treadmill #01',
      category: 'Cardio',
      purchaseDate: '2025-01-10',
      condition: 'EXCELLENT',
      warrantyExpiry: '2028-01-10',
      maintenanceFrequencyDays: 90,
      lastServicedDate: '2026-08-15',
      nextServiceDate: '2026-11-15',
    },
  });

  const eq2 = await prisma.equipment.create({
    data: {
      name: 'Hammer Strength Iso-Lateral Chest Press',
      category: 'Strength',
      purchaseDate: '2024-06-20',
      condition: 'GOOD',
      warrantyExpiry: '2029-06-20',
      maintenanceFrequencyDays: 180,
      lastServicedDate: '2026-07-01',
      nextServiceDate: '2027-01-01',
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      equipmentId: eq1.id,
      loggedByUserId: manager.id,
      issueDescription: 'Quarterly belt lubrication and sensor recalibration completed.',
      cost: 1500,
      status: 'RESOLVED',
      resolvedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    },
  });

  // 17. Expenses & Products
  console.log('💰 Seeding Expenses & Products...');
  await prisma.expense.createMany({
    data: [
      {
        title: 'Monthly Gym Facility Rent - Indiranagar',
        category: 'RENT',
        amount: 145000,
        expenseDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`,
        paymentMode: 'BANK_TRANSFER',
        recordedByUserId: owner.id,
      },
      {
        title: 'Trainer & Staff Salaries (Vikram, Priya, Neha)',
        category: 'SALARIES',
        amount: 95000,
        expenseDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`,
        paymentMode: 'BANK_TRANSFER',
        recordedByUserId: owner.id,
      },
      {
        title: 'BESCOM Electricity Bill',
        category: 'ELECTRICITY',
        amount: 22400,
        expenseDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-05`,
        paymentMode: 'UPI',
        recordedByUserId: manager.id,
      },
      {
        title: 'Air Conditioning Servicing & Filter Cleaning',
        category: 'EQUIPMENT_MAINTENANCE',
        amount: 6000,
        expenseDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-10`,
        paymentMode: 'UPI',
        recordedByUserId: manager.id,
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Iron Forge 100% Gold Whey Protein (1kg Chocolate)',
        category: 'SUPPLEMENT',
        price: 3200,
        costPrice: 2200,
        stockQuantity: 24,
        reorderLevel: 5,
        sku: 'SUP-WHEY-CHO-1KG',
      },
      {
        name: 'Iron Forge Stainless Steel Shaker (750ml)',
        category: 'MERCHANDISE',
        price: 650,
        costPrice: 300,
        stockQuantity: 40,
        reorderLevel: 10,
        sku: 'MERCH-SHAKER-750',
      },
      {
        name: 'Optimum Nutrition Micronized Creatine (250g)',
        category: 'SUPPLEMENT',
        price: 1100,
        costPrice: 750,
        stockQuantity: 18,
        reorderLevel: 5,
        sku: 'SUP-CREA-250G',
      },
      {
        name: 'Fast&Up Electrolyte Fizz Tubes (Pack of 20)',
        category: 'BEVERAGE',
        price: 390,
        costPrice: 240,
        stockQuantity: 35,
        reorderLevel: 8,
        sku: 'BEV-FIZZ-20',
      },
    ],
  });

  console.log('✨ Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('DEMO ACCOUNTS READY (All passwords: password123):');
  console.log('👑 Owner:        owner@gymbuddy.com      / 9876543210');
  console.log('💼 Manager:      manager@gymbuddy.com    / 9876543211');
  console.log('🏋️ Trainer:      trainer@gymbuddy.com    / 9876543212');
  console.log('📋 Receptionist: reception@gymbuddy.com  / 9876543213');
  console.log('📱 Member:       arjun@gmail.com         / 9811122331');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
