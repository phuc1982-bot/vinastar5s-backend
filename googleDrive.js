const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load Google credential từ ENV (Railway Variables)
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

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
        parents: [folderId], // mặc định folderId của anh
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
