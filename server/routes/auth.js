import express from "express";
import {
  login,
  logout,
  register,
  googleAuth,
  sendCode,
  checkCode,
  passwordReset
} from "../controllers/auth.js";
import { rateLimiter } from "../connection/middlewares.js"

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/google", googleAuth);

router.post("/send-code", rateLimiter, sendCode);
router.post("/check-code", rateLimiter, checkCode);
router.post("/password-reset", rateLimiter, passwordReset);

export default router;
