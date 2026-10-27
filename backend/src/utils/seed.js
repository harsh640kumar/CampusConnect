require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

const seedDatabase = async (exitOnFinish = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Club.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    // 1. Admin
    const admin = await User.create({
      name: 'Dr. Evelyn Vance',
      email: 'admin@campusconnect.edu',
      password: 'Password@123',
      role: 'admin',
      department: 'Dean of Student Affairs',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Administrator overseeing campus life, club governance, and university-wide symposiums.',
    });

    // 2. Coordinators
    const coordAlex = await User.create({
      name: 'Alex Chen',
      email: 'alex.chen@campusconnect.edu',
      password: 'Password@123',
      role: 'coordinator',
      department: 'Computer Science & Engineering',
      studentId: 'FAC-CS-892',
      phone: '+1 (555) 432-8765',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Lead coordinator for the ACM Student Chapter. Passionate about software architecture, open source, and hackathons.',
    });

    const coordSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@campusconnect.edu',
      password: 'Password@123',
      role: 'coordinator',
      department: 'Robotics & Mechatronics',
      studentId: 'FAC-ROB-412',
      phone: '+1 (555) 987-1234',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      bio: 'Coordinator of the Robotics & AI Guild. Research focus in autonomous aerial systems and embedded hardware.',
    });

    const coordMarcus = await User.create({
      name: 'Marcus Reid',
      email: 'marcus.reid@campusconnect.edu',
      password: 'Password@123',
      role: 'coordinator',
      department: 'Fine Arts & Digital Media',
      studentId: 'FAC-ART-301',
      phone: '+1 (555) 765-4321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Coordinator of Creative Arts & Photography Society. Inspiring visual storytelling across campus.',
    });

    // 3. Students
    const studentEmily = await User.create({
      name: 'Emily Watson',
      email: 'student@campusconnect.edu', // primary demo student account
      password: 'Password@123',
      role: 'student',
      department: 'Computer Science',
      studentId: 'CS-2024-101',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Junior CS major focused on Full-Stack systems, cloud architecture, and competitive programming.',
    });

    const studentLiam = await User.create({
      name: 'Liam Patel',
      email: 'liam.patel@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Mechanical Engineering',
      studentId: 'ME-2024-204',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'CAD enthusiast and robotics team member. Building automated rovers.',
    });

    const studentSophia = await User.create({
      name: 'Sophia Rodriguez',
      email: 'sophia.rodriguez@student.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Biotechnology & Life Sciences',
      studentId: 'BT-2025-019',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
      bio: 'Sophomore biotechnology student exploring bioinformatics and campus cultural clubs.',
    });

    console.log('[Seed] Creating demo clubs...');
    const clubACM = await Club.create({
      name: 'ACM Student Chapter',
      description: 'The primary computing society on campus fostering algorithm design, web development, hackathons, and software engineering career preparation.',
      category: 'Technical',
      logo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      coordinator: coordAlex._id,
      contactEmail: 'acm-chapter@campusconnect.edu',
      meetingSchedule: 'Wednesdays @ 5:30 PM',
      location: 'Turing Computing Lab, Hall B',
      socialLinks: {
        website: 'https://acm.campusconnect.edu',
        github: 'https://github.com/campusconnect-acm',
        linkedin: 'https://linkedin.com/company/acm-campus',
      },
      status: 'active',
      members: [coordAlex._id, studentEmily._id, studentLiam._id],
    });

    const clubRobotics = await Club.create({
      name: 'Robotics & AI Guild',
      description: 'Empowering future engineers to construct autonomous mobile robots, computer vision algorithms, and robotic arm kinematics.',
      category: 'Technical',
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      coordinator: coordSarah._id,
      contactEmail: 'robotics@campusconnect.edu',
      meetingSchedule: 'Thursdays @ 6:00 PM',
      location: 'Makerspace Mechatronics Workshop',
      status: 'active',
      members: [coordSarah._id, studentLiam._id],
    });

    const clubArts = await Club.create({
      name: 'Creative Arts & Photography Society',
      description: 'A thriving collective of photographers, visual designers, painters, and cinematographers documenting campus stories.',
      category: 'Arts & Media',
      logo: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
      coordinator: coordMarcus._id,
      contactEmail: 'arts@campusconnect.edu',
      meetingSchedule: 'Fridays @ 4:00 PM',
      location: 'Fine Arts Studio 3',
      status: 'active',
      members: [coordMarcus._id, studentSophia._id],
    });

    const clubDebate = await Club.create({
      name: 'Campus Debating Society',
      description: 'Sharpening parliamentary debate skills, public rhetoric, and critical geopolitical analysis through weekly floor debates.',
      category: 'Literary',
      logo: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      coordinator: coordMarcus._id,
      contactEmail: 'debate@campusconnect.edu',
      meetingSchedule: 'Tuesdays @ 5:00 PM',
      location: 'Senate Chamber Hall',
      status: 'active',
      members: [coordMarcus._id, studentEmily._id],
    });

    const clubVanguard = await Club.create({
      name: 'Vanguard Entrepreneurship Cell',
      description: 'Incubating student startup ventures, venture capital networking, product discovery sprints, and investor pitch sessions.',
      category: 'Entrepreneurship',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      coordinator: coordAlex._id,
      contactEmail: 'ecell@campusconnect.edu',
      meetingSchedule: 'Mondays @ 6:00 PM',
      location: 'Innovation & Incubation Hub, 4th Floor',
      status: 'active',
      members: [coordAlex._id, studentEmily._id, studentSophia._id],
    });

    // Update users' joinedClubs
    await User.findByIdAndUpdate(studentEmily._id, {
      joinedClubs: [clubACM._id, clubDebate._id, clubVanguard._id],
    });
    await User.findByIdAndUpdate(studentLiam._id, {
      joinedClubs: [clubACM._id, clubRobotics._id],
    });
    await User.findByIdAndUpdate(studentSophia._id, {
      joinedClubs: [clubArts._id, clubVanguard._id],
    });

    console.log('[Seed] Creating demo events...');
    const now = new Date();

    const dateHackathon = new Date(now);
    dateHackathon.setDate(dateHackathon.getDate() + 5);
    const deadlineHackathon = new Date(now);
    deadlineHackathon.setDate(deadlineHackathon.getDate() + 4);

    const dateWorkshop = new Date(now);
    dateWorkshop.setDate(dateWorkshop.getDate() + 8);
    const deadlineWorkshop = new Date(now);
    deadlineWorkshop.setDate(deadlineWorkshop.getDate() + 7);

    const dateRobotics = new Date(now);
    dateRobotics.setDate(dateRobotics.getDate() + 12);
    const deadlineRobotics = new Date(now);
    deadlineRobotics.setDate(deadlineRobotics.getDate() + 11);

    const dateArts = new Date(now);
    dateArts.setDate(dateArts.getDate() + 15);
    const deadlineArts = new Date(now);
    deadlineArts.setDate(deadlineArts.getDate() + 14);

    const dateDebate = new Date(now);
    dateDebate.setDate(dateDebate.getDate() + 18);
    const deadlineDebate = new Date(now);
    deadlineDebate.setDate(deadlineDebate.getDate() + 17);

    const datePitch = new Date(now);
    datePitch.setDate(datePitch.getDate() + 21);
    const deadlinePitch = new Date(now);
    deadlinePitch.setDate(deadlinePitch.getDate() + 20);

    const eventHackathon = await Event.create({
      title: 'HackCampus 2026: 36-Hour National Hackathon',
      description: 'Join over 400 passionate hackers for our flagship annual hackathon! Build next-generation applications in AI, Web3, FinTech, and Social Good. Mentorship from top engineers, free food, swag bags, and $15,000 in prizes!',
      club: clubACM._id,
      category: 'Hackathon',
      venue: 'University Grand Auditorium & CS Labs',
      date: dateHackathon,
      startTime: '09:00 AM',
      endTime: '09:00 PM (Next Day)',
      capacity: 150,
      registeredCount: 3,
      registrationDeadline: deadlineHackathon,
      bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      tags: ['Hackathon', 'AI', 'FullStack', 'Prizes'],
      status: 'upcoming',
      isFeatured: true,
      createdBy: coordAlex._id,
    });

    const eventWorkshop = await Event.create({
      title: 'Hands-on Deep Learning & LLMs Masterclass',
      description: 'An intensive, hands-on technical workshop exploring transformer architectures, fine-tuning open-source models (Llama 3, Mistral), and vector retrieval pipelines with LangChain and PyTorch.',
      club: clubACM._id,
      category: 'Workshop',
      venue: 'Turing Computing Lab, Room 204',
      date: dateWorkshop,
      startTime: '02:00 PM',
      endTime: '06:00 PM',
      capacity: 60,
      registeredCount: 2,
      registrationDeadline: deadlineWorkshop,
      bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      tags: ['MachineLearning', 'PyTorch', 'LLMs', 'Python'],
      status: 'upcoming',
      isFeatured: true,
      createdBy: coordAlex._id,
    });

    const eventRobotics = await Event.create({
      title: 'Autonomous Drone Navigation Challenge',
      description: 'Watch or compete in the campus obstacle race featuring autonomous quadcopters running ROS2, SLAM algorithms, and onboard edge AI cameras.',
      club: clubRobotics._id,
      category: 'Competition',
      venue: 'Campus Indoor Sports Complex',
      date: dateRobotics,
      startTime: '11:00 AM',
      endTime: '04:00 PM',
      capacity: 80,
      registeredCount: 1,
      registrationDeadline: deadlineRobotics,
      bannerImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      tags: ['Robotics', 'Drones', 'ComputerVision', 'Hardware'],
      status: 'upcoming',
      isFeatured: true,
      createdBy: coordSarah._id,
    });

    const eventArts = await Event.create({
      title: 'Vibrant Campus Perspectives: Photography Expo',
      description: 'Annual photography gallery featuring curated photographs and prints captured by student artists celebrating college life, architectural symmetry, and street photography.',
      club: clubArts._id,
      category: 'Cultural',
      venue: 'Main Library Exhibition Atrium',
      date: dateArts,
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      capacity: 120,
      registeredCount: 1,
      registrationDeadline: deadlineArts,
      bannerImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
      tags: ['Photography', 'Exhibition', 'Art', 'Culture'],
      status: 'upcoming',
      isFeatured: false,
      createdBy: coordMarcus._id,
    });

    const eventDebate = await Event.create({
      title: 'Parliamentary Debate Showcase: Ethics of Frontier AI',
      description: 'A fiery, structured parliamentary debate pitting seasoned student orators against each other on the geopolitical and existential implications of artificial intelligence.',
      club: clubDebate._id,
      category: 'Seminar',
      venue: 'Old Senate Hall',
      date: dateDebate,
      startTime: '04:00 PM',
      endTime: '07:00 PM',
      capacity: 100,
      registeredCount: 1,
      registrationDeadline: deadlineDebate,
      bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      tags: ['Debate', 'Ethics', 'PublicSpeaking'],
      status: 'upcoming',
      isFeatured: false,
      createdBy: coordMarcus._id,
    });

    const eventPitch = await Event.create({
      title: 'Vanguard Pitch Arena: Seed Capital Showcase',
      description: 'Ten student-founded startups pitch live in front of angel investors, alumni founders, and venture funds for non-dilutive equity grant funding.',
      club: clubVanguard._id,
      category: 'Networking',
      venue: 'Business School Executive Auditorium',
      date: datePitch,
      startTime: '03:00 PM',
      endTime: '08:00 PM',
      capacity: 90,
      registeredCount: 1,
      registrationDeadline: deadlinePitch,
      bannerImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
      tags: ['Startups', 'VentureCapital', 'Pitch', 'Networking'],
      status: 'upcoming',
      isFeatured: false,
      createdBy: coordAlex._id,
    });

    console.log('[Seed] Creating demo registrations...');
    // Emily registered for Hackathon and Masterclass
    const reg1 = await Registration.create({
      event: eventHackathon._id,
      student: studentEmily._id,
      status: 'registered',
      attendanceStatus: 'unmarked',
      ticketNumber: 'CC-HACK-8192',
    });

    const reg2 = await Registration.create({
      event: eventWorkshop._id,
      student: studentEmily._id,
      status: 'registered',
      attendanceStatus: 'present',
      attendedAt: new Date(),
      ticketNumber: 'CC-WKSH-4091',
    });

    // Liam registered for Hackathon and Drone Challenge
    const reg3 = await Registration.create({
      event: eventHackathon._id,
      student: studentLiam._id,
      status: 'registered',
      attendanceStatus: 'present',
      attendedAt: new Date(),
      ticketNumber: 'CC-HACK-3021',
    });

    const reg4 = await Registration.create({
      event: eventRobotics._id,
      student: studentLiam._id,
      status: 'registered',
      attendanceStatus: 'unmarked',
      ticketNumber: 'CC-DRON-9128',
    });

    // Sophia registered for Arts expo, Debate, and Hackathon
    const reg5 = await Registration.create({
      event: eventHackathon._id,
      student: studentSophia._id,
      status: 'registered',
      attendanceStatus: 'unmarked',
      ticketNumber: 'CC-HACK-7721',
    });

    const reg6 = await Registration.create({
      event: eventArts._id,
      student: studentSophia._id,
      status: 'registered',
      attendanceStatus: 'unmarked',
      ticketNumber: 'CC-ARTS-1190',
    });

    const reg7 = await Registration.create({
      event: eventWorkshop._id,
      student: studentSophia._id,
      status: 'registered',
      attendanceStatus: 'unmarked',
      ticketNumber: 'CC-WKSH-5510',
    });

    console.log('[Seed] Creating in-app notifications...');
    await Notification.create([
      {
        user: studentEmily._id,
        title: 'Registration Confirmed! 🎟️',
        message: 'Your registration for HackCampus 2026 is confirmed. Ticket #CC-HACK-8192 is ready in your dashboard.',
        type: 'registration',
        link: `/events/${eventHackathon._id}`,
        isRead: false,
      },
      {
        user: studentEmily._id,
        title: 'Workshop Attendance Verified! ✅',
        message: 'Your attendance for Hands-on Deep Learning & LLMs Masterclass has been verified by Alex Chen.',
        type: 'attendance',
        link: `/events/${eventWorkshop._id}`,
        isRead: true,
      },
      {
        user: coordAlex._id,
        title: 'New Event Registration',
        message: 'Emily Watson registered for HackCampus 2026.',
        type: 'registration',
        link: `/events/${eventHackathon._id}`,
        isRead: false,
      },
      {
        user: admin._id,
        title: 'Platform Overview',
        message: 'CampusConnect database successfully initialized with demo clubs, students, and upcoming events.',
        type: 'system',
        link: '/admin',
        isRead: false,
      },
    ]);

    console.log('========================================================');
    console.log('✅ CampusConnect Database successfully seeded!');
    console.log('--------------------------------------------------------');
    console.log('Demo Login Credentials:');
    console.log('1. Student:');
    console.log('   Email: student@campusconnect.edu');
    console.log('   Pass:  Password@123');
    console.log('2. Club Coordinator (Alex Chen - ACM):');
    console.log('   Email: alex.chen@campusconnect.edu');
    console.log('   Pass:  Password@123');
    console.log('3. Platform Administrator (Dr. Vance):');
    console.log('   Email: admin@campusconnect.edu');
    console.log('   Pass:  Password@123');
    console.log('========================================================');

    if (exitOnFinish) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    if (exitOnFinish) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
