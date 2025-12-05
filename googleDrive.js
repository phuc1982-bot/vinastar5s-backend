const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load Google credential từ ENV (Railway Variables)
let raw = process.env.GOOGLE_CREDENTIALS;

if (!raw) {
    throw new Error("GOOGLE_CREDENTIALS is empty or undefined!");
}

raw = raw.trim();

// Xóa ký tự '=' hoặc ký tự BOM đầu nếu có
while (raw.startsWith("=") || raw.startsWith("\uFEFF")) {
    raw = raw.substring(1).trim();
}

const serviceAccount = JSON.parse(raw);

// AUTH chuẩn cho Railway
const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Upload file lên Google Drive
async function uploadToDrive(localFilePath, folderId) {
    const drive = google.drive({ version: "v3", auth });
    const fileName = path.basename(localFilePath);

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        body: fs.createReadStream(localFilePath),
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: "id, name, webViewLink",
    });

    return response.data;
}

module.exports = uploadToDrive;

console.log("ENV First Char:", process.env.GOOGLE_CREDENTIALS?.[0]);
