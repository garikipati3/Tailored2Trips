require("dotenv").config();
const express = require("express");
const authRouter = require("./routes/auth");
const blogRouter = require("./routes/blog");
const userRouter = require("./routes/user");
const tripRouter = require("./routes/trip");
const itineraryRouter = require("./routes/itinerary");
const budgetRouter = require("./routes/budget");
const placesRouter = require("./routes/places");
const reviewsRouter = require("./routes/reviews");
const messagesRouter = require("./routes/messages");
const notificationsRouter = require("./routes/notifications");
const weatherRouter = require("./routes/weather");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sendResponse } = require("./utils/sendResponse");

const app = express();
const PORT = process.env.PORT || 3000;

const FE_URL = process.env.FE_URL || "http://localhost:5173";
const allowedOrigins = [FE_URL, "http://localhost:5173", "http://localhost:5175"];
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
app.use("/api/user", userRouter);
app.use("/api/trip", tripRouter);
app.use("/api/itinerary", itineraryRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/places", placesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/weather", weatherRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
