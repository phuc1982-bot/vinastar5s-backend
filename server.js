const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Tạo thư mục uploads nếu chưa tồn tại
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Test API
app.get("/", (req, res) => {
    res.send("Vinastar 5S Backend đang chạy!");
});

// Upload Excel
app.post("/upload-excel", upload.single("excel"), (req, res) => {
    res.json({
        status: "OK",
        file: req.file
    });
});

// Upload hình
app.post("/upload-image", upload.single("image"), (req, res) => {
    res.json({
        status: "OK",
        file: req.file
    });
});

// Start server
app.listen(port, () => {
    console.log("🚀 Backend Vinastar 5S chạy tại port " + port);
});
