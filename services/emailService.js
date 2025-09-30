import fetch from 'node-fetch';

const MAILTRAP_API_BASE = process.env.MAILTRAP_API_URL || 'http://localhost:3000/api';

class EmailService {
    constructor() {
        this.apiBase = MAILTRAP_API_BASE;
        this.timeout = 10000; // 5 segundos de timeout
    }

    async makeRequest(endpoint, data) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(`${this.apiBase}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Se a API Mailtrap não estiver respondendo, não bloqueia a aplicação
            if (!response.ok) {
                console.warn(`API Mailtrap retornou status ${response.status} para ${endpoint}`);
                return { success: false, error: `API retornou status ${response.status}` };
            }

            const result = await response.json();
            return result;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`Timeout na requisição para ${endpoint}`);
            } else {
                console.warn(`Erro ao chamar API Mailtrap (${endpoint}):`, error.message);
            }

            // Retorna um objeto indicando falha, mas não lança erro
            return {
                success: false,
                error: 'Serviço de e-mail temporariamente indisponível'
            };
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
