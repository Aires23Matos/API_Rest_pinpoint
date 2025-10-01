import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/connectDB.js';
import authRoute from "./routes/auth.route.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail
} from './mailtrap/email.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rota raiz
app.get("/", (req, res) => {
  res.send("Hello world 123!");
});

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mailtrap API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação
app.use("/api/auth", authRoute);

// Rotas de email (agora com prefixo /api/auth)
app.post('/api/auth/send-verification-email', async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    if (!email || !verificationToken) {
      return res.status(400).json({
        success: false,
        error: 'Email e verificationToken são obrigatórios'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    await sendVerificationEmail(email, verificationToken);

    res.json({
      success: true,
      message: 'E-mail de verificação enviado com sucesso',
      email: email
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao enviar e-mail de verificação',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/auth/send-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email e name são obrigatórios'
      });
    }

    await sendWelcomeEmail(email, name);

    res.json({
      success: true,
      message: 'E-mail de boas-vindas enviado com sucesso',
      email: email,
      name: name
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao enviar e-mail de boas-vindas',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/auth/send-password-reset-email', async (req, res) => {
  try {
    const { email, resetURL } = req.body;

    if (!email || !resetURL) {
      return res.status(400).json({
        success: false,
        error: 'Email e resetURL são obrigatórios'
      });
    }

    await sendPasswordResetEmail(email, resetURL);

    res.json({
      success: true,
      message: 'E-mail de redefinição de senha enviado com sucesso',
      email: email
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao enviar e-mail de redefinição de senha',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/auth/send-reset-success-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    await sendResetSuccessEmail(email);

    res.json({
      success: true,
      message: 'E-mail de sucesso na redefinição enviado com sucesso',
      email: email
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao enviar e-mail de sucesso na redefinição',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/auth/send-batch-emails', async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Emails deve ser um array não vazio de objetos com email e tipo'
      });
    }

    if (emails.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Número máximo de emails por lote é 50'
      });
    }

    const results = [];

    for (const emailData of emails) {
      try {
        if (!emailData.email || !emailData.type) {
          results.push({
            email: emailData.email || 'unknown',
            type: emailData.type || 'unknown',
            success: false,
            error: 'Email e type são obrigatórios'
          });
          continue;
        }

        switch (emailData.type) {
          case 'verification':
            if (!emailData.verificationToken) {
              throw new Error('verificationToken é obrigatório para tipo verification');
            }
            await sendVerificationEmail(emailData.email, emailData.verificationToken);
            break;
          case 'welcome':
            if (!emailData.name) {
              throw new Error('name é obrigatório para tipo welcome');
            }
            await sendWelcomeEmail(emailData.email, emailData.name);
            break;
          case 'password-reset':
            if (!emailData.resetURL) {
              throw new Error('resetURL é obrigatório para tipo password-reset');
            }
            await sendPasswordResetEmail(emailData.email, emailData.resetURL);
            break;
          case 'reset-success':
            await sendResetSuccessEmail(emailData.email);
            break;
          default:
            throw new Error(`Tipo de e-mail não suportado: ${emailData.type}`);
        }

        results.push({
          email: emailData.email,
          type: emailData.type,
          success: true
        });
      } catch (error) {
        results.push({
          email: emailData.email,
          type: emailData.type,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Processamento de e-mails em lote concluído',
      results: results
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao processar e-mails em lote',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// **CORREÇÃO DO ERRO: Middleware para rotas não encontradas**
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/send-verification-email',
      'POST /api/auth/send-welcome-email',
      'POST /api/auth/send-password-reset-email',
      'POST /api/auth/send-reset-success-email',
      'POST /api/auth/send-batch-emails'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
