import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res
          .status(401)
          .json({ status: false, message: "You are not logged in" });
      }
      const decoded =  jwt.verify(token, process.env.KEY);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
      //Attach user information to the request object
      req.user = {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      };
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Token verification error:", error); // Log lỗi nếu có
      return res.status(401).json({ status: false, message: "invalid token" });
    }
  };
