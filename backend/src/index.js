const express = require("express");
const authRouter = require("./routes/auth");
const blogRouter = require("./routes/blog");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sendResponse } = require("./utils/sendResponse");

const app = express();
const PORT = process.env.PORT || 3000;

const FE_URL = process.env.FE_URL || "http://localhost:5173";
const allowedOrigins = [FE_URL];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", async (req, res) => {
  return sendResponse(res, {
    status: 200,
    success: true,
    message: "Backend is up and running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/blog", blogRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
