"use client";

import { DataTableShell } from "@zetsel/admin";
import type { DataTableShellTab } from "@zetsel/admin";
import { fetchStudents } from "../../students.api";
import { studentsColumns } from "./students.columns";
import { studentQueryKeys } from "../../students.queryKeys";
import type { Student } from "../../students.types";

const tabs: DataTableShellTab[] = [
  { label: "All" },
  { label: "Active", filter: { status: "active" } },
  { label: "On Leave", filter: { status: "on-leave" } },
  { label: "Graduated", filter: { status: "graduated" } },
  { label: "Dropped", filter: { status: "dropped" } },
];

export function StudentsList() {
  return (
    <DataTableShell<Student>
      queryKey={studentQueryKeys.list()}
      queryGetFn={fetchStudents}
      dataKey="data"
      paginationKey="meta"
      enableServerQuery={false}
      columns={studentsColumns}
      moduleInfo={{ name: "students", label: "Students" }}
      basePath="/admin/students"
      tabs={tabs}
    />
  );
}
