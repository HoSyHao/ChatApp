import { get } from "mongoose";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getMessages, uploadFile } from "../controllers/MessageController.js";
import { Router } from "express";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files" });

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  (req, res, next) => {
    console.log(req.file); // Kiểm tra thông tin file
    next();
  },
  uploadFile
);

export default messagesRoutes;
