import multer from "multer";
import path from "path";
import fs from "fs";

// @ts-ignore
const createStorage = (destinationPath) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(__dirname, `../../../uploads/${destinationPath}`);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};

export const uploadLogo = multer({ storage: createStorage("logos") });
export const uploadMaterial = multer({ storage: createStorage("materials") });
// Add other upload types as needed 