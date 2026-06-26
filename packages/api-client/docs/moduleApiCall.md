# moduleApiCall — API Reference

CRUD and batch helpers that wrap `apiDispatch`. No React. No JSX.

All functions return `Promise<ApiResponse<T>>`. Errors are returned, never thrown.

---

## CRUD helpers

### `getRecords<T>(url, params?)`

Fetch a list of records.

```typescript
getRecords<User>("/api/users", { page: 1, pageSize: 20 });
```

### `getSingleRecord<T>(url, id)`

Fetch one record by ID. Constructs URL as `${url}/${id}`.

```typescript
getSingleRecord<User>("/api/users", 42); // GET /api/users/42
```

### `createRecord<T>(url, body)`

POST a new record.

```typescript
createRecord<User>("/api/users", { name: "Alice", email: "alice@example.com" });
```

### `editRecord<T>(url, id, body)`

PATCH an existing record. Constructs URL as `${url}/${id}`.

```typescript
editRecord<User>("/api/users", 42, { name: "Alicia" }); // PATCH /api/users/42
```

### `deleteRecord(url, id)`

DELETE a record by ID. Constructs URL as `${url}/${id}`.

```typescript
deleteRecord("/api/users", 42); // DELETE /api/users/42
```

---

## Batch helpers

### `createGroupRecords<T>(url, items)`

POST an array of records in a single request.

```typescript
createGroupRecords<User>("/api/users/batch", [
  { name: "Alice" },
  { name: "Bob" },
]);
```

### `editGroupRecords<T>(url, items)`

PATCH an array of records. Each item must include an `id` field.

```typescript
editGroupRecords<User>("/api/users/batch", [
  { id: 1, name: "Alicia" },
  { id: 2, name: "Robert" },
]);
```

### `deleteGroupRecords(url, ids)`

DELETE multiple records by ID array. Sends IDs as query params.

```typescript
deleteGroupRecords("/api/users", [1, 2, 3]);
// DELETE /api/users?ids[]=1&ids[]=2&ids[]=3
```

---

## `ApiResponse<T>`

See [apiDispatch.md](./apiDispatch.md#apiresponset) for the full shape.
