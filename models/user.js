const mongoose = require("mongoose");
const mockInterviewSchema = new mongoose.Schema({
  title: String,              
  role: String, 
  difficulty: String,              
  score: Number,               
  feedback: String,            
  createdAt: {
    type: Date,
    default: Date.now,
  },
  questions: [
    {
      question: String,
      answer: String,
    },
  ],
});
const RoadmapPhaseSchema = new mongoose.Schema({
  id: Number,
  phase: String,
  duration: String,
  skills: [String],
  tools: [String],
  outcome: String,
  completed: { type: Boolean, default: false },
});
const RoadmapSchema = new mongoose.Schema(
  {
    role: String,
    level: String,
    duration: String,
    createdAt: {
    type: Date,
    default: Date.now,
  },
    phases: [RoadmapPhaseSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
college: {
  type: String,
  default: "",
},
course: {
  type: String,
  default: "",
},
  targetRole: {
    type: String,
    default: "",
  },
  resume: {
  fileUrl: { type: String, default: "" },
  score: { type: Number, default: 0 },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  analyzedAt: { type: Date },
  previousScore: { type: Number, default: null },
  previousAnalyzedAt: { type: Date },
},

  mockInterviews: [mockInterviewSchema],
  roadmap: RoadmapSchema,
});
module.exports = mongoose.model("User", userSchema);