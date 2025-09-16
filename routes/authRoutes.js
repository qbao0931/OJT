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

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp); // Added verify-otp route
router.get("/profile", protect, profile);

module.exports = router;
