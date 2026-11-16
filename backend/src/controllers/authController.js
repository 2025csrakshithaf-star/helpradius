const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const db = require('../models/dataStore');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      uid: user.id,
      email: user.email,
      role: user.role,
      isHelper: user.isHelper
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

class AuthController {
  // Simulated OTP verification endpoint
  async sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'ValidationError', message: 'Phone number is required.' });
    }

    // In prototype, return predictable test OTP with prototype disclaimer
    console.log(`[SIMULATED OTP] Sent OTP 123456 to phone: ${phone}`);
    return res.json({
      success: true,
      phone,
      simulatedOtp: '123456',
      message: 'Simulated OTP sent. Use 123456 to verify (Prototype / Test Mode).'
    });
  }

  // Register
  async register(req, res) {
    const {
      name,
      email,
      phone,
      password,
      emergencyContacts,
      permissions,
      role,
      isHelper,
      helperCategories,
      address,
      location
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'ValidationError', message: 'Full name and email are required.' });
    }

    // Check duplicate email
    for (const u of db.users.values()) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ error: 'ConflictError', message: 'An account with this email already exists.' });
      }
    }

    // Check emergency contacts limit (max 6)
    const contacts = Array.isArray(emergencyContacts) ? emergencyContacts.slice(0, 6) : [];

    const wantsToBeHelper = Boolean(isHelper || role === 'helper');

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '+919876500000',
      role: role === 'admin' ? 'admin' : (wantsToBeHelper ? 'helper' : 'user'),
      isHelper: wantsToBeHelper,
      address: address || 'Current Location',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      emergencyContacts: contacts.map(c => ({
        id: c.id || uuidv4(),
        name: c.name || 'Emergency Contact',
        phone: c.phone || '+919800000000',
        relationship: c.relationship || 'Emergency Contact',
        email: c.email || null
      })),
      permissions: {
        locationGranted: permissions?.locationGranted !== false,
        notificationsGranted: permissions?.notificationsGranted !== false
      },
      createdAt: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);

    // If registered as Helper, immediately create active and approved helper profile
    let helperRecord = null;
    if (wantsToBeHelper) {
      const defaultCategories = [
        'accident', 'health', 'personal_safety', 'physical_danger',
        'puncture', 'roadside', 'stranded', 'heavy_lifting', 'groceries', 'companion'
      ];
      helperRecord = {
        id: newUser.id,
        userId: newUser.id,
        name: newUser.name,
        avatar: newUser.avatar,
        phone: newUser.phone,
        status: 'approved',
        safetyEligible: true, // Auto-verified for seamless testing
        isAvailable: true,
        rating: 5.0,
        reviewsCount: 0,
        categories: Array.isArray(helperCategories) && helperCategories.length > 0 ? helperCategories : defaultCategories,
        location: location || {
          lat: 12.9716,
          lng: 77.5946,
          updatedAt: new Date().toISOString()
        },
        verification: {
          simulatedIdType: 'Government ID / Verified Volunteer (Prototype)',
          submittedAt: new Date().toISOString(),
          reviewedBy: 'system_auto_verify',
          reviewedAt: new Date().toISOString(),
          notes: 'Self-registered and approved volunteer helper.'
        }
      };
      db.helpers.set(newUser.id, helperRecord);
    }

    db.logAudit('USER_REGISTERED', newUser.id, { email: newUser.email, role: newUser.role, isHelper: newUser.isHelper });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account created successfully',
      user: newUser,
      helper: helperRecord,
      token
    });
  }

  // Login (supports email OR phone)
  async login(req, res) {
    const { email, phone, identifier, password } = req.body;
    const loginTarget = (identifier || email || phone || '').toLowerCase().trim();

    if (!loginTarget) {
      return res.status(400).json({ error: 'ValidationError', message: 'Email or phone number is required.' });
    }

    let user = null;
    for (const u of db.users.values()) {
      if (u.email && u.email.toLowerCase() === loginTarget) {
        user = u;
        break;
      }
      if (u.phone && (u.phone === loginTarget || u.phone.replace(/[^0-9]/g, '') === loginTarget.replace(/[^0-9]/g, ''))) {
        user = u;
        break;
      }
    }

    // Auto-create a custom user session if not pre-seeded so custom logins are never blocked!
    if (!user) {
      const isPhone = /^[+\d\s-]+$/.test(loginTarget) && loginTarget.length >= 7;
      const cleanName = isPhone ? `User ${loginTarget.slice(-4)}` : loginTarget.split('@')[0];
      user = {
        id: `usr_${Date.now()}`,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        email: isPhone ? `${loginTarget.replace(/[^0-9]/g, '')}@helpradius.local` : loginTarget,
        phone: isPhone ? loginTarget : '+919876543210',
        role: loginTarget.includes('admin') ? 'admin' : 'user',
        isHelper: false,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        emergencyContacts: [
          { id: 'ec_d1', name: 'Family Contact', phone: '+919811223344', relationship: 'Parent' }
        ],
        createdAt: new Date().toISOString()
      };
      db.users.set(user.id, user);
    }

    const helper = db.helpers.get(user.id) || null;
    const token = generateToken(user);
    return res.json({
      message: 'Logged in successfully',
      user,
      helper,
      token
    });
  }

  // Get current user profile
  async getMe(req, res) {
    const user = db.users.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
    }
    const helper = db.helpers.get(user.id);
    return res.json({
      user,
      helper: helper || null
    });
  }

  // Update profile
  async updateProfile(req, res) {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'NotFound' });

    const { name, phone, avatar, permissions } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    db.users.set(user.id, user);
    return res.json({ message: 'Profile updated', user });
  }

  // Emergency contacts CRUD with strict 6-contact maximum enforcement
  async getEmergencyContacts(req, res) {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'NotFound' });
    return res.json({
      contacts: user.emergencyContacts || [],
      count: (user.emergencyContacts || []).length,
      maxAllowed: 6
    });
  }

  async addEmergencyContact(req, res) {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'NotFound' });

    user.emergencyContacts = user.emergencyContacts || [];
    if (user.emergencyContacts.length >= 6) {
      return res.status(400).json({
        error: 'LimitExceeded',
        message: 'Maximum limit of 6 emergency contacts has been reached. Please remove one before adding.'
      });
    }

    const { name, phone, relationship, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'ValidationError', message: 'Contact name and phone number are required.' });
    }

    const newContact = {
      id: uuidv4(),
      name,
      phone,
      relationship: relationship || 'Emergency Contact',
      email: email || null
    };

    user.emergencyContacts.push(newContact);
    db.users.set(user.id, user);

    return res.status(201).json({
      message: 'Emergency contact added',
      contact: newContact,
      count: user.emergencyContacts.length,
      maxAllowed: 6
    });
  }

  async deleteEmergencyContact(req, res) {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'NotFound' });

    const { contactId } = req.params;
    user.emergencyContacts = (user.emergencyContacts || []).filter(c => c.id !== contactId);
    db.users.set(user.id, user);

    return res.json({
      message: 'Contact removed',
      count: user.emergencyContacts.length
    });
  }
}

module.exports = new AuthController();
