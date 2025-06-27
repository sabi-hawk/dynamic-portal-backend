import cron from "node-cron";
import LeaveRequest from "@models/LeaveRequest";
import { getIsoWeekRange } from "./date";

/**
 * Removes leave-requests whose weekRange has already passed. It executes every
 * Monday at 01:00 AM server time (after the week has rolled over) to keep the
 * collection small.  Rather than hard-deleting we can also mark them archived;
 * however the requirement explicitly mentions deletion to keep the system lean.
 */
export const scheduleWeeklyLeaveCleanup = () => {
  cron.schedule("0 1 * * 1", async () => {
    const currentWeek = getIsoWeekRange();
    await LeaveRequest.deleteMany({
      "weekRange.end": { $lt: currentWeek.start },
    });

    console.log("[CRON] Leave cleanup completed");
  });
};
