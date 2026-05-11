import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@zetsel/ui';
import { DataTableShell } from '@zetsel/admin';
import type { ColumnDef, FilterDef } from '@zetsel/admin';
import type { ApiResponse } from '@zetsel/api-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const MOCK_USERS: User[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : 'user',
  status: i % 4 === 0 ? 'inactive' : 'active',
}));

function mockGetRecords(delay = 300) {
  return (_params?: Record<string, unknown>): Promise<ApiResponse<User[]>> =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ok: true,
            status: 200,
            data: MOCK_USERS.slice(0, 20),
            message: '',
          }),
        delay,
      ),
    );
}

function mockGetEmpty(): Promise<ApiResponse<User[]>> {
  return Promise.resolve({ ok: true, status: 200, data: [], message: '' });
}

function mockGetError(): Promise<ApiResponse<User[]>> {
  return Promise.resolve({ ok: false, status: 500, data: null, message: 'Server error' });
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
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

const meta: Meta<typeof DataTableShell> = {
  title: 'Admin/DataTableShell',
  component: DataTableShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DataTableShell>;

export const Minimal: Story = {
  render: () => (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users' }}
      queryKey="users-minimal"
      queryGetFn={mockGetRecords()}
      columns={columns}
      idAccessor="id"
    />
  ),
};

export const FullyConfigured: Story = {
  render: () => (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users', description: 'Manage user accounts' }}
      queryKey="users-full"
      queryGetFn={mockGetRecords()}
      columns={columns}
      idAccessor="id"
      onNewClick={() => alert('New user')}
      onEditClick={(id) => alert(`Edit user ${id}`)}
      onDeleteClick={(ids) => alert(`Delete: ${ids.join(', ')}`)}
      filterList={filterList}
      pageSizes={[20, 50, 100]}
    />
  ),
};

export const EmptyState: Story = {
  render: () => (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users' }}
      queryKey="users-empty"
      queryGetFn={mockGetEmpty}
      columns={columns}
      idAccessor="id"
      onNewClick={() => alert('New user')}
    />
  ),
};

export const LoadingState: Story = {
  render: () => (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users' }}
      queryKey="users-loading"
      queryGetFn={mockGetRecords(5000)}
      columns={columns}
      idAccessor="id"
    />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users' }}
      queryKey="users-error"
      queryGetFn={mockGetError}
      columns={columns}
      idAccessor="id"
    />
  ),
};
