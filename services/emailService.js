import fetch from 'node-fetch';

const MAILTRAP_API_BASE = process.env.MAILTRAP_API_URL || 'http://localhost:3000/api';

class EmailService {
  constructor() {
    this.apiBase = MAILTRAP_API_BASE;
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`Erro ao chamar API Mailtrap (${endpoint}):`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email, verificationToken) {
    return this.makeRequest('/send-verification-email', {
      email,
      verificationToken
    });
  }

  async sendWelcomeEmail(email, name) {
    return this.makeRequest('/send-welcome-email', {
      email,
      name
    });
  }

  async sendPasswordResetEmail(email, resetURL) {
    return this.makeRequest('/send-password-reset-email', {
      email,
      resetURL
    });
  }

  async sendResetSuccessEmail(email) {
    return this.makeRequest('/send-reset-success-email', {
      email
    });
  }
}

export const emailService = new EmailService();