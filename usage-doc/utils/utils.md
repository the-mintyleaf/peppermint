# @zetsel/utils — Usage Examples

## Installation

`@zetsel/utils` is a workspace package — available in any app or package via:

```json
"dependencies": {
  "@zetsel/utils": "workspace:*"
}
```

---

## Hooks

### `useDebounce`

Delay a search query until the user stops typing:

```tsx
import { useDebounce } from '@zetsel/utils';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

Used in `@zetsel/admin`'s `DataTableWrapper` auto-save draft:

```typescript
const debouncedValues = useDebounce(form.values, 800);
```

---

### `useLocalStorage`

Persist table density preference:

```tsx
import { useLocalStorage } from '@zetsel/utils';

const [density, setDensity] = useLocalStorage<'compact' | 'normal' | 'spacious'>(
  'zetsel-table-density',
  'normal'
);
```

Functional updater:

```tsx
setDensity((prev) => (prev === 'normal' ? 'compact' : 'normal'));
```

---

### `usePrevious`

Detect a value change (e.g. route transition):

```tsx
import { usePrevious } from '@zetsel/utils';

const prev = usePrevious(recordId);
const hasChanged = prev !== undefined && prev !== recordId;
```

---

### `useWindowSize`

Conditionally render a mobile layout:

```tsx
import { useWindowSize } from '@zetsel/utils';

function Layout({ children }: { children: React.ReactNode }) {
  const { width } = useWindowSize();
  return width < 768 ? <MobileLayout>{children}</MobileLayout> : <DesktopLayout>{children}</DesktopLayout>;
}
```

---

## Formatting

```tsx
import {
  formatDate, formatDateTime, formatRelative,
  formatNumber, formatCurrency,
  truncate, capitalize, slugify,
} from '@zetsel/utils';

formatDate('2024-03-15');                    // "15 Mar 2024"
formatDate('2024-03-15', 'MMMM D, YYYY');   // "March 15, 2024"
formatDateTime('2024-03-15T14:30:00');       // "15 Mar 2024 14:30"
formatRelative('2024-03-14T12:00:00');       // "a day ago"

formatNumber(1234567.89);                    // "1,234,567.89"
formatNumber(0.75, { style: 'percent' });    // "75%"
formatCurrency(49.99);                       // "$49.99"
formatCurrency(49.99, 'GBP', 'en-GB');      // "£49.99"

truncate('A very long title here', 15);      // "A very long tit…"
capitalize('hello world');                   // "Hello world"
slugify('Hello World! (2024)');              // "hello-world-2024"
```

---

## Validation

### `zodResolver` with Mantine `useForm`

```tsx
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { zodResolver } from '@zetsel/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  address: z.object({
    city: z.string().min(1, 'City is required'),
  }),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    initialValues: { name: '', email: '', address: { city: '' } },
    validate: zodResolver(schema),
    validateInputOnBlur: true,
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
      <TextInput label="City" {...form.getInputProps('address.city')} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### `parseOrNull`

Safe parse without try/catch:

```typescript
import { z } from 'zod';
import { parseOrNull } from '@zetsel/utils';

const UserSchema = z.object({ id: z.number(), name: z.string() });

const user = parseOrNull(UserSchema, apiResponse);
if (user) {
  console.log(user.name); // typed as { id: number; name: string }
}
```
