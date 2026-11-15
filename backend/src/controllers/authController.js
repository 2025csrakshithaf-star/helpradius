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
    const { name, email, phone, password, emergencyContacts, permissions, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'ValidationError', message: 'Name and email are required.' });
    }

    // Check duplicate
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ error: 'ConflictError', message: 'An account with this email already exists.' });
      }
    }

    // Check emergency contacts limit (max 6)
    const contacts = Array.isArray(emergencyContacts) ? emergencyContacts.slice(0, 6) : [];

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '+919876500000',
      role: role === 'admin' ? 'admin' : 'user',
      isHelper: false,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      emergencyContacts: contacts.map(c => ({
        id: c.id || uuidv4(),
        name: c.name,
        phone: c.phone,
        relationship: c.relationship || 'Emergency Contact',
        email: c.email || null
      })),
      permissions: {
        locationGranted: Boolean(permissions?.locationGranted),
        notificationsGranted: Boolean(permissions?.notificationsGranted)
      },
      createdAt: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);
    db.logAudit('USER_REGISTERED', newUser.id, { email: newUser.email, role: newUser.role });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account created successfully',
      user: newUser,
      token
    });
  }

  // Login
  async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'ValidationError', message: 'Email is required.' });
    }

    let user = null;
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        user = u;
        break;
      }
    }

    // If user does not exist in prototype demo, auto-create a user session so demo is never blocked!
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email.toLowerCase(),
        phone: '+919876543210',
        role: email.includes('admin') ? 'admin' : 'user',
        isHelper: false,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        emergencyContacts: [
          { id: 'ec_d1', name: 'Family Contact', phone: '+919811223344', relationship: 'Parent' }
        ],
        createdAt: new Date().toISOString()
      };
      db.users.set(user.id, user);
    }

    const token = generateToken(user);
    return res.json({
      message: 'Logged in successfully',
      user,
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
