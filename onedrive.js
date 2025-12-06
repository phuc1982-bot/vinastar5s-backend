const fs = require("fs");
const axios = require("axios");
const path = require("path");   // ⚠️ BẮT BUỘC CÓ
require("dotenv").config();

// ========================
// ENV FROM RAILWAY
// ========================
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TENANT_ID = process.env.TENANT_ID;

// ========================
// GET ACCESS TOKEN
// ========================
async function getAccessToken() {
    const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("grant_type", "client_credentials");

    const res = await axios.post(url, params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return res.data.access_token;
}

// ========================
// UPLOAD FILE TO ONEDRIVE
// ========================
async function uploadToOneDrive(filePath, folderName) {
    const token = await getAccessToken();

    const fileName = path.basename(filePath);
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${fileName}:/content`;

    const fileBuffer = fs.readFileSync(filePath);

    const res = await axios.put(uploadUrl, fileBuffer, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/octet-stream"
        }
    });

    return res.data;
}

module.exports = uploadToOneDrive;
