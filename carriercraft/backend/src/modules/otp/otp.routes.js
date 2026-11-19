import { Router } from 'express';
import { otpController } from './otp.controller.js';

const router = Router();

// Public Runtime OTP endpoints
router.post('/send', (req, res, next) => otpController.sendOtp(req, res, next));
router.post('/verify', (req, res, next) => otpController.verifyOtp(req, res, next));

export default router;
