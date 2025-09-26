const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Port (Render sets this automatically)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1); // Stop app if DB connection fails
});

// Schemas & Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
});

const User = mongoose.model("User", userSchema);
const Score = mongoose.model("Score", scoreSchema);

// Routes
app.get("/", (req, res) => {
  res.send("🔥 Backend is alive and running!");
});

// Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "Username already exists ❌" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: "Signup successful ✅" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    res.json({ message: "Login successful 🎉" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// Submit score
app.post("/score", async (req, res) => {
  const { username, score } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found, please signup first ❌" });
    }

    const newScore = new Score({ username, score });
    await newScore.save();

    res.json({ message: "Score added ✅" });
  } catch (err) {
    console.error("Score submission error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// Get leaderboard (top 10 scores)
app.get("/leaderboard", async (req, res) => {
  try {
    const topScores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(topScores);
  } catch (err) {
    console.error("Leaderboard fetch error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
