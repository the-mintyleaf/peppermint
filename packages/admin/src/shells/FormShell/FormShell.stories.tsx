import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, TextInput, Textarea, Select } from '@zetsel/ui';
import { z } from 'zod';
import { FormShell, useFormInstance, useFormControls } from '@zetsel/admin';
import type { ApiResponse } from '@zetsel/api-client';

type UserForm = {
  name: string;
  email: string;
  role: string;
  bio: string;
} & Record<string, unknown>;

type WizardForm = {
  name: string;
  email: string;
  role: string;
  department: string;
  bio: string;
} & Record<string, unknown>;

function mockSubmit(delay = 800) {
  return (_data: unknown): Promise<ApiResponse<unknown>> =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ ok: true, status: 200, data: null, message: '' }), delay),
    );
}

function mockSubmitError(): Promise<ApiResponse<unknown>> {
  return Promise.resolve({ ok: false, status: 422, data: null, message: 'Validation failed on server' });
}

function UserFormFields() {
  const { form } = useFormInstance<UserForm>();
  return (
    <Stack gap="md">
      <TextInput label="Name" required {...form.getInputProps('name')} />
      <TextInput label="Email" required {...form.getInputProps('email')} />
      <Select
        label="Role"
        data={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
          { value: 'viewer', label: 'Viewer' },
        ]}
        {...form.getInputProps('role')}
      />
      <Textarea label="Bio" {...form.getInputProps('bio')} />
    </Stack>
  );
}

function WizardStep1() {
  const { form } = useFormInstance<WizardForm>();
  return (
    <Stack gap="md">
      <TextInput label="Name" required {...form.getInputProps('name')} />
      <TextInput label="Email" required {...form.getInputProps('email')} />
    </Stack>
  );
}

function WizardStep2() {
  const { form } = useFormInstance<WizardForm>();
  const { current } = useFormControls();
  return (
    <Stack gap="md">
      <Select
        label="Role"
        data={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ]}
        {...form.getInputProps('role')}
      />
      <TextInput label="Department" {...form.getInputProps('department')} />
    </Stack>
  );
}

function WizardStep3() {
  const { form } = useFormInstance<WizardForm>();
  return <Textarea label="Bio" {...form.getInputProps('bio')} />;
}

function WizardChildren() {
  const { current } = useFormControls();
  return (
    <>
      {current === 0 && <WizardStep1 />}
      {current === 1 && <WizardStep2 />}
      {current === 2 && <WizardStep3 />}
    </>
  );
}

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.string().optional(),
  bio: z.string().optional(),
});

const meta: Meta = {
  title: 'Admin/FormShell',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Minimal: StoryObj = {
  render: () => (
    <FormShell<UserForm>
      title="New User"
      initial={{ name: '', email: '', role: '', bio: '' }}
      apiSubmitFn={mockSubmit()}
    >
      <UserFormFields />
    </FormShell>
  ),
};

export const WithBreadcrumbsAndCancel: StoryObj = {
  render: () => (
    <FormShell<UserForm>
      title="Edit User"
      bread={[
        { label: 'Users', href: '#' },
        { label: 'Edit User' },
      ]}
      initial={{ name: 'Jane Smith', email: 'jane@example.com', role: 'admin', bio: 'Some bio.' }}
      apiSubmitFn={mockSubmit()}
      validation={[userSchema]}
      onCancel={() => alert('Cancelled')}
      hasDirtCheck
    >
      <UserFormFields />
    </FormShell>
  ),
};

export const MultiStep: StoryObj = {
  render: () => (
    <FormShell<WizardForm>
      title="New User Wizard"
      initial={{ name: '', email: '', role: '', department: '', bio: '' }}
      apiSubmitFn={mockSubmit()}
      steps={['Basic Info', 'Role & Dept', 'Profile']}
      onCancel={() => alert('Cancelled')}
    >
      <WizardChildren />
    </FormShell>
  ),
};

export const SubmitError: StoryObj = {
  render: () => (
    <FormShell<UserForm>
      title="New User (will fail)"
      initial={{ name: '', email: '', role: '', bio: '' }}
      apiSubmitFn={mockSubmitError}
      onCancel={() => alert('Cancelled')}
    >
      <UserFormFields />
    </FormShell>
  ),
};
