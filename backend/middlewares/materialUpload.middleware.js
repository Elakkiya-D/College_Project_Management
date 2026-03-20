const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure material_uploads directory exists (separate from assignments)
const materialUploadDir = path.join(__dirname, "../uploads/materials");
if (!fs.existsSync(materialUploadDir)) {
  fs.mkdirSync(materialUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, materialUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'material-' + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, "_"));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  }
});

module.exports = upload;
