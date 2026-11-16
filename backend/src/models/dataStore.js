const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');

class DataStore {
  constructor() {
    this.users = new Map();
    this.helpers = new Map();
    this.requests = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.calls = new Map();
    this.trackingSessions = new Map();
    this.reports = new Map();
    this.auditLogs = [];
    this.notifiedHelperIndex = new Map();
    this.contactAlerts = new Map();

    this.ensureDataDir();
    this.loadData();
  }

  ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[DATASTORE] Could not create data directory:', e.message);
    }
  }

  loadData() {
    try {
      // 1. Load users
      const usersPath = path.join(DATA_DIR, 'users.json');
      if (fs.existsSync(usersPath)) {
        const raw = fs.readFileSync(usersPath, 'utf8');
        const list = JSON.parse(raw);
        for (const [id, user] of list) {
          this.users.set(id, user);
        }
        console.log(`[DATASTORE] Loaded ${this.users.size} registered users from database file.`);
      }

      // 2. Load helpers
      const helpersPath = path.join(DATA_DIR, 'helpers.json');
      if (fs.existsSync(helpersPath)) {
        const raw = fs.readFileSync(helpersPath, 'utf8');
        const list = JSON.parse(raw);
        for (const [id, helper] of list) {
          this.helpers.set(id, helper);
        }
        console.log(`[DATASTORE] Loaded ${this.helpers.size} helpers from database file.`);
      }

      // 3. Load requests
      const requestsPath = path.join(DATA_DIR, 'requests.json');
      if (fs.existsSync(requestsPath)) {
        const raw = fs.readFileSync(requestsPath, 'utf8');
        const list = JSON.parse(raw);
        for (const [id, reqItem] of list) {
          this.requests.set(id, reqItem);
        }
        console.log(`[DATASTORE] Loaded ${this.requests.size} requests from database file.`);
      }

      // 4. Load chats & messages
      const chatsPath = path.join(DATA_DIR, 'chats.json');
      if (fs.existsSync(chatsPath)) {
        const raw = fs.readFileSync(chatsPath, 'utf8');
        const list = JSON.parse(raw);
        for (const [id, chat] of list) {
          this.chats.set(id, chat);
        }
      }

      const messagesPath = path.join(DATA_DIR, 'messages.json');
      if (fs.existsSync(messagesPath)) {
        const raw = fs.readFileSync(messagesPath, 'utf8');
        const list = JSON.parse(raw);
        for (const [id, msgs] of list) {
          this.messages.set(id, msgs);
        }
      }
    } catch (err) {
      console.warn('[DATASTORE] Error loading saved database files, initializing fresh:', err.message);
    }

    // Always ensure System Admin account exists in the database
    if (!this.users.has('usr_admin_001')) {
      const adminUser = {
        id: 'usr_admin_001',
        name: 'System Admin',
        email: 'admin@helpradius.org',
        phone: '+919876543210',
        password: 'password123',
        verificationId: 'GOV-ADM-001',
        idType: 'Government System Administrator ID',
        role: 'admin',
        isHelper: false,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date().toISOString(),
        emergencyContacts: []
      };
      this.users.set(adminUser.id, adminUser);
      this.saveUsers();
    }
  }

  saveUsers() {
    try {
      this.ensureDataDir();
      const usersPath = path.join(DATA_DIR, 'users.json');
      fs.writeFileSync(usersPath, JSON.stringify(Array.from(this.users.entries()), null, 2), 'utf8');
    } catch (e) {
      console.error('[DATASTORE] Error saving users to disk:', e.message);
    }
  }

  saveHelpers() {
    try {
      this.ensureDataDir();
      const helpersPath = path.join(DATA_DIR, 'helpers.json');
      fs.writeFileSync(helpersPath, JSON.stringify(Array.from(this.helpers.entries()), null, 2), 'utf8');
    } catch (e) {
      console.error('[DATASTORE] Error saving helpers to disk:', e.message);
    }
  }

  saveRequests() {
    try {
      this.ensureDataDir();
      const requestsPath = path.join(DATA_DIR, 'requests.json');
      fs.writeFileSync(requestsPath, JSON.stringify(Array.from(this.requests.entries()), null, 2), 'utf8');
    } catch (e) {
      console.error('[DATASTORE] Error saving requests to disk:', e.message);
    }
  }

  saveChats() {
    try {
      this.ensureDataDir();
      const chatsPath = path.join(DATA_DIR, 'chats.json');
      fs.writeFileSync(chatsPath, JSON.stringify(Array.from(this.chats.entries()), null, 2), 'utf8');
    } catch (e) {}
  }

  saveMessages() {
    try {
      this.ensureDataDir();
      const messagesPath = path.join(DATA_DIR, 'messages.json');
      fs.writeFileSync(messagesPath, JSON.stringify(Array.from(this.messages.entries()), null, 2), 'utf8');
    } catch (e) {}
  }

  relocateSeedHelpersAround(lat, lng) {
    if (!lat || !lng || !this.helpers || this.helpers.size === 0) return;
    const offsets = [
      { id: 'hlp_001', latOff: 0.007, lngOff: 0.005 },
      { id: 'hlp_002', latOff: -0.010, lngOff: 0.008 },
      { id: 'hlp_003', latOff: 0.024, lngOff: -0.015 },
      { id: 'hlp_004', latOff: -0.038, lngOff: -0.022 },
      { id: 'hlp_005', latOff: 0.055, lngOff: 0.040 }
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
