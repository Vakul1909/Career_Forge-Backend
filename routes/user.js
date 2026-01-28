const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/user");
const router = express.Router();
const extractScore = (rawScore) => {
  if (typeof rawScore === "number") return rawScore;

  if (typeof rawScore === "string") {
    const match = rawScore.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  return 0;
};
const cleanMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")    
    .replace(/#+\s?/g, "")  
    .trim();
};

const upload = require("../config/multer");

router.post(
  "/resume",
  auth,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { score, strengths, weaknesses, analyzedAt } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Resume file missing" });
      }

      const resumeUrl = req.file.path;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const parsedScore = Math.min(100, Math.max(0, extractScore(score)));

      if (user.resume?.score !== undefined) {
        user.resume.previousScore = user.resume.score;
        user.resume.previousAnalyzedAt = user.resume.analyzedAt;
      }

      user.resume = {
        fileUrl: resumeUrl,
        score: parsedScore,
        strengths: JSON.parse(strengths).map(cleanMarkdown),
        weaknesses: JSON.parse(weaknesses).map(cleanMarkdown),
        analyzedAt: analyzedAt ? new Date(analyzedAt) : new Date(),
        previousScore: user.resume?.previousScore,
        previousAnalyzedAt: user.resume?.previousAnalyzedAt,
      };

      await user.save();
      res.json(user.resume);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Resume upload failed" });
    }
  }
);
router.put("/profile", auth, async (req, res) => {
  try {
    const { phone, college, course, targetRole } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone, college, course, targetRole },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/dashboard", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      resume: user.resume || null,
      mockInterviews: user.mockInterviews || [],
      roadmap: user.roadmap || null,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/resume", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.resume || null);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/mock-interviews", auth, async (req, res) => {
  try {
    const { title, role, difficulty, score, feedback, questions } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.mockInterviews.push({
      title,
      role,
      difficulty,
      score,
      feedback,
      questions,
      createdAt: new Date(),
    });
    await user.save();
    res.json({ message: "Mock interview saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save interview" });
  }
});
router.get("/mock-interviews", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.mockInterviews || []);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/mock-interviews/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const interview = user.mockInterviews.id(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.json(interview);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
router.delete("/mock-interviews/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const interview = user.mockInterviews.id(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    interview.deleteOne(); 
    await user.save();
    res.json({ message: "Mock interview deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete interview" });
  }
});
router.post("/roadmap", auth, async (req, res) => {
  try {
    const { role, level, duration, phases } = req.body;
    const user = await User.findById(req.user.id);
    user.roadmap = {
      role,
      level,
      duration,
      createdAt: new Date(),
      phases: phases.map(p => ({
        ...p,
        completed: false, 
      })),
    };
    await user.save();
    res.json(user.roadmap);
  } catch (err) {
    res.status(500).json({ message: "Failed to save roadmap" });
  }
});
router.get("/roadmap", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.roadmap || null);
  } catch {
    res.status(500).json({ message: "Failed to fetch roadmap" });
  }
});
router.patch("/roadmap/phase", auth, async (req, res) => {
  const { phaseId } = req.body;
  const user = await User.findById(req.user.id);
  if (!user || !user.roadmap) {
    return res.status(404).json({ message: "Roadmap not found" });
  }
  const phaseIndex = user.roadmap.phases.findIndex(
    (p) => p.id === phaseId
  );
  if (phaseIndex === -1) {
    return res.status(400).json({ message: "Invalid phase" });
  }
  const isNowCompleted = !user.roadmap.phases[phaseIndex].completed;
  user.roadmap.phases.forEach((phase, index) => {
    if (index === phaseIndex) {
      phase.completed = isNowCompleted;
    }
    if (index > phaseIndex && !isNowCompleted) {
      phase.completed = false;
    }
  });
  await user.save(); 
  res.json({ roadmap: user.roadmap });
});
module.exports = router;