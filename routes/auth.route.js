import express from "express";
import {
    logIn,
    logOut,
    signUp,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth,
    resendVerificationCode  // ← ADICIONE ESTA IMPORTACAO
} from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signUp);
router.post("/login", logIn);
router.get("/logout", verifyToken, logOut);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode); // ← NOVA ROTA
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
