// ============================
// IMPORT MODULES
// ============================
const express = require("express");
const cors = require("cors");
const multer = require("multer");   // ← QUAN TRỌNG: phải có
const path = require("path");
const fs = require("fs");

const uploadToDrive = require("./googleDrive"); // file anh đã có

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// ============================
// MULTER STORAGE (LƯU FILE TẠM TRÊN SERVER)
// ============================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// ============================
// 5MB LIMIT CHUẨN RAILWAY
// ============================
const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("image");

// ============================
// API UPLOAD ẢNH
// ============================
app.post("/upload-image", (req, res) => {
    uploadImage(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ status: "ERROR", message: err.message });
        } else if (err) {
            return res.status(500).json({ status: "ERROR", message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ status: "ERROR", message: "Không nhận được file" });
        }

        try {
            const file = req.file;

            // Upload lên Google Drive
            const result = await uploadToDrive(file.path, file.originalname);

            // Trả kết quả cho Flutter
            return res.json({
                status: "OK",
                driveId: result.id,
                driveName: result.name
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({ status: "ERROR", message: e.message });
        }
    });
});

// ============================
// API TEST
// ============================
app.get("/", (req, res) => {
    res.send("Railway backend is running!");
});

// ============================
// START SERVER (Railway cấp PORT)
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running at port " + PORT);
});
