// routes/studentRouter.ts
import express from "express";
import * as studentController from "@controllers/student";

const studentRouter = express.Router();

studentRouter.post("/add", studentController.addStudent);
studentRouter.get("/", studentController.getStudents);
studentRouter.put("/:id", studentController.updateStudent);
studentRouter.delete("/:id", studentController.deleteStudent);

export default studentRouter;