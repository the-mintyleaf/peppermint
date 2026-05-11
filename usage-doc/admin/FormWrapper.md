# FormWrapper — Usage Examples

## Basic single-step form

```tsx
import { FormWrapper, useFormInstance, useFormControls } from '@zetsel/admin';
import { TextInput, Button } from '@zetsel/ui';
import { z } from 'zod';
import { api } from '@zetsel/api-client';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
});
type FormData = z.infer<typeof schema>;

const initial: FormData = { name: '', email: '' };

function CreateUserForm() {
  return (
    <FormWrapper<FormData>
      initial={initial}
      apiSubmitFn={(data) => api.post({ url: '/api/users', body: data })}
      validation={[schema]}
      submitSuccessFn={() => router.push('/users')}
    >
      <UserFields />
      <FormFooter />
    </FormWrapper>
  );
}

function UserFields() {
  const { form } = useFormInstance<FormData>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
}

function FormFooter() {
  const { isLoading, handleSubmit } = useFormControls();
  return (
    <Button loading={isLoading} onClick={handleSubmit}>
      Save
    </Button>
  );
}
```

---

## Multi-step form

```tsx
import { FormWrapper, useFormInstance, useFormControls } from '@zetsel/admin';
import { z } from 'zod';

const step0Schema = z.object({ name: z.string().min(1), email: z.string().email() });
const step1Schema = z.object({ address: z.object({ city: z.string().min(1) }) });

type FormData = z.infer<typeof step0Schema> & z.infer<typeof step1Schema>;

function MultiStepForm() {
  return (
    <FormWrapper<FormData>
      initial={{ name: '', email: '', address: { city: '' } }}
      apiSubmitFn={(data) => api.post({ url: '/api/users', body: data })}
      validation={[step0Schema, step1Schema]}
      stepFields={[['name', 'email'], ['address.city']]}
    >
      <StepContent />
      <StepNavigation />
    </FormWrapper>
  );
}

function StepNavigation() {
  const { current, isLoading, handleStepNext, handleStepBack, handleSubmit } = useFormControls();
  return (
    <div>
      {current > 0 && <button onClick={handleStepBack}>Back</button>}
      {current < 1
        ? <button onClick={handleStepNext}>Next</button>
        : <button disabled={isLoading} onClick={handleSubmit}>Submit</button>
      }
    </div>
  );
}
```

---

## Edit mode — pre-populate on record load

```tsx
import { useEffect } from 'react';
import { useFormInstance } from '@zetsel/admin';
import { useQuery } from '@tanstack/react-query';
import { getSingleRecord } from '@zetsel/api-client';

function EditFields({ recordId }: { recordId: number }) {
  const { form } = useFormInstance<UserFormData>();
  const { data } = useQuery({
    queryKey: ['users', recordId],
    queryFn: () => getSingleRecord<UserFormData>('/api/users', recordId),
    select: (res) => res.data,
  });

  // Rule 1 — key on recordId, NOT on data (object ref changes every refetch)
  useEffect(() => {
    if (data) form.setValues(data);
  }, [recordId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <TextInput label="Name" {...form.getInputProps('name')} />;
}
```

---

## Auto-save draft (Rule 6)

```tsx
import { useEffect, useRef } from 'react';
import { useFormInstance } from '@zetsel/admin';
import { useDebounce } from '@zetsel/utils';
import { shallowEqual } from '@zetsel/admin'; // re-exported from FormWrapper.utils

function AutoSaveDraft() {
  const { form } = useFormInstance<MyForm>();
  const debouncedValues = useDebounce(form.values, 800);
  const lastSavedRef = useRef(debouncedValues);

  useEffect(() => {
    if (!shallowEqual(debouncedValues, lastSavedRef.current)) {
      localStorage.setItem('draft', JSON.stringify(debouncedValues));
      lastSavedRef.current = debouncedValues;
    }
  }, [debouncedValues]);

  return null;
}
```

---

## Transform before submit

`transformFnSubmit` receives a `structuredClone` — mutate freely:

```typescript
<FormWrapper
  transformFnSubmit={(data) => {
    data.name = data.name.trim();
    data.tags = data.tags.filter(Boolean);
    delete (data as Partial<typeof data>).internalDraftId;
    return data;
  }}
  ...
>
```
