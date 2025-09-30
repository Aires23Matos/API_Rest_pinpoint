import { emailService } from "../services/emailService.js";
import { User } from "../models/user.models.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export const signUp = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            throw new Error('All fields are required');
        }

        const userAlreadyExists = await User.findOne({ email });
        console.log("userAlreadyExists", userAlreadyExists);

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'O usuário já existe' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = generateVerificationCode();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
        });

        await user.save();

        // JWT
        generateTokenAndSetCookie(res, user._id);

        // TENTA enviar o e-mail, mas NÃO BLOQUEIA se falhar
        try {
            await emailService.sendVerificationEmail(user.email, verificationToken);
            console.log("E-mail de verificação enviado com sucesso");
        } catch (emailError) {
            console.warn("AVISO: E-mail de verificação não pôde ser enviado, mas o usuário foi criado:", emailError.message);
            // Não lança erro - o usuário ainda pode verificar manualmente com o código
        }

        res.status(201).json({
            success: true,
            message: "Usuário criado com sucesso. Verifique seu e-mail para o código de verificação.",
            user: {
                ...user._doc,
                password: undefined
            },
            // EM DESENVOLVIMENTO: Mostrar o código diretamente para testes
            verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
        });
    } catch (error) {
        console.error("Erro no signUp:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpireAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Código de verificação inválido ou expirado",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpireAt = undefined;
        await user.save();

        // TENTA enviar e-mail de boas-vindas, mas não bloqueia se falhar
        try {
            await emailService.sendWelcomeEmail(user.email, user.name);
            console.log("E-mail de boas-vindas enviado com sucesso");
        } catch (emailError) {
            console.warn("AVISO: E-mail de boas-vindas não pôde ser enviado:", emailError.message);
        }

        res.status(200).json({
            success: true,
            message: "E-mail verificado com sucesso",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.error("Erro no verifyEmail:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Erro do servidor durante a verificação",
        });
    }
};

export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email é obrigatório"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Usuário já verificado"
            });
        }

        // Gera novo código
        const newVerificationToken = generateVerificationCode();

        user.verificationToken = newVerificationToken;
        user.verificationTokenExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
        await user.save();

        // Tenta enviar o novo código por e-mail
        try {
            await emailService.sendVerificationEmail(user.email, newVerificationToken);
            console.log("Novo código de verificação enviado com sucesso");
        } catch (emailError) {
            console.warn("AVISO: Não foi possível enviar o novo código por e-mail:", emailError.message);
        }

        res.status(200).json({
            success: true,
            message: "Novo código de verificação gerado",
            // EM DESENVOLVIMENTO: Mostrar o código diretamente
            verificationToken: process.env.NODE_ENV === 'development' ? newVerificationToken : undefined
        });

    } catch (error) {
        console.error("Erro no resendVerificationCode:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao reenviar código de verificação"
        });
    }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Verifique o seu e-mail antes de iniciar sessão",
      });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login bem-sucedido",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Ocorreu um erro durante o início de sessão",
    });
  }
};

export const logOut = async (req, res) => {
  try {
    // Example: If using JWT in cookies
    res.clearCookie('token');

    // Or if using Authorization header, client should remove the token
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Error during logout" });
  }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "O email é obrigatório"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Por favor, forneça um email válido"
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "Se o email estiver cadastrado, você receberá um link de redefinição"
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiresAt = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        try {
            const resetUrl = `${process.env.APP_ORIGIN}/reset-password/${resetToken}`;
            await emailService.sendPasswordResetEmail(user.email, resetUrl);
        } catch (emailError) {
            console.warn("AVISO: E-mail de reset não pôde ser enviado:", emailError.message);
            // Não reverte o token - o usuário ainda pode usar o link manualmente
        }

        return res.status(200).json({
            success: true,
            message: "Se o email estiver cadastrado, você receberá um link de redefinição",
            // EM DESENVOLVIMENTO: Mostrar o token diretamente
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });

    } catch (error) {
        console.error("Erro em forgotPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Ocorreu um erro interno. Por favor, tente novamente mais tarde."
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token de redefinição inválido ou expirado"
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        // Tenta enviar e-mail de sucesso, mas não bloqueia
        try {
            await emailService.sendResetSuccessEmail(user.email);
        } catch (emailError) {
            console.warn("AVISO: E-mail de sucesso não pôde ser enviado:", emailError.message);
        }

        res.status(200).json({
            success: true,
            message: "Redefinição de senha bem-sucedida"
        });
    } catch (error) {
        console.log("Erro em resetPassword ", error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if(!user){
      return res.status(400).json({success: false, message: "Usuário não encontrado"});
    }

    res.status(200).json({success: true, user});

  }catch(error){
    console.log("Error in checkAuth", error);
    res.status(400).json({success: false, message: error.message});
  }
}
