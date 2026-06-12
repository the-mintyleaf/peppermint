import type { Student, StudentsFetchResponse } from "./students.types";
import type { QueryParams } from "@zetsel/admin";
import { v4 as uuidv4 } from "uuid";

let mockStudents: Student[] = [
  {
    id: "1",
    fullName: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-234-567-8900",
    status: "active",
    enrolledAt: "2023-09-01",
    program: "Business Administration",
    nationality: "American",
  },
  {
    id: "2",
    fullName: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-234-567-8901",
    status: "active",
    enrolledAt: "2023-09-01",
    program: "Computer Science",
    nationality: "Canadian",
  },
  {
    id: "3",
    fullName: "Carol Davis",
    email: "carol@example.com",
    phone: "+1-234-567-8902",
    status: "on-leave",
    enrolledAt: "2022-09-01",
    program: "Business Administration",
    nationality: "American",
  },
  {
    id: "4",
    fullName: "David Wilson",
    email: "david@example.com",
    phone: "+1-234-567-8903",
    status: "graduated",
    enrolledAt: "2021-09-01",
    program: "Engineering",
    nationality: "British",
  },
  {
    id: "5",
    fullName: "Emma Brown",
    email: "emma@example.com",
    phone: "+1-234-567-8904",
    status: "active",
    enrolledAt: "2023-09-01",
    program: "Marketing",
    nationality: "Australian",
  },
  {
    id: "6",
    fullName: "Frank Miller",
    email: "frank@example.com",
    phone: "+1-234-567-8905",
    status: "dropped",
    enrolledAt: "2023-01-15",
    program: "Finance",
    nationality: "German",
  },
  {
    id: "7",
    fullName: "Grace Lee",
    email: "grace@example.com",
    phone: "+1-234-567-8906",
    status: "active",
    enrolledAt: "2023-09-01",
    program: "Computer Science",
    nationality: "Chinese",
  },
  {
    id: "8",
    fullName: "Henry Chen",
    email: "henry@example.com",
    phone: "+1-234-567-8907",
    status: "active",
    enrolledAt: "2023-09-01",
    program: "Business Administration",
    nationality: "Singaporean",
  },
];

export async function fetchStudents(params?: QueryParams): Promise<StudentsFetchResponse> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const search = params?.search || "";
  const status = params?.filters?.status;

  let filtered = mockStudents;

  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    meta: {
      total: filtered.length,
      page,
      pageSize,
    },
  };
}

export async function createStudent(values: Partial<Student>): Promise<Student> {
  const newStudent: Student = {
    id: uuidv4(),
    fullName: values.fullName || "",
    email: values.email || "",
    phone: values.phone || "",
    status: values.status || "active",
    enrolledAt: values.enrolledAt || new Date().toISOString().split("T")[0],
    program: values.program || "",
    nationality: values.nationality || "",
  };
  mockStudents = [newStudent, ...mockStudents];
  return newStudent;
}

export async function updateStudent(id: string, values: Partial<Student>): Promise<Student> {
  const index = mockStudents.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Student not found");

  const updated = { ...mockStudents[index], ...values, id };
  mockStudents[index] = updated;
  return updated;
}

export async function deleteStudent(id: string): Promise<void> {
  mockStudents = mockStudents.filter((s) => s.id !== id);
}
