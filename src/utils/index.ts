import Student from "@models/Student";
import Teacher from "@models/Teacher";

// Utility to get the correct instituteId for a user
export async function getInstituteId(userId: string, role: string) {
  if (!userId || typeof userId !== "string") throw new Error("userId is required");
  if (role === "admin") {
    return userId;
  } else if (role === "student") {
    const student = await Student.findById(userId);
    if (student) return student.instituteId;
    throw new Error("Student profile not found");
  } else if (role === "teacher") {
    const teacher = await Teacher.findById(userId);
    if (teacher) return teacher.instituteId;
    throw new Error("Teacher profile not found");
  }
  throw new Error("Unknown user role");
}
