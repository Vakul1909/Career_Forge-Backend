const express = require("express");
const upload = require("../config/multer");

const router = express.Router();

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: "Resume upload failed" });
  }
});

module.exports = router;
