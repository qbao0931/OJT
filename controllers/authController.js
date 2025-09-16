// Xác thực OTP riêng biệt
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpExpires) {
    return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
  }
  if (user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP đã hết hạn" });
  }
  const isMatch = await bcrypt.compare(otp.toString(), user.otp);
  if (!isMatch) return res.status(400).json({ message: "OTP không hợp lệ" });
  res.json({ message: "OTP hợp lệ" });
};
// controller/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../config/email");

// sinh token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password -> gửi OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    // Best practice: trả về message chung để không leak existence of account
    if (!user) {
      return res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });
    }

    // tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hash OTP trước khi lưu
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // gửi email
    const subject = "Mã OTP đặt lại mật khẩu";
    const text = `Mã OTP của bạn là: ${otp}. Hết hạn sau 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`;
    const html = `
      <p>Xin chào,</p>
      <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
      <p>Hết hạn sau 10 phút.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `;

    const { info, previewUrl } = await sendEmail({ to: email, subject, text, html });

    // Nếu dùng ethereal, gửi preview URL cho dev dễ kiểm tra
    if (previewUrl) {
      console.log("Preview URL: ", previewUrl);
    }

    return res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reset password bằng OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });
    if (!otp) return res.status(400).json({ message: "Missing otp" });
    if (!newPassword) return res.status(400).json({ message: "Missing newPassword" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

  // Log để debug OTP
  console.log("OTP nhập:", otp);
  console.log("OTP hash:", user.otp);
  const isMatch = await bcrypt.compare(otp.toString(), user.otp);
  if (!isMatch) return res.status(400).json({ message: "OTP không hợp lệ" });

    // đặt mật khẩu mới (pre-save hook trên model sẽ hash)
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // (tuỳ chọn) trả token mới để auto-login sau reset
    const token = generateToken(user._id);

    res.json({ message: "Đổi mật khẩu thành công", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profile (ví dụ)
exports.profile = async (req, res) => {
  res.json(req.user);
};
