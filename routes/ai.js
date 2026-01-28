const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const router = express.Router();
router.post("/resume-analyze", auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content =
      response.data?.choices?.[0]?.message?.content || "No response";
    res.json({ result: content });
  } catch (err) {
    console.error("Resume analysis failed:", err.response?.data || err.message);
    res.status(500).json({ message: "Resume analysis failed" });
  }
});
router.post("/mock-interview", auth, async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    if (!role || !difficulty) {
      return res
        .status(400)
        .json({ message: "Role and difficulty are required" });
    }
    const prompt = `
You are an AI interviewer.
Generate EXACTLY 5 interview questions.
Rules:
- Questions 1, 2, 3 → Technical (role-based)
- Questions 4, 5 → HR based
- Difficulty: ${difficulty}
- Role: ${role}
Return in EXACT format:
Question 1: ...
Question 2: ...
Question 3: ...
Question 4: ...
Question 5: ...
`;
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content =
      response.data?.choices?.[0]?.message?.content || "";
    res.json({ result: content });
  } catch (err) {
    console.error(
      "Mock interview generation failed:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message: "Mock interview generation failed",
    });
  }
});
router.post("/mock-evaluate", auth, async (req, res) => {
  try {
    const { questions, answers } = req.body;
    if (!questions || !answers || questions.length !== answers.length) {
      return res.status(400).json({
        message: "Questions and answers are required and must match",
      });
    }
    const combined = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q}\nA: ${answers[i] || "(Skipped)"}`
      )
      .join("\n\n");
    const prompt = `
Evaluate candidate answers.
Rules:
- Total questions = ${questions.length}
- Skipped answer = -2 marks
- Base score = 10
Return STRICT format:
Score: X/10
Strengths:
- point
Weaknesses:
- point
Suggestions:
- advice
Responses:
${combined}
`;
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content =
      response.data?.choices?.[0]?.message?.content || "No response";
    res.json({ result: content });
  } catch (err) {
    console.error(
      "Mock interview evaluation failed:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message: "Mock interview evaluation failed",
    });
  }
});
router.post("/search", auth, async (req, res) => {
  try {
    const { role, location } = req.body;
    if (!role || !location) {
      return res.status(400).json({ message: "Role and location required" });
    }
    const url = `https://jsearch.p.rapidapi.com/search?query=${role} in ${location}&country=IN&page=1&num_pages=2`;
    const response = await axios.get(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error("Job search failed:", err.response?.data || err.message);
    res.status(500).json({ message: "Job search failed" });
  }
});
router.post("/roadmap", auth, async (req, res) => {
  try {
    const { role, level, duration } = req.body;
    if (!role || !level || !duration) {
      return res.status(400).json({ message: "All fields required" });
    }
    const prompt = `
Generate a structured learning roadmap.
Role: ${role}
Level: ${level}
Duration: ${duration}
Rules:
- Divide roadmap into 6 phases
- Each phase must include:
  - phase
  - duration
  - skills (array)
  - tools (array)
  - outcome
Return ONLY valid JSON in this format:
{
  "roadmap": [
    {
      "phase": "",
      "duration": "",
      "skills": [],
      "tools": [],
      "outcome": ""
    }
  ]
}
`;
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content = response.data.choices[0].message.content;
    res.json({ result: content });
  } catch (err) {
    console.error("Roadmap generation failed:", err.response?.data || err.message);
    res.status(500).json({ message: "Roadmap generation failed" });
  }
});
module.exports = router;