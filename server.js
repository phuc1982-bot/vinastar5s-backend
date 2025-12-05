const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================
// 1) GOOGLE DRIVE SETUP
// ============================

// Load JSON credentials
const KEYFILEPATH = path.join(__dirname, "vinastar5s-c1f99c09db3f.json");

// Tạo OAuth2 client
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ["https://www.googleapis.com/auth/drive.file"]
});

const drive = google.drive({ version: "v3", auth });

// ID thư mục Drive (folder anh gửi)
const DRIVE_FOLDER_ID = "1nlzQwN3kZ9DwtkQnPwU_-f4mC7qE8bnm";

// Hàm upload lên Drive
async function uploadToDrive(localPath, originalName) {
    const fileMeta = {
        name: originalName,
        parents: [DRIVE_FOLDER_ID]
    };

    const media = {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(localPath)
    };

    const response = await drive.files.create({
        resource: fileMeta,
        media: media,
        fields: "id, name"
    });

    return response.data;
}

// ============================
// 2) LOCAL UPLOAD FOLDER SETUP
// ============================

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ============================
// 3) API TEST
// ============================

app.get("/", (req, res) => {
    res.send("Vinastar 5S Backend đang chạy + Google Drive OK!");
});

// ============================
// 4) UPLOAD EXCEL
// ============================

app.post("/upload-excel", upload.single("excel"), async (req, res) => {
    try {
        const file = req.file;

        const result = await uploadToDrive(file.path, file.originalname);

        res.json({
            status: "OK",
            driveId: result.id,
            driveName: result.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "ERROR", message: err.message });
    }
});

// ============================
// 5) UPLOAD ẢNH
// ============================

app.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;

        const result = await uploadToDrive(file.path, file.originalname);

        res.json({
            status: "OK",
            driveId: result.id,
            driveName: result.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "ERROR", message: err.message });
    }
});

// ============================
// 6) START SERVER
// ============================

app.listen(port, () => {
    console.log("🚀 Backend Vinastar 5S chạy tại port " + port);
});
