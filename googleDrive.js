const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const KEYFILEPATH = "vinastar5s-c1f99c09db3f.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

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
        media: media,
        fields: "id, name, webViewLink",
    });

    return response.data;
}

module.exports = uploadToDrive;
