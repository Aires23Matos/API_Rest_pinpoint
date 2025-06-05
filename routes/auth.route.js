import express from "express";
import { logIn, logOut, signUp } from "../controller/auth.controller.js";

const router = express.Router();

router.get("/signup", signUp);

router.get("/login",  logIn);

router.get("/logout", logOut);

export default router;
