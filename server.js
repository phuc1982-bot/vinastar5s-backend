// ============================
// 5) UPLOAD ẢNH (ĐÃ FIX CHUẨN RAILWAY)
// ============================

// Giới hạn 5MB / ảnh để Railway không kill process
const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("image");

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

            const result = await uploadToDrive(file.path, file.originalname);

            res.json({
                status: "OK",
                driveId: result.id,
                driveName: result.name
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ status: "ERROR", message: e.message });
        }
    });
});
