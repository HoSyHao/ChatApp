import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.KEY, { expiresIn: maxAge });
};

export const signin = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is Required.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return response.status(404).json({
        status: false,
        message: "User is not registered",
      });
    }

    
    console.log("Password entered by user:", password); 

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return response
        .status(400)
        .json({ status: false, message: "Password is incorrect" });
    }
    console.log("User password from DB:", validPassword);
    const token = createToken(email, user.id);

    response.cookie("token", token, {
      maxAge,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Cho phép cookie giữa các domain khác nhau
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    return response.status(200).json({
      status: true,
      message: "login successfully",
      token,
      users: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const signup = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response
        .status(400)
        .json({ status: false, message: "Email already registered" });
    }

    if (!email || !password) {
      return response.status(400).send("Email and Password is required");
    }
    const user = await User.create({ email, password });
    response.cookie("token", createToken(email, user.id), {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return response.status(201).json({
      status: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const forgotPassword = async (request, response) => {
  const { email } = request.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return response.json({ status: false, message: "user not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "5m",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bloodarmour1@gmail.com",
        pass: "fwso qkxw sfds joxp",
      },
    });

    var mailOptions = {
      from: "bloodarmour1@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/resetPassword/${token}`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        return response.json({ status: false, message: "error sending email" });
      } else {
        return response.json({ status: true, message: "email sent" });
      }
    });
  } catch (error) {
    console.log(error);
  }
};


// Chưa nhâp mật khẩu mới đã mã hóa vào DB
export const resetPassword = async (request, response) => {
  const { token } = request.params;
  const { password } = request.body;
  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashpassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashpassword });
    return response.json({ status: true, message: "updated password" });
  } catch (error) {
    return response.json("invalid token");
  }
}

export const getAuthenticatedUser = async (request, response) => {
  try {
    const userData = await User.findById(request.user.id);
    if (!userData) {
      return response
        .status(404)
        .json({ status: false, message: "User not found" });
    }
    return response.status(200).json({
      status: true,
      message: "authorized",
      user: request.user,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const logout = async (request, response) => {
  try {
    response.clearCookie("token");
    return response.status(200).json({ status: true });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (request, response) => {
  try {
    const userId = request.user.id;
    if (!userId) {
      return response.status(400).json({
        status: false,
        message: "User ID not found in request",
      });
    }
    const { firstName, lastName, color } = request.body;
    if (!firstName || !lastName) {
      return response.status(400).json({
        status: false,
        message: "First Name, Last Name and Color is required",
      });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, profileSetup: true, color },
      { new: true, runValidators: true }
    );
    return response.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const uploadImage = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Image is required",
      });
    }

    // Tạo tên file và đường dẫn đầy đủ
    const date = Date.now();
    const fileName = "uploads/profiles/" + date + req.file.originalname;

    // Đổi tên và lưu file
    renameSync(req.file.path, fileName);

    const user = await User.findByIdAndUpdate(
      userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Image uploaded successfully",
      image: user.image,
    });
  } catch (error) {
    console.log("Error details:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const removeImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send("User not found");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return res.status(200).send("Image removed successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
