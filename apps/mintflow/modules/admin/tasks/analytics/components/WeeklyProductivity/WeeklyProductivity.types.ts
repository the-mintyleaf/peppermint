import type { ProductivityDay } from "../../taskAnalytics.types";

export interface WeeklyProductivityProps {
  data: ProductivityDay[];
  taskCount: number;
}
