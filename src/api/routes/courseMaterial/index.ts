import { Router } from "express";
// @ts-ignore
import multer from "multer";
import path from "path";
import * as materialController from "@controllers/courseMaterial";
import { uploadMaterial } from "@middlewares/fileUploader";
import { authenticateJwt } from "@middlewares/auth";

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const dest = path.join(__dirname, "../../../../uploads");
    require("fs").mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req: any, file: any, cb: any) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

// Secure all course material routes
router.use(authenticateJwt);

router.post("/", uploadMaterial.single("file"), materialController.uploadMaterial);
router.get("/", materialController.listMaterials);
router.delete("/:id", materialController.deleteMaterial);

export default router;
