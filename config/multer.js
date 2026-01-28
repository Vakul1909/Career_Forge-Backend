const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "careerforge_resumes",
    resource_type: "raw", 
    allowed_formats: ["pdf", "doc", "docx"],
  },
});
const upload = multer({ storage });
module.exports = upload;
