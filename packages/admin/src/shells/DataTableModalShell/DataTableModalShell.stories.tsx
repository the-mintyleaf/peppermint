import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, TextInput, Select, Badge } from '@zetsel/ui';
import { DataTableModalShell, useFormInstance } from '@zetsel/admin';
import type { ColumnDef, FilterDef } from '@zetsel/admin';
import type { ApiResponse } from '@zetsel/api-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

type UserInput = {
  name: string;
  email: string;
  role: string;
} & Record<string, unknown>;

const MOCK_USERS: User[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : 'user',
  status: i % 4 === 0 ? 'inactive' : 'active',
}));

function mockGetRecords(): Promise<ApiResponse<User[]>> {
  return Promise.resolve({ ok: true, status: 200, data: MOCK_USERS, message: '' });
}

function mockCreate(_data: UserInput): Promise<ApiResponse<unknown>> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, status: 201, data: null, message: '' }), 600),
  );
}

function mockEdit(_id: string | number, _data: UserInput): Promise<ApiResponse<unknown>> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, status: 200, data: null, message: '' }), 600),
  );
}

function mockDelete(_id: string | number): Promise<ApiResponse<void>> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, status: 204, data: null, message: '' }), 400),
  );
}

const columns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  {
    key: 'status',
    label: 'Status',
    render: (val: unknown) => (
      <Badge color={val === 'active' ? 'green' : 'gray'}>{String(val)}</Badge>
    ),
  },
];

const filterList: FilterDef[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ],
  },
];

function UserFormFields() {
  const { form } = useFormInstance<UserInput>();
  return (
    <Stack gap="md">
      <TextInput label="Name" required {...form.getInputProps('name')} />
      <TextInput label="Email" required {...form.getInputProps('email')} />
      <Select
        label="Role"
        data={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ]}
        {...form.getInputProps('role')}
      />
    </Stack>
  );
}

const INITIAL: UserInput = { name: '', email: '', role: 'user' };

const meta: Meta = {
  title: 'Admin/DataTableModalShell',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Minimal: StoryObj = {
  render: () => (
    <DataTableModalShell<User, UserInput, UserInput>
      moduleInfo={{ title: 'Users' }}
      queryKey="modal-users-minimal"
      queryGetFn={mockGetRecords}
      columns={columns}
      idAccessor="id"
      onCreateApi={mockCreate}
      onEditApi={mockEdit}
      onDeleteApi={mockDelete}
      createFormComponent={UserFormFields}
      editFormComponent={UserFormFields}
      createInitial={INITIAL}
      editInitial={(r) => ({ name: r.name, email: r.email, role: r.role })}
    />
  ),
};

export const WithFilters: StoryObj = {
  render: () => (
    <DataTableModalShell<User, UserInput, UserInput>
      moduleInfo={{ title: 'Users', description: 'Manage system users' }}
      queryKey="modal-users-filters"
      queryGetFn={mockGetRecords}
      columns={columns}
      idAccessor="id"
      onCreateApi={mockCreate}
      onEditApi={mockEdit}
      onDeleteApi={mockDelete}
      createFormComponent={UserFormFields}
      editFormComponent={UserFormFields}
      createInitial={INITIAL}
      editInitial={(r) => ({ name: r.name, email: r.email, role: r.role })}
      filterList={filterList}
      pageSizes={[10, 25, 50]}
      modalSize="lg"
    />
  ),
};

export const EmptyState: StoryObj = {
  render: () => (
    <DataTableModalShell<User, UserInput, UserInput>
      moduleInfo={{ title: 'Users' }}
      queryKey="modal-users-empty"
      queryGetFn={() => Promise.resolve({ ok: true, status: 200, data: [], message: '' })}
      columns={columns}
      idAccessor="id"
      onCreateApi={mockCreate}
      onEditApi={mockEdit}
      onDeleteApi={mockDelete}
      createFormComponent={UserFormFields}
      editFormComponent={UserFormFields}
      createInitial={INITIAL}
      editInitial={(r) => ({ name: r.name, email: r.email, role: r.role })}
    />
  ),
};
