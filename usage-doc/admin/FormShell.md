# FormShell — Usage Examples

## Minimal usage

```tsx
import { FormShell } from '@zetsel/admin';
import { createRecord } from '@zetsel/api-client';
import { TextInput } from '@zetsel/ui';
import { useFormInstance } from '@zetsel/admin';

interface UserForm {
  name: string;
  email: string;
}

function UserFormFields() {
  const { form } = useFormInstance<UserForm>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
}

export default function NewUserPage() {
  return (
    <FormShell<UserForm>
      title="New User"
      initial={{ name: '', email: '' }}
      apiSubmitFn={(data) => createRecord('/api/users', data)}
    >
      <UserFormFields />
    </FormShell>
  );
}
```

---

## With breadcrumbs, cancel, and redirect on success

```tsx
import { useRouter } from 'next/navigation';
import { FormShell } from '@zetsel/admin';
import { editRecord } from '@zetsel/api-client';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export default function EditUserPage({ id, record }: { id: number; record: UserForm }) {
  const router = useRouter();

  return (
    <FormShell<UserForm>
      title="Edit User"
      bread={[
        { label: 'Users', href: '/users' },
        { label: record.name },
      ]}
      initial={record}
      apiSubmitFn={(data) => editRecord('/api/users', id, data)}
      validation={[schema]}
      submitSuccessFn={() => router.push('/users')}
      onCancel={() => router.back()}
      hasDirtCheck
    >
      <UserFormFields />
    </FormShell>
  );
}
```

---

## Multi-step form

```tsx
import { FormShell, useFormInstance } from '@zetsel/admin';
import { z } from 'zod';

const stepSchemas = [
  z.object({ name: z.string().min(1), email: z.string().email() }),
  z.object({ role: z.string().min(1), department: z.string().min(1) }),
];

function Step1() {
  const { form } = useFormInstance<UserForm>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
}

function Step2() {
  const { form } = useFormInstance<UserForm>();
  return (
    <>
      <TextInput label="Role" {...form.getInputProps('role')} />
      <TextInput label="Department" {...form.getInputProps('department')} />
    </>
  );
}

export default function NewUserWizard() {
  const { form } = useFormInstance<UserForm>();  // must be inside FormShell
  const { current } = useFormControls();

  return (
    <FormShell<UserForm>
      title="New User"
      initial={{ name: '', email: '', role: '', department: '' }}
      apiSubmitFn={(data) => createRecord('/api/users', data)}
      validation={stepSchemas}
      steps={['Basic Info', 'Role & Dept']}
    >
      {current === 0 && <Step1 />}
      {current === 1 && <Step2 />}
    </FormShell>
  );
}
```

---

## Accessing the form outside FormShell (sibling component pattern)

`useFormInstance` and `useFormControls` work anywhere inside the `FormShell` tree:

```tsx
function AutoSaveIndicator() {
  const { form } = useFormInstance<UserForm>();
  const isDirty = form.isDirty();
  return isDirty ? <Text size="xs" c="dimmed">Unsaved changes</Text> : null;
}

export default function EditPage() {
  return (
    <FormShell<UserForm> title="Edit" initial={...} apiSubmitFn={...}>
      <AutoSaveIndicator />
      <UserFormFields />
    </FormShell>
  );
}
```
