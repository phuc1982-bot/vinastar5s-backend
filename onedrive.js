const fs = require("fs");
const axios = require("axios");

// Lấy ENV + sửa lỗi tự động thêm "="
const CLIENT_ID = (process.env.CLIENT_ID || "").replace(/^=/, "").trim();
const CLIENT_SECRET = (process.env.CLIENT_SECRET || "").replace(/^=/, "").trim();
const TENANT_ID = (process.env.TENANT_ID || "").replace(/^=/, "").trim();

console.log("ENV CHECK =>", { CLIENT_ID, CLIENT_SECRET, TENANT_ID });

async function getAccessToken() {
    const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "client_credentials");

    const res = await axios.post(url, params);
    return res.data.access_token;
}

async function uploadToOneDrive(filePath, folderName) {
    const token = await getAccessToken();

    const fileName = path.basename(filePath);
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${fileName}:/content`;

    const buffer = fs.readFileSync(filePath);

    const res = await axios.put(uploadUrl, buffer, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/octet-stream"
        }
    });

    return res.data;
}

module.exports = uploadToOneDrive;
