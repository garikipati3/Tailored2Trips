const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const signupController = async (req, res) => {
  const { name, email, password, Role } = req.body;

  if (!name || !email || !password || !Role) {
    return sendResponse(res, {
      status: 400,
      success: false,
      message: "All fields (name, email, password, role) are required.",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, Role },
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, role: newUser.Role, email: newUser.email },
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
        name: newUser.name,
        email: newUser.email,
        role: newUser.Role,
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
