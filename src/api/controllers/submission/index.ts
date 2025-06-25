import { Request, Response } from "express";
import Submission from "@models/Submission";
import SubmissionUpload from "@models/SubmissionUpload";
import CourseSchedule from "@models/CourseSchedule";
import Student from "@models/Student";
import { httpMethod, HttpError } from "..";

// Teacher: create submission
export const createSubmission = httpMethod(
  async (req: Request, res: Response) => {
    const { title, description, startDate, endDate, courseScheduleId } =
      req.body;
    const teacherId = req.user?.id;

    if (!title || !startDate || !endDate || !courseScheduleId) {
      throw new HttpError(400, "Missing required fields");
    }

    // Verify schedule exists & belongs to teacher (optional check)
    const schedule = await CourseSchedule.findById(courseScheduleId);
    if (!schedule) {
      throw new HttpError(404, "Course schedule not found");
    }

    const submission = await Submission.create({
      courseSchedule: courseScheduleId,
      title,
      description,
      startDate,
      endDate,
      createdBy: teacherId,
    });

    res.status(201).json(submission);
  }
);

// Teacher: list their submissions
export const listTeacherSubmissions = httpMethod(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const subs = await Submission.find({ createdBy: teacherId })
      .populate("courseSchedule", "course section")
      .sort({ createdAt: -1 });
    res.status(200).json(subs);
  }
);

// Teacher: get uploads for a submission
export const getSubmissionUploads = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params; // submission id
    const uploads = await SubmissionUpload.find({ submission: id }).populate({
      path: "student",
      select: "rollNo section userId",
      populate: { path: "userId", select: "name email" },
    });
    res.status(200).json(uploads);
  }
);

// Student: list active submissions for their courses
export const listStudentSubmissions = httpMethod(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const student = await Student.findOne({ _id: studentId });
    if (!student) throw new HttpError(404, "Student not found");

    const now = new Date();
    const schedules = await CourseSchedule.find({
      section: student.section,
      status: "active",
    }).select("_id course");
    const scheduleIds = schedules.map((s) => s._id);

    const submissions = await Submission.find({
      courseSchedule: { $in: scheduleIds },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("courseSchedule", "course section")
      .sort({ endDate: 1 });

    res.status(200).json(submissions);
  }
);

// Student: upload submission file
export const uploadStudentSubmission = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params; // submission id
    const studentId = req.user?.id;
    if (!req.file) throw new HttpError(400, "File is required");

    const submission = await Submission.findById(id);
    if (!submission) throw new HttpError(404, "Submission not found");

    const now = new Date();
    if (now < submission.startDate || now > submission.endDate) {
      throw new HttpError(400, "Submission window closed");
    }

    // Upsert upload entry (one file per student per submission)
    const uploadData = {
      submission: id,
      student: studentId,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      uploadedAt: new Date(),
    };

    const upload = await SubmissionUpload.findOneAndUpdate(
      { submission: id, student: studentId },
      uploadData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(upload);
  }
);

// Student: get own upload for a submission
export const getOwnSubmissionUpload = httpMethod(
  async (req: Request, res: Response) => {
    const { id } = req.params; // submission id
    const studentId = req.user?.id;

    const upload = await SubmissionUpload.findOne({
      submission: id,
      student: studentId,
    });
    if (!upload) {
      res.status(200).json(null);
      return;
    }
    res.status(200).json(upload);
  }
);
