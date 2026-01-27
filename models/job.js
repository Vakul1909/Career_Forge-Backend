const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  applyLink: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Job", jobSchema);