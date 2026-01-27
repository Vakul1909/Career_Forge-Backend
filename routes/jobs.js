const express = require("express");
const auth = require("../middleware/auth");
const Job = require("../models/job");
const router = express.Router();
router.post("/save", auth, async (req, res) => {
  try {
    const exists = await Job.findOne({
      title: req.body.title,
      company: req.body.company,
      user: req.user._id
    });
    if (exists) {
      return res.status(400).json({ msg: "Job already saved" });
    }
    const job = await Job.create({
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      applyLink: req.body.applyLink,
      user: req.user._id
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ msg: "Failed to save job" });
  }
});
router.get("/saved", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id })
      .sort({ savedAt: -1 });

    res.json(jobs);
  } catch {
    res.status(500).json({ msg: "Failed to load saved jobs" });
  }
});
router.delete("/saved/:id", auth, async (req, res) => {
  try {
    await Job.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    res.json({ msg: "Job removed" });
  } catch {
    res.status(500).json({ msg: "Failed to remove job" });
  }
});
module.exports = router;