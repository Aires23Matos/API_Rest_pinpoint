import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";
import { User } from "../models/user.models.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export const signUp = async (req, res) => {
    const {email, password,name } = req.body;

    try{
        if(!email || !password || !name){
            throw new Error('All fields are required');
        }
        const userAlreadyExists = await User.findOne({email});
        console.log("userAlreadyExists", userAlreadyExists)

        if(userAlreadyExists){
            return res.status(400).json({success:false, message: 'O usuário já existe'})
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = generateVerificationCode();

        const user = new User({
          email,
          password: hashedPassword,
          name,
          verificationToken,
          verificationTokenExpireAt: Date.now() + 24 * 60 *60 *1000
        });

        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id);
        sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
          success: true,
          message: "Usuário criado com sucesso",
          user: {
            ...user._doc,
            password:undefined
          }
        })
    }catch(error){
        res.status(400).json({success: false, message: error.message})
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

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "E-mail verificado com sucesso",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Erro do servidor durante a verificação",
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

  // 1. Validação do input
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "O email é obrigatório"
    });
  }

  // Verificação simples do formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Por favor, forneça um email válido"
    });
  }

  try {
    // 2. Buscar usuário
    const user = await User.findOne({ email });

    if (!user) {
      // Não revelar que o email não existe por questões de segurança
      return res.status(200).json({
        success: true,
        message: "Se o email estiver cadastrado, você receberá um link de redefinição"
      });
    }

    // 3. Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = Date.now() + 3600000; // 1 hora

    // 4. Atualizar usuário
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // 5. Enviar email
    try {
      const resetUrl = `${process.env.APP_ORIGIN}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);

      return res.status(200).json({
        success: true,
        message: "Se o email estiver cadastrado, você receberá um link de redefinição"
      });
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);

      // Reverter em caso de falha no email
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Erro ao enviar email de redefinição. Por favor, tente novamente mais tarde."
      });
    }
  } catch (error) {
    console.error("Erro em forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Ocorreu um erro interno. Por favor, tente novamente mais tarde."
    });
  }
};

export const resetPassword = async(req, res) => {
  try{
    const {token} = req.params;
    const {password} = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: {$gt: Date.now()},
    });

    if(!user){
      return res.status(400).json({success: false, message: "Token de redefinição inválido ou expirado"});
    }

    //update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({success: true, message: "Redefinição de senha bem-sucedida"})
  }catch(error){
    console.log("Erro em resetPassword ", error);
    res.status(400).json({success: false, message: error.message});
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
