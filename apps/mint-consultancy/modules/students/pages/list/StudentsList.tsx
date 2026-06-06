"use client";

import { ModalTableShell } from "@zetsel/admin";
import type { DataTableShellTab } from "@zetsel/admin";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../students.api";
import { studentsColumns } from "./students.columns";
import { studentQueryKeys } from "../../students.queryKeys";
import { StudentForm } from "../../form/StudentForm";
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
    <ModalTableShell<Student>
      queryKey={studentQueryKeys.list()}
      queryGetFn={fetchStudents}
      dataKey="data"
      paginationKey="meta"
      columns={studentsColumns}
      moduleInfo={{
        name: "students",
        label: "Students",
        description: "Manage student enrollments and profiles",
      }}
      idAccessor="id"
      createFormComponent={StudentForm}
      editFormComponent={StudentForm}
      onCreateApi={(values: any) => createStudent(values)}
      onEditApi={(values: any) => updateStudent(values.id, values)}
      onDeleteApi={(id) => deleteStudent(String(id))}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      tabs={tabs}
      basePath="/admin/students"
    />
  );
}
