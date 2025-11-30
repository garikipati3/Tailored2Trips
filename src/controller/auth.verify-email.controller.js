const { sendResponse } = require("../utils/sendResponse");

const verifyEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, {
      status: 400,
      success: false,
      message: "Email is required.",
    });
  }

  // OTP disabled
  return sendResponse(res, {
    status: 200,
    success: true,
    message: "OTP verification disabled for local development.",
  });
};

module.exports = verifyEmail;
