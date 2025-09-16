// routes/authRoutes.js
// Lưu ý: Tất cả các endpoint đều bắt đầu bằng /api/auth (ví dụ: /api/auth/login, /api/auth/forgot-password)
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  profile,
  verifyOtp
} = require("../controllers/authController");
// ...existing code...
const { protect } = require("../middleware/authMiddleware"); // giả sử bạn có middleware

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post("/register", register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post("/login", login);
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Gửi OTP về email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP đã gửi về email
 */
router.post("/forgot-password", forgotPassword);
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đổi mật khẩu bằng OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.post("/reset-password", resetPassword);
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Xác thực OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP hợp lệ
 */
router.post("/verify-otp", verifyOtp);
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin user
 */
router.get("/profile", protect, profile);

module.exports = router;
