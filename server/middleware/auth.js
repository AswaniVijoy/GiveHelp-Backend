import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function authenticate(req, res, next) {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }
    if (!token) {
      token = req.cookies?.authToken;
    }
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.name = decoded.UserName;
    req.role = decoded.UserRole;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired. Please login again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    return res.status(500).json({ msg: "Authentication failed" });
  }
}

function isAdmin(req, res, next) {
  if (req.role === "Admin") {
    return next();
  }
  return res.status(403).json({ msg: "You are not allowed" });
}

export { authenticate, isAdmin };
