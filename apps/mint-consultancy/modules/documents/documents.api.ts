import { v4 as uuidv4 } from "uuid";
import type {
  CreateDocumentInput,
  Document,
  DocumentWorkspaceSummary,
  PrintLog,
  PrintLogSnapshot,
  Signature,
  StudentFullData,
  UpdateDocumentInput,
} from "./documents.types";

let mockDocuments: Document[] = [
  {
    id: "doc-cert-1",
    studentId: "1",
    type: "student-certificate",
    label: "Certificate",
    content: {
      issue: "2024-03-15",
      issueDate: "2024-03-15",
      studyType: 0,
      instructorId: "sig-1",
      directorId: "sig-2",
      studentName: "Alice Johnson",
      program: "Business Administration",
      nationality: "American",
      firstname: "Alice",
      middlename: "",
      lastname: "Johnson",
      date_of_birth: "2000-05-15",
      gender: "Female",
      address: "123 Main St, Springfield, USA",
      date_of_admission: "2023-09-01",
      date_of_completion: "2024-03-15",
      coursehour: 480,
      grammar: "A",
      listening: "A-",
      conversation: "B+",
      reading: "A",
      composition: "A-",
      batch: {
        course: {
          name: "Japanese Language",
          level: "N4",
          total_days: 120,
          books: [{ name: "Minna no Nihongo I" }],
        },
        instructor: [],
      },
      marking: [
        {
          month: "January",
          total_days: 20,
          class_hr: 80,
          present: 18,
          absent: 2,
          attendance_percentage: "90%",
        },
        {
          month: "February",
          total_days: 18,
          class_hr: 72,
          present: 17,
          absent: 1,
          attendance_percentage: "94%",
        },
      ],
    },
    status: "draft",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "doc-cv-1",
    studentId: "1",
    type: "student-cv",
    label: "CV",
    content: {
      summary: "Motivated business student seeking international opportunities.",
      skills: "Research, Communication, Microsoft Office",
      experience: "Intern at local consultancy (2023)",
    },
    status: "draft",
    createdAt: "2024-03-02T10:00:00Z",
    updatedAt: "2024-03-02T10:00:00Z",
  },
  {
    id: "doc-woda-address-1",
    studentId: null,
    type: "woda-address",
    label: "WODA — Address Change",
    content: {
      wodadoc_refno: "WODA-2024-001",
      wodadoc_date: "2024-03-10",
      applicant_name: "Alice Johnson",
      applicant_honorific: "Ms.",
      applicant_gender: "Female",
      applicant_father_name: "John Johnson",
      applicant_father_honorific: "Mr.",
      applicant_mother_name: "Jane Johnson",
      applicant_mother_honorific: "Mrs.",
      initial_address_name: "123 Old Address, Pokhara",
      applicant_permanent_address: "456 New Address, Kathmandu",
      address_name_change_date: "2024-03-01",
      address_name_change_date_bs: "2080-11-17",
      spokesperson_name: "Ram Sharma",
      spokesperson_post: "Ward Secretary",
      spokesperson_contact: "+977-9800000000",
    },
    status: "draft",
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "doc-bank-vyas-statement-1",
    studentId: null,
    type: "bank-vyas-statement",
    label: "Vyas Statement",
    content: {
      statement_account_holder: "Alice Johnson",
      statement_account_no: "1234567890",
      statement_account_address: "Kathmandu, Nepal",
      statement_start_date: "2024-01-01",
      statement_end_date: "2024-03-31",
      statement_interest: "2.5%",
      statement_opening_balance: 50000,
      statement_closing_balance: 75000,
      bank: "vyas",
      bank_template: "statement",
      transactions: [
        {
          date: "2024-01-15",
          description: "Salary Credit",
          credit: 25000,
          balance: 75000,
        },
        {
          date: "2024-02-01",
          description: "ATM Withdrawal",
          debit: 5000,
          balance: 70000,
        },
      ],
    },
    status: "draft",
    createdAt: "2024-03-12T10:00:00Z",
    updatedAt: "2024-03-12T10:00:00Z",
  },
];

let mockPrintLogs: PrintLog[] = [
  {
    id: "log-1",
    documentId: "doc-cert-1",
    type: "student-certificate",
    snapshot: {
      content: {
        issueDate: "2024-02-01",
        issue: "2024-02-01",
        studyType: 0,
        instructorId: "sig-1",
        directorId: "sig-2",
        studentName: "Alice Johnson",
        program: "Business Administration",
        nationality: "American",
        firstname: "Alice",
        lastname: "Johnson",
        date_of_birth: "2000-05-15",
        gender: "Female",
        batch: {
          course: { name: "Japanese Language", level: "N4", total_days: 120 },
        },
        marking: [{ month: "January", present: 18, absent: 2, attendance_percentage: "90%" }],
      },
      config: { instructorId: "sig-1", directorId: "sig-2" },
    },
    printedAt: "2024-02-01T14:30:00Z",
  },
];

