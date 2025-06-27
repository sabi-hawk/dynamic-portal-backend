declare module "node-cron" {
  import { ScheduleOptions } from "node:";
  type TaskCallback = () => void | Promise<void>;

  export function schedule(
    expression: string,
    callback: TaskCallback,
    options?: ScheduleOptions
  ): Task;

  export interface Task {
    start: () => void;
    stop: () => void;
    destroy: () => void;
    running: () => boolean;
  }

  export function validate(expression: string): boolean;
}
