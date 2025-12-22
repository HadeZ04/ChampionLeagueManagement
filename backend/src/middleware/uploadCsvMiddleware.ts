import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const mimetype = file.mimetype;
        const ext = path.extname(file.originalname).toLowerCase();

        const isCsvMime =
            mimetype === "text/csv" ||
            mimetype === "application/vnd.ms-excel";

        const isCsvExt = ext === ".csv";

        if (isCsvMime || isCsvExt) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
});

export const uploadCsv = upload.single("file");