const mockSignatures: Signature[] = [
  {
    id: "sig-1",
    name: "Dr. Tanaka Yuki",
    signature_image: "/signatures/tanaka.png",
    is_active: true,
  },
  {
    id: "sig-2",
    name: "Sato Hiroshi",
    signature_image: "/signatures/sato.png",
    is_active: true,
  },
];

const mockStudentFullData: Record<string, StudentFullData> = {
  "1": {
    id: "1",
    fullName: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-234-567-8900",
    program: "Business Administration",
    nationality: "American",
    enrolledAt: "2023-09-01",
    summary: "Motivated business student seeking international opportunities.",
    skills: "Research, Communication, Microsoft Office",
    experience: "Intern at local consultancy (2023)",
  },
  "2": {
    id: "2",
    fullName: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-234-567-8901",
    program: "Computer Science",
    nationality: "Canadian",
    enrolledAt: "2023-09-01",
  },
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listDocumentsByStudent(studentId: string): Promise<Document[]> {
  await delay();
  return mockDocuments.filter((doc) => doc.studentId === studentId);
}

export async function getDocument(documentId: string): Promise<Document> {
  await delay();
  const doc = mockDocuments.find((d) => d.id === documentId);
  if (!doc) throw new Error("Document not found");
  return doc;
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  await delay();
  const now = new Date().toISOString();
  const doc: Document = {
    id: uuidv4(),
    studentId: input.studentId,
    type: input.type,
    label: input.label,
    content: input.content,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  mockDocuments = [...mockDocuments, doc];
  return doc;
}

export async function updateDocument(
  documentId: string,
  input: UpdateDocumentInput
): Promise<Document> {
  await delay();
  const index = mockDocuments.findIndex((d) => d.id === documentId);
  if (index === -1) throw new Error("Document not found");

  const updated: Document = {
    ...mockDocuments[index],
    ...input,
    content: input.content ?? mockDocuments[index].content,
    updatedAt: new Date().toISOString(),
  };
  mockDocuments[index] = updated;
  return updated;
}

export async function removeDocument(documentId: string): Promise<void> {
  await delay();
  mockDocuments = mockDocuments.filter((d) => d.id !== documentId);
  mockPrintLogs = mockPrintLogs.filter((l) => l.documentId !== documentId);
}

export async function getPrintLogs(documentId: string): Promise<PrintLog[]> {
  await delay();
  return mockPrintLogs
    .filter((l) => l.documentId === documentId)
    .sort((a, b) => new Date(b.printedAt).getTime() - new Date(a.printedAt).getTime());
}

export async function createPrintLog(
  documentId: string,
  snapshot: PrintLogSnapshot,
  type: Document["type"]
): Promise<PrintLog> {
  await delay();
  const log: PrintLog = {
    id: uuidv4(),
    documentId,
    type,
    snapshot,
    printedAt: new Date().toISOString(),
  };
  mockPrintLogs = [log, ...mockPrintLogs];
  return log;
}

export async function fetchSignatures(): Promise<Signature[]> {
  await delay();
  return mockSignatures.filter((s) => s.is_active);
}

export async function fetchStudentFullData(studentId: string): Promise<StudentFullData | null> {
  await delay();
  return mockStudentFullData[studentId] ?? null;
}

export async function listDocumentWorkspaces(): Promise<DocumentWorkspaceSummary[]> {
  await delay();
  const byStudent = new Map<string, Document[]>();
  for (const doc of mockDocuments) {
    if (!doc.studentId) continue;
    const existing = byStudent.get(doc.studentId) ?? [];
    byStudent.set(doc.studentId, [...existing, doc]);
  }

  return Array.from(byStudent.entries()).map(([studentId, docs]) => {
    const student = mockStudentFullData[studentId];
    const lastUpdated = docs.reduce(
      (latest, doc) => (doc.updatedAt > latest ? doc.updatedAt : latest),
      docs[0]?.updatedAt ?? ""
    );
    return {
      studentId,
      studentName: student?.fullName ?? `Student ${studentId}`,
      documentCount: docs.length,
      lastUpdated,
    };
  });
}

export const documentsApi = {
  listByStudent: listDocumentsByStudent,
  get: getDocument,
  create: createDocument,
  update: updateDocument,
  remove: removeDocument,
  getPrintLogs,
  createPrintLog,
  fetchSignatures,
  fetchStudentFullData,
  listWorkspaces: listDocumentWorkspaces,
};
