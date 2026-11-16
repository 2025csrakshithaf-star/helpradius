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

    console.log(`[SIMULATED OTP] Sent OTP 123456 to phone: ${phone}`);
    return res.json({
      success: true,
      phone,
      simulatedOtp: '123456',
      message: 'Simulated OTP sent. Use 123456 to verify (Prototype / Test Mode).'
    });
  }

  // Register with complete user details and verification ID
  async register(req, res) {
    const {
      name,
      email,
      phone,
      password,
      verificationId,
      idType,
      emergencyContacts,
      permissions,
      role,
      isHelper,
      helperCategories,
      address,
      location
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Email address is required.' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Mobile phone number is required.' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'ValidationError', message: 'Password must be at least 4 characters long.' });
    }

    if (!verificationId || !verificationId.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Verification ID Number (e.g. Aadhaar, Voter ID, Driving License, Student ID) is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // Check duplicate email
    for (const u of db.users.values()) {
      if (u.email && u.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({
          error: 'ConflictError',
          message: 'An account with this email already exists. Please log in instead.'
        });
      }
      if (u.phone && (u.phone === cleanPhone || u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''))) {
        return res.status(400).json({
          error: 'ConflictError',
          message: 'An account with this mobile number already exists. Please log in instead.'
        });
      }
    }

    // Emergency contacts (max 6, no fake default contacts!)
    const contacts = Array.isArray(emergencyContacts) ? emergencyContacts.slice(0, 6) : [];

    const wantsToBeHelper = Boolean(isHelper || role === 'helper');

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password, // stored securely for login verification
      verificationId: verificationId.trim(),
      idType: idType || 'Government / National ID',
      role: wantsToBeHelper ? 'helper' : (role === 'admin' ? 'admin' : 'user'),
      isHelper: wantsToBeHelper,
      address: address ? address.trim() : 'Current Location',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      emergencyContacts: contacts.map(c => ({
        id: c.id || uuidv4(),
        name: c.name ? c.name.trim() : 'Emergency Contact',
        phone: c.phone ? c.phone.trim() : '',
        relationship: c.relationship || 'Family'
      })).filter(c => c.name && c.phone),
      permissions: {
        locationGranted: permissions?.locationGranted !== false,
        notificationsGranted: permissions?.notificationsGranted !== false
      },
      createdAt: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);

    // If registered as Helper, create approved helper profile
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
        verificationId: newUser.verificationId,
        idType: newUser.idType,
        status: 'approved',
        safetyEligible: true,
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
          simulatedIdType: newUser.idType,
          idNumber: newUser.verificationId,
          submittedAt: new Date().toISOString(),
          reviewedBy: 'system_auto_verify',
          reviewedAt: new Date().toISOString(),
          notes: 'Verified during community registration'
        }
      };
      db.helpers.set(newUser.id, helperRecord);
      db.saveHelpers();
    }

    db.saveUsers();
    db.logAudit('USER_REGISTERED', newUser.id, {
      email: newUser.email,
      role: newUser.role,
      verificationId: newUser.verificationId
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account created and verified successfully',
      user: newUser,
      helper: helperRecord,
      token
    });
  }

  // Strict Login against database
  async login(req, res) {
    const { email, phone, identifier, password } = req.body;
    const loginTarget = (identifier || email || phone || '').toLowerCase().trim();

    if (!loginTarget) {
      return res.status(400).json({ error: 'ValidationError', message: 'Email or mobile number is required.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'ValidationError', message: 'Password is required.' });
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

    if (!user) {
      return res.status(404).json({
        error: 'UserNotFound',
        message: 'No registered account found with this email or mobile number. Please register first.'
      });
    }

    // Verify Password against stored registration password
    if (user.password && user.password !== password) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Incorrect password. Please enter the password you registered with.'
      });
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
      return res.status(404).json({ error: 'NotFound', message: 'User not found in database.' });
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

    const { name, phone, avatar, address, verificationId, permissions } = req.body;
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (avatar) user.avatar = avatar;
    if (address) user.address = address.trim();
    if (verificationId) user.verificationId = verificationId.trim();
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    db.users.set(user.id, user);
    db.saveUsers();
    return res.json({ message: 'Profile updated', user });
  }

  // Emergency contacts CRUD
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
        message: 'Maximum limit of 6 emergency contacts reached. Please remove one before adding.'
      });
    }

    const { name, phone, relationship } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'ValidationError', message: 'Contact name and mobile number are required.' });
    }

    const newContact = {
      id: uuidv4(),
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship || 'Emergency Contact'
    };

    user.emergencyContacts.push(newContact);
    db.users.set(user.id, user);
    db.saveUsers();

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
    db.saveUsers();

    return res.json({
      message: 'Contact removed',
      count: user.emergencyContacts.length
    });
  }
}

module.exports = new AuthController();
