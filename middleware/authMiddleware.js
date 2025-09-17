const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Xác thực token và gán user vào req
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized, no token. Vui lòng gửi header Authorization: Bearer <accessToken>",
    });
  }
};

// Chỉ cho phép Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Require admin role" });
  }
};

module.exports = { protect, isAdmin };
