import { Router } from "express";

const authRoutes = Router();
import {
  forgotPassword,
  getAuthenticatedUser,
  logout,
  resetPassword,
  signin,
  signup,
  updateProfile,
  uploadImage,
  removeImage,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signup);

authRoutes.post("/signin", signin);

authRoutes.get("/verify", verifyToken, getAuthenticatedUser);

authRoutes.post("/forgot-password", forgotPassword);

authRoutes.post("/reset-password/:token", resetPassword);

authRoutes.get("/logout", logout);

authRoutes.post("/update-profile", verifyToken, updateProfile);

authRoutes.post(
  "/upload-image",
  verifyToken,
  upload.single("profile-image"),
  uploadImage
);

authRoutes.delete("/remove-image", verifyToken, removeImage);

export { authRoutes };
