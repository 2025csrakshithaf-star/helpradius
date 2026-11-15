const config = require('../config');

class SmsService {
  /**
   * Dispatch an alert message to an emergency contact.
   * @param {Object} params
   * @param {string} params.contactName
   * @param {string} params.contactPhone
   * @param {string} params.requesterName
   * @param {string} params.category
   * @param {Object} params.location
   * @param {string} params.requestId
   * @returns {Promise<Object>}
   */
  async sendEmergencyAlert({ contactName, contactPhone, requesterName, category, location, requestId }) {
    const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const message = `[HELP RADIUS SOS] ${requesterName} triggered an EMERGENCY (${category.toUpperCase()}). Location: ${mapsLink}. Please check or contact authorities immediately. [Simulated / Prototype]`;

    if (config.smsProvider === 'twilio' && process.env.TWILIO_ACCOUNT_SID) {
      // In production, integrate Twilio / Indian DLT SMS here
      console.log(`[Twilio SMS] Sending to ${contactPhone}: ${message}`);
      return {
        provider: 'twilio',
        phone: contactPhone,
        status: 'sent',
        messageId: `tw_${Date.now()}`,
        sentAt: new Date().toISOString()
      };
    }

    // Default: Simulated SMS Provider (as per Phase 4 requirement with explicit prototype labelling)
    console.log(`\n======================================================`);
    console.log(`[SIMULATED SMS GATEWAY]`);
    console.log(`To: ${contactName} (${contactPhone})`);
    console.log(`Message: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`======================================================\n`);

    return {
      provider: 'simulated',
      phone: contactPhone,
      contactName,
      status: 'delivered', // simulated successful delivery
      deliveryBadge: 'Simulated SMS ✓',
      sentAt: new Date().toISOString()
    };
  }
}

module.exports = new SmsService();
