// ============================
// IMPORT MODULES
// ============================
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadToOneDrive = require("./onedrive");

// ============================
// APP CONFIG
// ============================
const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// ============================
// MULTER STORAGE
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

const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single("image");

// ============================
// API UPLOAD ẢNH → ONEDRIVE
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
            console.log("📥 File received:", req.file);

            const filePath = req.file.path;

            // Upload lên thư mục OneDrive: /5S/
            const result = await uploadToOneDrive(filePath, "5S");

            return res.json({
                status: "OK",
                id: result.id,
                name: result.name,
                link: result.webUrl
            });

        } catch (e) {
            console.error("❌ Upload to OneDrive Error:", e);
            return res.status(500).json({ status: "ERROR", message: e.message });
        }
    });
});

// ============================
// API TEST
// ============================
app.get("/", (req, res) => {
    res.send("Railway backend is running with OneDrive!");
});

// ============================
// START SERVER
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running at port " + PORT);
});
