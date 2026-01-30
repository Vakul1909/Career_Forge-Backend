require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/user"); 
const aiRoutes = require("./routes/ai");
const resumeRoutes = require("./routes/resumeRoutes"); 
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/resume", resumeRoutes); 
app.get("/", (req, res) => {
  res.json({ message: "CareerForge Backend API is running 🚀" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
