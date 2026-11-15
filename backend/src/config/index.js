require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'help-radius-secure-dev-secret-key-2026',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  smsProvider: process.env.SMS_PROVIDER || 'simulated',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'help-radius-prototype',
  
  // Radius Expansion Configuration (configurable per category)
  radiusConfig: {
    emergency: {
      stepsKm: [2, 5, 10, 20],
      waitSec: [30, 45, 60, 90], // accelerated for smooth demo & responsive rescue
      requiresVerifiedHelperForSafety: true
    },
    general: {
      stepsKm: [2, 5, 10],
      waitSec: [60, 120, 180]
    },
    scheduled: {
      stepsKm: [5, 10, 20],
      waitSec: [300, 600, 1200]
    }
  },

  // Pricing Configuration (transparent 3-tier breakdown in INR ₹)
  pricingConfig: {
    emergency: {
      expansionFeePerStep: 0,
      maxExpansionFee: 0,
      feeOptional: true,
      travelRatePerKm: 0,
      note: 'Emergency assistance is prioritized; no payment required.'
    },
    general: {
      expansionFeePerStep: 5,
      travelRatePerKm: 8,
      baseTravelKmFree: 2,
      maxTravelComp: 350
    },
    scheduled: {
      travelRatePerKm: 6,
      ratePerHourSuggested: 120,
      categoryMultipliers: {
        appointment_companion: 1.25,
        move_luggage: 1.5,
        shopping_companion: 1.0,
        planned_activity: 1.1
      }
    }
  }
};

module.exports = config;
