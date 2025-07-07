import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

const companyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is a company
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "company") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Company access only." });
    }

    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };
    next();
  } catch (error) {
    console.error("Error in companyAuth middleware:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default companyAuth; 