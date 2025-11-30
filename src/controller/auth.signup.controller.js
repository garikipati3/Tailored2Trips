const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const signupController = async (req, res) => {
  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password) {
    return sendResponse(res, {
      status: 400,
      success: false,
      message: "Username, email, and password are required.",
    });
  }

  try {
    // Check if user already exists by email or username
    const existingUser = await prisma.appUser.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return sendResponse(res, {
        status: 400,
        success: false,
        message: `User with this ${field} already exists.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.appUser.create({
      data: { 
        username, 
        email, 
        passwordHash: hashedPassword, 
        fullName: fullName || null,
        isActive: true
      },
    });

    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email,
        fullName: newUser.fullName
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, {
      status: 201,
      success: true,
      message: "User registered successfully.",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = signupController;
