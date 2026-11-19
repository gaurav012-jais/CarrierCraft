import { otpService } from './otp.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class OtpController {
  async sendOtp(req, res, next) {
    try {
      const { visitId, phone } = req.body;
      if (!visitId || !phone) {
        return errorResponse(res, 'visitId and phone are required.', 400);
      }
      const result = await otpService.sendOtp({ visitId, phone });
      return successResponse(res, result, 'OTP sent successfully.');
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { visitId, otp } = req.body;
      if (!visitId || !otp) {
        return errorResponse(res, 'visitId and otp are required.', 400);
      }
      const result = await otpService.verifyOtp({ visitId, otp });
      return successResponse(res, result, 'OTP verified successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const otpController = new OtpController();
