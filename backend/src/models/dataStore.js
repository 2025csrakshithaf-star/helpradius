const { v4: uuidv4 } = require('uuid');

// In-Memory Realtime Data Store with Pre-seeded helpers and administrative accounts
class DataStore {
  constructor() {
    this.users = new Map();
    this.helpers = new Map();
    this.requests = new Map();
    this.chats = new Map();
    this.messages = new Map(); // requestId -> array of messages
    this.calls = new Map();
    this.trackingSessions = new Map();
    this.reports = new Map();
    this.auditLogs = [];
    this.notifiedHelperIndex = new Map(); // requestId -> Set of helperIds
    this.contactAlerts = new Map(); // requestId -> array of contact alert items

    this.initSeedData();
  }

  initSeedData() {
    // 1. Pre-seeded Admin User
    const adminUser = {
      id: 'usr_admin_001',
      name: 'System Admin',
      email: 'admin@helpradius.org',
      phone: '+919876543210',
      role: 'admin',
      isHelper: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString(),
      emergencyContacts: [
        { id: 'ec_1', name: 'Dr. Ramesh Sharma', phone: '+919811122233', relationship: 'Family Doctor' }
      ]
    };
    this.users.set(adminUser.id, adminUser);

    // 2. Pre-seeded Regular User (Requester)
    const demoUser = {
      id: 'usr_demo_001',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919822334455',
      role: 'user',
      isHelper: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date().toISOString(),
      emergencyContacts: [
        { id: 'ec_p1', name: 'Papa (Suresh)', phone: '+919822001122', relationship: 'Father', email: 'suresh@example.com' },
        { id: 'ec_p2', name: 'Maa (Sunita)', phone: '+919822001123', relationship: 'Mother' },
        { id: 'ec_p3', name: 'Ananya (Sister)', phone: '+919822001124', relationship: 'Sister' },
        { id: 'ec_p4', name: 'Kavita (Colleague)', phone: '+919822001125', relationship: 'Friend' }
      ]
    };
    this.users.set(demoUser.id, demoUser);

    // 3. Seed Helpers around Bangalore / Default Indian Tech Hub (12.9716, 77.5946)
    // and can be dynamically relocated around the requester's coordinates!
    const seedHelperProfiles = [
      {
        id: 'hlp_001',
        name: 'Arjun Verma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: '+919833445566',
        status: 'approved',
        safetyEligible: true, // Approved for personal safety emergency SOS
        isAvailable: true,
        rating: 4.9,
        reviewsCount: 38,
        categories: ['accident', 'health', 'personal_safety', 'physical_danger', 'puncture', 'roadside'],
        latOffset: 0.008, // ~0.9 km away
        lngOffset: 0.006,
        verification: {
          simulatedIdType: 'Government Driving License (Simulated)',
          reviewedBy: 'usr_admin_001',
          reviewedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          notes: 'First responder training verified, CPR certified'
        }
      },
      {
        id: 'hlp_002',
        name: 'Dr. Sneha Patel',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        phone: '+919844556677',
        status: 'approved',
        safetyEligible: true, // Medical professional verified
        isAvailable: true,
        rating: 5.0,
        reviewsCount: 52,
        categories: ['accident', 'health', 'personal_safety', 'appointment_companion'],
        latOffset: -0.012, // ~1.5 km away
        lngOffset: 0.009,
        verification: {
          simulatedIdType: 'Medical Council ID (Simulated)',
          reviewedBy: 'usr_admin_001',
          reviewedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          notes: 'MBBS, Emergency triage volunteer'
        }
      },
      {
        id: 'hlp_003',
        name: 'Vikram Singh',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        phone: '+919855667788',
        status: 'approved',
        safetyEligible: false, // General help only
        isAvailable: true,
        rating: 4.8,
        reviewsCount: 24,
        categories: ['puncture', 'stranded', 'heavy_objects', 'move_luggage', 'shopping_companion'],
        latOffset: 0.025, // ~3.1 km away
        lngOffset: -0.015,
        verification: {
          simulatedIdType: 'Voter ID (Simulated)',
          reviewedBy: 'usr_admin_001',
          reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          notes: 'Has toolkit and portable tire air pump'
        }
      },
      {
        id: 'hlp_004',
        name: 'Meera Rao',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        phone: '+919866778899',
        status: 'approved',
        safetyEligible: true,
        isAvailable: true,
        rating: 4.95,
        reviewsCount: 41,
        categories: ['personal_safety', 'health', 'shopping_companion', 'appointment_companion'],
        latOffset: -0.038, // ~4.8 km away
        lngOffset: -0.025,
        verification: {
          simulatedIdType: 'Corporate Employee Badge (Simulated)',
          reviewedBy: 'usr_admin_001',
          reviewedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          notes: 'Self-defense certified instructor'
        }
      },
      {
        id: 'hlp_005',
        name: 'Karan Joshi',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        phone: '+919877889900',
        status: 'pending', // Pending verification for admin approval demo!
        safetyEligible: false,
        isAvailable: true,
        rating: 0,
        reviewsCount: 0,
        categories: ['stranded', 'heavy_objects', 'move_luggage', 'personal_safety'],
        latOffset: 0.05, // ~6.5 km away
        lngOffset: 0.04,
        verification: {
          simulatedIdType: 'College Student ID (Simulated)',
          reviewedBy: null,
          reviewedAt: null,
          notes: 'Pending review by Admin'
        }
      }
    ];

    // Seed into users and helpers map
    seedHelperProfiles.forEach(h => {
      const user = {
        id: h.id,
        name: h.name,
        email: `${h.name.toLowerCase().replace(/[^a-z]/g, '')}@helpradius.org`,
        phone: h.phone,
        role: 'user',
        isHelper: true,
        avatar: h.avatar,
        createdAt: new Date().toISOString()
      };
      this.users.set(user.id, user);

      // Default base location: 12.9716, 77.5946 (MG Road, Bengaluru)
      const baseLat = 12.9716;
      const baseLng = 77.5946;

      this.helpers.set(h.id, {
        id: h.id,
        userId: h.id,
        name: h.name,
        avatar: h.avatar,
        phone: h.phone,
        status: h.status,
        safetyEligible: h.safetyEligible,
        isAvailable: h.isAvailable,
        rating: h.rating,
        reviewsCount: h.reviewsCount,
        categories: h.categories,
        location: {
          lat: baseLat + h.latOffset,
          lng: baseLng + h.lngOffset,
          updatedAt: new Date().toISOString()
        },
        verification: h.verification
      });
    });
  }

  // Relocate seed helpers dynamically near any user coordinates for seamless testing anywhere in the world!
  relocateSeedHelpersAround(lat, lng) {
    const offsets = [
      { id: 'hlp_001', latOff: 0.007, lngOff: 0.005 },   // ~0.9 km away
      { id: 'hlp_002', latOff: -0.010, lngOff: 0.008 },  // ~1.3 km away
      { id: 'hlp_003', latOff: 0.024, lngOff: -0.015 },  // ~3.2 km away
      { id: 'hlp_004', latOff: -0.038, lngOff: -0.022 }, // ~4.9 km away
      { id: 'hlp_005', latOff: 0.055, lngOff: 0.040 }   // ~7.2 km away
    ];

    offsets.forEach(off => {
      const helper = this.helpers.get(off.id);
      if (helper) {
        helper.location = {
          lat: lat + off.latOff,
          lng: lng + off.lngOff,
          updatedAt: new Date().toISOString()
        };
        this.helpers.set(off.id, helper);
      }
    });
  }

  logAudit(action, actorId, details) {
    const log = {
      id: uuidv4(),
      action,
      actorId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }
}

const db = new DataStore();
module.exports = db;
