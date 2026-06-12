export type StudentStatus = "active" | "on-leave" | "graduated" | "dropped";

export interface Student extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: StudentStatus;
  enrolledAt: string;
  program: string;
  nationality: string;
}

export interface StudentsFetchResponse {
  data: Student[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}
