import {
  ContestCategory,
  ContestStatus,
  DifficultyLevel,
  OrgStatus,
  PrismaClient,
  QuestionType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Olympido database...');

  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  const studentPasswordHash = await bcrypt.hash('Student@123456', 12);
  const organizerPasswordHash = await bcrypt.hash('Organizer@123456', 12);

  // 1. Create Platform Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@olympido.com' },
    update: {},
    create: {
      email: 'admin@olympido.com',
      username: 'admin',
      fullName: 'Olympido Chief Administrator',
      passwordHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✓ Admin created: ${admin.email}`);

  // 2. Create Sample Organization
  const org = await prisma.organization.upsert({
    where: { officialDomain: 'bdpho.org' },
    update: {},
    create: {
      name: 'Bangladesh Physics Olympiad Committee',
      officialDomain: 'bdpho.org',
      contactEmail: 'committee@bdpho.org',
      websiteUrl: 'https://bdpho.org',
      status: OrgStatus.VERIFIED,
      verifiedById: admin.id,
      verifiedAt: new Date(),
    },
  });
  console.log(`✓ Organization created: ${org.name}`);

  // 3. Create Organizer User
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@bdpho.org' },
    update: {},
    create: {
      email: 'organizer@bdpho.org',
      username: 'bdpho_organizer',
      fullName: 'Dr. Masud Hasan',
      passwordHash: organizerPasswordHash,
      role: UserRole.ORGANIZER,
      institutionName: org.name,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✓ Organizer created: ${organizer.email}`);

  // 4. Create Sample Students with StudentStats
  const student1 = await prisma.user.upsert({
    where: { email: 'arif@student.com' },
    update: {},
    create: {
      email: 'arif@student.com',
      username: 'arif_rahman',
      fullName: 'Arif Rahman',
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      institutionName: 'Notre Dame College',
      isEmailVerified: true,
      isActive: true,
      studentStats: {
        create: {
          currentRating: 1350,
          peakRating: 1400,
          totalPoints: BigInt(850),
          contestsParticipated: 4,
          podiumFinishes: 1,
          currentStreak: 2,
          longestStreak: 3,
        },
      },
    },
  });
  console.log(`✓ Student 1 created: ${student1.username}`);

  const student2 = await prisma.user.upsert({
    where: { email: 'tasmia@student.com' },
    update: {},
    create: {
      email: 'tasmia@student.com',
      username: 'tasmia_chowdhury',
      fullName: 'Tasmia Chowdhury',
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      institutionName: 'Viqarunnisa Noon School & College',
      isEmailVerified: true,
      isActive: true,
      studentStats: {
        create: {
          currentRating: 1420,
          peakRating: 1450,
          totalPoints: BigInt(1200),
          contestsParticipated: 6,
          podiumFinishes: 3,
          currentStreak: 4,
          longestStreak: 5,
        },
      },
    },
  });
  console.log(`✓ Student 2 created: ${student2.username}`);

  // 5. Create Sample Contest with Questions
  const now = new Date();
  const contestStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  const regStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const regEnd = new Date(contestStart.getTime() - 60 * 60 * 1000);

  const contest = await prisma.contest.upsert({
    where: { slug: 'national-physics-olympiad-preliminary-round-2026' },
    update: {},
    create: {
      creatorId: organizer.id,
      organizationId: org.id,
      title: 'National Physics Olympiad - Preliminary Round 2026',
      slug: 'national-physics-olympiad-preliminary-round-2026',
      category: ContestCategory.PHYSICS,
      difficulty: DifficultyLevel.NATIONAL,
      description:
        'The official qualifying preliminary contest for high school and college students across the nation.',
      rules:
        '1. Individual participation only.\n2. 5 MCQ problems with negative marking.\n3. Duration: 60 minutes.',
      status: ContestStatus.SCHEDULED,
      registrationStartAt: regStart,
      registrationEndAt: regEnd,
      contestStartAt: contestStart,
      durationMinutes: 60,
      maxScore: 50,
      basePoints: 600,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      adminReviewNotes: 'Contest verified and approved for scheduled release.',
      questions: {
        create: [
          {
            questionOrder: 1,
            type: QuestionType.MCQ,
            questionText:
              'A ball is thrown vertically upward with initial speed v0. Neglecting air resistance, what is its speed at half of its maximum height?',
            options: [
              { label: 'A', text: 'v0 / 2', is_correct: false },
              { label: 'B', text: 'v0 / √2', is_correct: true },
              { label: 'C', text: 'v0 / 4', is_correct: false },
              { label: 'D', text: 'v0 * √3 / 2', is_correct: false },
            ],
            correctAnswer: 'B',
            explanation:
              'Using conservation of mechanical energy: mgh_max = (1/2)mv0^2. At h = h_max/2, (1/2)mv^2 = (1/2)(1/2)mv0^2 => v = v0 / √2.',
            maxPoints: 10.0,
          },
          {
            questionOrder: 2,
            type: QuestionType.MCQ,
            questionText:
              'Two point charges +q and -q are separated by distance 2d. What is the electric field magnitude at the midpoint between them?',
            options: [
              { label: 'A', text: '0', is_correct: false },
              { label: 'B', text: 'q / (4πε0 d^2)', is_correct: false },
              { label: 'C', text: 'q / (2πε0 d^2)', is_correct: true },
              { label: 'D', text: 'q / (πε0 d^2)', is_correct: false },
            ],
            correctAnswer: 'C',
            explanation:
              'Both charges produce fields in the same direction at the midpoint. E = 2 * [q / (4πε0 d^2)] = q / (2πε0 d^2).',
            maxPoints: 10.0,
          },
          {
            questionOrder: 3,
            type: QuestionType.MCQ,
            questionText:
              'In an ideal Carnot cycle, if the temperature of the cold reservoir is 300K and hot reservoir is 600K, what is the maximum thermodynamic efficiency?',
            options: [
              { label: 'A', text: '33.3%', is_correct: false },
              { label: 'B', text: '50.0%', is_correct: true },
              { label: 'C', text: '66.7%', is_correct: false },
              { label: 'D', text: '75.0%', is_correct: false },
            ],
            correctAnswer: 'B',
            explanation: 'η = 1 - (Tc / Th) = 1 - (300 / 600) = 0.50 or 50%.',
            maxPoints: 10.0,
          },
          {
            questionOrder: 4,
            type: QuestionType.MCQ,
            questionText:
              'What is the de Broglie wavelength of an electron accelerated through a potential difference V (in non-relativistic regime)?',
            options: [
              { label: 'A', text: 'h / √(2meV)', is_correct: true },
              { label: 'B', text: 'h / (2meV)', is_correct: false },
              { label: 'C', text: '√(2meV) / h', is_correct: false },
              { label: 'D', text: 'h / (meV)', is_correct: false },
            ],
            correctAnswer: 'A',
            explanation:
              'Kinetic energy K = eV = p^2 / (2m), so momentum p = √(2meV). λ = h / p = h / √(2meV).',
            maxPoints: 10.0,
          },
          {
            questionOrder: 5,
            type: QuestionType.MCQ,
            questionText:
              'A uniform solid cylinder of mass M and radius R rolls without slipping down an incline of angle θ. What is its linear acceleration down the incline?',
            options: [
              { label: 'A', text: 'g sin(θ)', is_correct: false },
              { label: 'B', text: '(1/2) g sin(θ)', is_correct: false },
              { label: 'C', text: '(2/3) g sin(θ)', is_correct: true },
              { label: 'D', text: '(3/4) g sin(θ)', is_correct: false },
            ],
            correctAnswer: 'C',
            explanation:
              'For a rolling solid cylinder, I = (1/2)MR^2. a = g sin(θ) / (1 + I / MR^2) = g sin(θ) / (1 + 1/2) = (2/3) g sin(θ).',
            maxPoints: 10.0,
          },
        ],
      },
    },
  });
  console.log(`✓ Sample contest created: ${contest.title}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
