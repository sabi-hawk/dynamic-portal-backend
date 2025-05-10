// routes/studentRouter.ts
import express from "express";
import { addStudent, getAllStudents } from "@controllers/student";

const router = express.Router();

router.post("/add", addStudent);
router.get("/", getAllStudents);

export default router;