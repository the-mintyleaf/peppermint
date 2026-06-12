"use client";

import { ModalTableShell } from "@zetsel/admin";
import type { DataTableShellTab } from "@zetsel/admin";
import { Paper } from "@zetsel/ui";
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
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";

const tabs: DataTableShellTab[] = [
  { label: "All Students", icon: UsersIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "On Leave", icon: ClockIcon, filter: { status: "on-leave" } },
  { label: "Graduated", icon: GraduationCapIcon, filter: { status: "graduated" } },
  { label: "Dropped", icon: XCircleIcon, filter: { status: "dropped" } },
];

export function StudentsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
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
    </Paper>
  );
}
