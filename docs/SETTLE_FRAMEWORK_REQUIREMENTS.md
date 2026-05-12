# Settle Framework - Requirements Document

## Executive Summary

Settle is a comprehensive admin dashboard framework built on React, Mantine, TanStack Query, and Zustand. This document defines the complete feature set, architecture, and requirements for building an improved version of Settle that provides reusable, composable, and intelligent components for rapid admin dashboard development.

---

## 1. Core Framework Architecture

### 1.1 Framework Layers

The framework consists of four independent but composable layers:

```
Layer 4: Application (Module) - Built by developers using the framework
   ↓
Layer 3: @settle/admin (UI Shells) - Pre-built page layouts and patterns
   ↓
Layer 2: @settle/core (State & Data Engine) - Form/table state, API client
   ↓
Layer 1: @settle/shared (Types, Constants, Utilities) - Shared across all layers
```

**Key Requirement**: No layer should import from higher layers. @settle/core should never depend on application code.

### 1.2 Technology Stack

- **React 19.2** with hooks-first architecture
- **Next.js 16.1** App Router
- **Mantine v8** - UI component library
- **TanStack Query v5.90** - Server state management
- **Zustand v5** - Client state management
- **Zod v3** - Runtime validation
- **Axios v1.13** - HTTP client
- **TypeScript** - All code must be type-safe

---

## 2. @settle/core - Data and State Management Layer

### 2.1 apiDispatch - HTTP Client

**Purpose**: Centralized HTTP client with authentication, token refresh, error handling, and retry logic.

**Existing Implementation**: Basic GET, POST, PATCH, DELETE methods with Bearer token auth.

**Required Features**:

#### 2.1.1 Core HTTP Methods
- `get<T>(options)` - GET request with type safety
- `post<T>(options)` - POST request
- `patch<T>(options)` - PATCH request
- `del<T>(options)` - DELETE request
- `login<T>(options)` - Login endpoint with automatic token storage

**Props for all methods**:
```typescript
{
  endpoint: string;           // API endpoint URL
  params?: Record<string, any>;  // Query parameters (GET only)
  body?: Record<string, any>;    // Request body (POST, PATCH)
  headers?: Record<string, string>; // Custom headers
  noAuthorization?: boolean;     // Skip Bearer token
  timeout?: number;              // Request timeout in ms
  retryCount?: number;           // Number of retries
  retryDelay?: number;           // Delay between retries
  signal?: AbortSignal;          // Abort controller signal
}
```

**Return Type**:
```typescript
interface ApiResponse<T = any> {
  err: boolean;        // true if error, false if success
  data: T | null;      // Response data or null
  error?: string;      // Error message if err is true
  status?: number;     // HTTP status code
}
```

#### 2.1.2 Authentication
- Automatic Bearer token injection from `sessionStorage.kcatoken`
- Automatic token refresh on 401 response
- Token refresh endpoint: `POST /api/auth/token/refresh/`
- Automatic request retry after successful token refresh
- Logout on refresh failure

#### 2.1.3 Error Handling
- Centralized error message extraction
- Network error detection ("Server is offline")
- Timeout detection and reporting
- Server error message passthrough
- Validation error passthrough

#### 2.1.4 Request Management
- AbortController support for request cancellation
- Configurable timeout per request
- Exponential backoff for network errors
- Configurable retry strategy
- Request deduplication (same endpoint + params = single request)

#### 2.1.5 Offline Support
- Queue mutations while offline
- Replay mutations when connection restored
- Indicate offline status to application

#### 2.1.6 Logging & Debugging
- Debug mode that logs all requests/responses
- Request/response payload logging
- Performance metrics (request duration)
- Error logging with stack traces

---

### 2.2 moduleApiCall - CRUD Helpers

**Purpose**: DRY CRUD layer that wraps apiDispatch with normalized responses.

**Existing Methods**: `getRecords()`, `getSingleRecord()`, `createRecord()`, `editRecord()`, `deleteRecord()`, `createGroupRecords()`

**Required Features**:

#### 2.2.1 CRUD Operations
- `getRecords(endpoint, params)` - Fetch list with pagination
- `getSingleRecord(endpoint, id)` - Fetch single record
- `createRecord(endpoint, body)` - Create single record
- `editRecord(endpoint, id, body)` - Update single record
- `deleteRecord(endpoint, id)` - Delete single record
- `createGroupRecords(endpoint, body[])` - Create multiple records in one request
- `editGroupRecords(endpoint, updates[])` - Update multiple records in one request
- `deleteGroupRecords(endpoint, ids[])` - Delete multiple records in one request

**Response Normalization**:
- All responses normalized to `{ data: T | null }`
- Empty lists return `[]` not `null`
- Errors handled and converted to ApiResponse format

#### 2.2.2 Optimistic Updates
- Option to return client-side state before server confirmation
- Automatic rollback if server rejects
- Props:
  ```typescript
  optimisticUpdate?: {
    enabled: boolean;
    onOptimistic?: (data) => void;
    onRollback?: () => void;
  }
  ```

#### 2.2.3 Cache Invalidation Helpers
- `invalidateModule(moduleName)` - Clear all queries for a module
- `invalidateQuery(queryKey)` - Clear specific query
- `invalidateRelated(dependencies)` - Clear dependent queries

#### 2.2.4 Batch Operations
- `createGroupRecords()` - Already exists, ensure it handles large batches
- `editGroupRecords()` - Update many records efficiently
- `deleteGroupRecords()` - Bulk delete with confirmation

---

### 2.3 FormWrapper - Multi-Step Form State Management

**Purpose**: Centralized form state management with validation, submission, and multi-step workflows.

**Existing Implementation**: Basic form state with Mantine hooks, Zod validation, multi-step navigation.

**Required Features**:

#### 2.3.1 Core Form Management
```typescript
interface FormWrapperProps<T extends Record<string, any>> {
  // Identification
  queryKey: string;              // Unique query key for React Query
  formName?: string;             // Form identifier
  
  // Initial State
  initial: T;                    // Initial form values
  
  // Multi-Step
  steps?: number;                // Number of steps (default: 1)
  disabledSteps?: number[];      // Disabled step indices
  
  // Validation
  validation?: ZodSchema[];      // Zod schema per step
  stepValidationFn?: (step, values) => Promise<ValidationErrors>;
  
  // API Submission
  apiSubmitFn: (data: T) => Promise<any>;
  
  // Data Transformation
  transformFnSubmit?: (data: T) => T;
  
  // Callbacks
  submitSuccessFn?: () => void;
  submitErrorFn?: (error: any) => void;
  preSubmitFn?: () => Promise<void>;
  
  // Options
  mode?: 'controlled' | 'uncontrolled';
  primaryKey?: string;           // Key for identifying records (edit mode)
  hasDirtCheck?: boolean;        // Track changed fields
  formClearOnSuccess?: boolean;  // Clear form after submit
  submitFormat?: 'json' | 'formdata';
  
  // Notifications
  notifications?: {
    isLoading?: () => void;
    isSuccess?: () => void;
    isError?: (error) => void;
    isValidation?: (errors) => void;
  };
  
  // UI
  testMode?: boolean;            // Enable console logging
  
  children: ReactNode;
}
```

#### 2.3.2 Form State Access
- `FormWrapper.useForm()` - Access form instance with `getInputProps()`
- `FormWrapper.useFormProps()` - Access submission handlers and state
  ```typescript
  {
    current: number;             // Current step
    isLoading: boolean;
    handleSubmit: () => void;
    handleStepNext: () => void;
    handleStepBack: () => void;
    errors: Record<string, string>;
  }
  ```

#### 2.3.3 Field-Level Features
- **Conditional Fields** - Show/hide fields based on other values
- **Dependent Fields** - Auto-update fields when other fields change
- **Field-Level Async Validation** - Validate against API (email uniqueness)
- **Field Metadata** - Store non-visual metadata per field
- **Field Dependencies** - Mark which fields affect which other fields

#### 2.3.4 Auto-Save Drafts
```typescript
autoSaveDraft?: {
  enabled: boolean;
  interval: number;              // ms between saves
  storage: 'localStorage' | 'sessionStorage' | 'custom';
  key?: string;                  // Storage key
  onSave?: (data) => Promise<void>;
}
```

#### 2.3.5 Form Versioning
- Migration function to transform old form shapes to new
- Support for backward compatibility with old drafts
```typescript
migrations?: {
  version: number;
  migrate: (oldData) => newData;
}[]
```

#### 2.3.6 Pre-Fill from Query Parameters
- Auto-populate form fields from URL query params
- Example: `/form?name=John&email=john@example.com`
```typescript
preFillFromQuery?: {
  enabled: boolean;
  mapping?: Record<string, string>; // queryParam -> fieldName
}
```

#### 2.3.7 Progress Tracking
- Know which steps are complete, which have errors
- Return completion percentage
```typescript
stepStatus: Record<number, 'pending' | 'complete' | 'error' | 'warning'>
completionPercentage: number
```

#### 2.3.8 Progress Saving Indicator
- Track submission state: idle, saving, saved, error
- Props for FormShell to display indicator

---

### 2.4 DataTableWrapper - Table State and Data Fetching

**Purpose**: Centralized table state management with data fetching, pagination, searching, filtering.

**Existing Implementation**: Data fetching, client/server-side pagination, Zustand store for pagination state.

**Required Features**:

#### 2.4.1 Core Data Fetching
```typescript
interface DataTableWrapperProps<T = any> {
  // Data
  queryKey: string;              // Unique query key for React Query
  queryGetFn: (params?) => Promise<any>; // Data fetch function
  dataKey?: string;              // Path to data array in response
  
  // Pagination
  enableServerQuery?: boolean;   // Server-side pagination
  paginationDataKey?: string;    // Path to pagination info
  paginationResponseFn?: (response) => PaginationData;
  
  // Options
  testMode?: boolean;
  
  children: ReactNode;
}
```

#### 2.4.2 Data Fetching & State
- `DataTableWrapper.useDataTableContext()` - Access fetched data
  ```typescript
  {
    data: T[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  }
  ```

#### 2.4.3 Pagination State
- `DataTableWrapper.useDataTableWrapperStore()` - Access pagination state
  ```typescript
  {
    page: number;
    pageSize: number;
    search: string;
    filters: Record<string, any>;
    sort: { column: string; direction: 'asc' | 'desc' };
    
    setPaginationData: (data) => void;
    setPage: (page) => void;
    setPageSize: (size) => void;
    setSearch: (search) => void;
    setFilters: (filters) => void;
    setSort: (column, direction) => void;
  }
  ```

#### 2.4.4 Advanced Filtering
- Composable filter expressions
```typescript
filters?: Array<{
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'between' | 'exists';
  value: any;
  caseSensitive?: boolean;
}>
```

#### 2.4.5 Sorting State
- Track active sort column and direction
- Persist sort preference to localStorage
- Multi-column sort support

#### 2.4.6 Column Visibility
- User-driven column show/hide
- Persist preferences to localStorage
- API to programmatically toggle columns

#### 2.4.7 Selection State Management
- Multi-row selection with checkboxes
- Track selected rows
- Bulk actions on selected rows
```typescript
selectedIds: string[];
setSelectedIds: (ids) => void;
selectAll: () => void;
deselectAll: () => void;
toggleRow: (id) => void;
```

#### 2.4.8 Virtual Scrolling
- Render only visible rows
- Massive performance improvement for 1000+ rows
- Configurable row height

#### 2.4.9 Grouping
- Group table by field
- Collapsible group headers
- Aggregate data per group

#### 2.4.10 Inline Editing
- Edit cell values directly in table
- Click cell → edit input → blur → save
- Automatic API call on blur

#### 2.4.11 Table State Persistence
- Remember pagination, sort, filters, column visibility
- localStorage per table
- Session-based state option

#### 2.4.12 Real-Time Updates
- WebSocket or polling for live data
- Subscribe to data changes
- Auto-refresh table when data changes

---

## 3. @settle/admin - UI Shell Components

### 3.1 DataTableShell

**Purpose**: Complete UI shell for list/table pages with filters, search, pagination, and row actions.

**Existing Implementation**: Header, filters, table, pagination controls, row actions.

**Required Features**:

#### 3.1.1 Core Props
```typescript
interface DataTableShellProps<T = any> {
  // Module Info
  moduleInfo: {
    name: string;
    label: string;
    description?: string;
    icon?: string;
  };
  
  // Table Content
  columns: ColumnDef[];          // Column definitions
  idAccessor: string;            // Unique identifier field
  
  // Actions
  newButtonHref?: string;        // Link for create button
  onNewClick?: () => void;       // Callback for new button
  onEditClick?: (id: string | number) => void;
  onDeleteClick?: (ids: string[] | number[]) => void;
  onReviewClick?: (id: string | number) => void;
  
  // Customization
  tabs?: TabDef[];
  tableActions?: ActionDef[];    // Custom row actions
  filterList?: FilterDef[];
  forceFilter?: Record<string, any>;
  pageSizes?: number[];
  
  // Display
  hideFilters?: boolean;
  disableActions?: boolean;
  hasServerSearch?: boolean;
  rowExpansion?: RowExpansionDef;
  
  // Styling
  rowColor?: string;
  rowBackgroundColor?: string;
  rowStyle?: CSSProperties;
  
  // Features
  sustained?: boolean;           // Maintain selection across pages
}
```

#### 3.1.2 Responsive Layout
- Stack columns on mobile
- Card-based layout on small screens
- Keep CRUD actions accessible

#### 3.1.3 Empty State
- Beautiful UI when no data
- Icon + message + action button
- Customizable empty state

#### 3.1.4 Error State
- Display error message
- Retry button
- Customizable error state

#### 3.1.5 Loading Skeleton
- Placeholder rows while loading
- Better UX than blank table
- Configurable row count

#### 3.1.6 Inline Actions Menu
- Right-click context menu
- Alternative to action buttons
- More actions without clutter

#### 3.1.7 Column Features
- Column pinning (keep certain columns visible)
- Auto-width calculation
- Sort indicators (up/down arrows)
- Column resizing

#### 3.1.8 Table Density
- Compact/normal/comfortable row height
- User preference setting
- Persist to localStorage

#### 3.1.9 Accessibility
- ARIA labels
- Keyboard navigation (Tab, Arrow keys, Enter)
- Screen reader support
- Focus management

#### 3.1.10 Row Expansion
- Expandable rows for nested/hierarchical data
- Collapsible parent-child relationships
- Multi-level nesting support

#### 3.1.11 Export Functionality
- Export to CSV
- Export to Excel
- Respect current filters/search
- Include/exclude columns

---

### 3.2 FormShell

**Purpose**: Complete UI shell for form pages with header, stepper, content area, and footer.

**Existing Implementation**: Header, title, breadcrumbs, stepper, content area, footer with buttons.

**Required Features**:

#### 3.2.1 Core Props
```typescript
interface FormShellProps {
  // Content
  title: string;                 // Page title
  moduleInfo?: {
    name: string;
    label: string;
    description?: string;
    icon?: string;
  };
  children: ReactNode;           // Form content
  
  // Breadcrumbs
  bread?: BreadcrumbItem[];
  
  // Multi-Step
  steps?: string[];              // Step labels
  showStepper?: boolean;
  enableStepClick?: boolean;     // Allow clicking steps
  enableStepCompleteClickOnly?: boolean; // Only completed steps clickable
  enableStepTracking?: boolean;  // Mark completed steps
  disabledSteps?: number[];
  
  // Step Icons
  iconActive?: ReactNode;
  iconComplete?: ReactNode;
  iconIncomplete?: ReactNode;
  
  // State
  isLoading?: boolean;           // Show loading on submit button
  
  // Callbacks
  onCancel?: () => void;
  
  testMode?: boolean;
}
```

#### 3.2.2 Progress Saving Indicator
- Show "Saving..." → "Saved" in header
- Visual feedback during async operations
- Timestamp of last save

#### 3.2.3 Unsaved Changes Warning
- Warn user before leaving
- Only if form has been modified
- Don't warn if no changes

#### 3.2.4 Field-Level Error Highlighting
- Red border on invalid fields
- Error icon and message
- Auto-focus first invalid field

#### 3.2.5 Section Collapsing
- Collapse form sections (Personal, Education, Documents)
- Useful for long forms
- Persist collapsed state

#### 3.2.6 Help Text & Tooltips
- Hover over ? icon → tooltip
- Inline help for confusing fields
- Improve form completion rate

#### 3.2.7 Tab-Based Layout
- Multi-tab forms instead of stepper
- Different mental model than stepper
- Flat workflows

#### 3.2.8 Sticky Footer
- Keep footer visible while scrolling
- User can submit without scrolling up

#### 3.2.9 Dark Mode Support
- Full dark theme support
- Form backgrounds, text colors, shadows
- Smooth theme switching

#### 3.2.10 Accessibility
- ARIA labels
- Field focus order
- Screen reader support
- Keyboard navigation

#### 3.2.11 Layout Structure
```
┌─────────────────────────────────────┐
│        Header (Title & Breadcrumbs)  │
├─────────────────────────────────────┤
│          Stepper (optional)          │
├─────────────────────────────────────┤
│        Form Content (children)       │
├─────────────────────────────────────┤
│    Footer (Back, Next, Submit, Cancel)
└─────────────────────────────────────┘
```

---

### 3.3 DataTableModalShell

**Purpose**: Combines DataTableShell with FormWrapper in a modal for inline CRUD.

**Existing Implementation**: List + modal forms for create/edit/delete.

**Required Features**:

#### 3.3.1 Core Props
```typescript
interface DataTableModalShellProps {
  // Module Info
  moduleInfo: {
    name: string;
    label: string;
    description?: string;
  };
  
  // Table
  columns: ColumnDef[];
  idAccessor: string;
  
  // Filters
  filterList?: FilterDef[];
  
  // Modal API Handlers
  onCreateApi: (data: any) => Promise<any>;
  onEditApi: (id: string | number, data: any) => Promise<any>;
  onDeleteApi: (id: string | number) => Promise<void>;
  
  // Form Components
  createFormComponent: ReactNode;
  editFormComponent: ReactNode;
  
  // Callbacks
  onCreateSuccess?: (data: any) => void;
  onEditSuccess?: (data: any) => void;
  onDeleteSuccess?: () => void;
  
  // Modal
  modalWidth?: string | number;
  hasReviewPage?: boolean;
  onReviewClick?: (id: string | number) => void;
}
```

#### 3.3.2 Modal Stacking
- Support nested modals
- Parent modal dimmed behind child
- Escape closes topmost modal

#### 3.3.3 Modal Sizing Intelligence
- Auto-size based on form content
- Small form → small modal
- Large form → larger with scroll

#### 3.3.4 Modal Animations
- Smooth fade/slide in/out
- Better UX than instant appear

#### 3.3.5 Keyboard Shortcuts
- Esc to close modal
- Ctrl+S or Cmd+S to save

#### 3.3.6 Form Reset After Success
- Clear form when modal closes after create
- Next open shows blank form
- Don't pre-fill with previous data

#### 3.3.7 Modal Confirmation
- Delete shows confirmation modal
- Prevent accidental deletion

---

## 4. @settle/shared - Shared Utilities and Types

### 4.1 Hooks

#### 4.1.1 useQuery Shortcut
```typescript
useQuery<T>({
  key: string;                   // Query key
  fn: () => Promise<T>;          // Query function
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
})
```

#### 4.1.2 useMutation Shortcut
```typescript
useMutation<T, E = any>({
  fn: (data: any) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: () => void;
})
```

#### 4.1.3 useDebounce Hook
```typescript
useDebounce<T>(value: T, delay: number): T
```
- Debounce search/filter inputs
- Reduce API calls while typing

#### 4.1.4 useLocalStorage Hook
```typescript
useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```
- Persist component state
- Auto-sync across tabs

#### 4.1.5 useAsync Hook
```typescript
useAsync<T>(fn: () => Promise<T>, deps: any[]): {
  data: T | null;
  loading: boolean;
  error: any;
  execute: () => Promise<T>;
}
```

#### 4.1.6 usePrevious Hook
```typescript
usePrevious<T>(value: T): T | undefined
```

#### 4.1.7 useWindowSize Hook
```typescript
useWindowSize(): { width: number; height: number }
```

### 4.2 Services

#### 4.2.1 Notification Service
```typescript
triggerNotification.success(message: string, options?)
triggerNotification.error(message: string, options?)
triggerNotification.info(message: string, options?)
triggerNotification.warning(message: string, options?)
triggerNotification.loading(message: string)
triggerNotification.form: NotificationCallbacks  // For forms
```

#### 4.2.2 Error Boundary
```typescript
<ErrorBoundary
  fallback?: ReactNode;
  onError?: (error, info) => void;
  level?: 'page' | 'section' | 'component';
>
  {children}
</ErrorBoundary>
```

#### 4.2.3 Module Registry
```typescript
registerModule(name: string, config: ModuleConfig)
getModule(name: string): ModuleConfig
getAllModules(): ModuleConfig[]
validateModuleStructure(name: string): ValidationResult
```

### 4.3 Types

#### 4.3.1 Form Types
```typescript
type FormValues = Record<string, any>;
type ValidationErrors = Record<string, string>;
type FieldDef = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'date' | 'file';
  required?: boolean;
  validation?: ZodSchema;
  conditional?: (values: any) => boolean;
  dependsOn?: string[];
  metadata?: Record<string, any>;
};
```

#### 4.3.2 Table Types
```typescript
type ColumnDef<T = any> = {
  accessor?: string;
  accessorKey?: string;
  header: string;
  size?: number;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  pinned?: 'left' | 'right';
};

type FilterDef = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'checkbox';
  options?: Array<{ value: any; label: string }>;
  operator?: string;
};

type ActionDef = {
  label: string;
  action: (id: string | number) => void | Promise<void>;
  icon?: string;
  color?: string;
  disabled?: (row: any) => boolean;
};
```

#### 4.3.3 API Types
```typescript
type ApiResponse<T = any> = {
  err: boolean;
  data: T | null;
  error?: string;
  status?: number;
};

type PaginationData = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
};
```

---

## 5. Developer Experience Features

### 5.1 Type Safety
- Full TypeScript coverage
- Generic types for all components
- Zero `any` types in public APIs
- JSDoc comments for IDE autocomplete

### 5.2 Code Generation
- CLI tool to scaffold new modules
  ```bash
  settle generate module students
  ```
- Pre-configured folder structure
- Best practice boilerplate

### 5.3 Module Validator
- Runtime validation of module structure
- Check for required files
- Validate module.config.ts shape
- Report violations with helpful messages

### 5.4 Storybook Documentation
- Stories for all components
- Interactive prop playground
- 3+ usage examples per component
- Accessibility testing

### 5.5 Testing Utilities
- Mock implementations of wrappers
- Test helpers for forms
- Test helpers for tables
- Example test files

### 5.6 Deprecation Warnings
- Console warnings for deprecated APIs
- Migration path provided
- Helpful error messages

### 5.7 Performance Monitoring
- Optional performance metrics
- Query response times
- Form submission times
- Table render performance

### 5.8 Bundle Analysis
- Tree-shaking verification
- Size report per package
- Import analysis

---

## 6. Quality Requirements

### 6.1 Code Quality
- 80%+ TypeScript type coverage
- All public APIs documented
- No console warnings in dev mode
- ESLint + Prettier configured

### 6.2 Performance
- Form shell renders in <100ms
- Table shell renders 100 rows in <200ms
- Virtual scrolling for large tables
- Initial bundle size <50KB (gzipped)

### 6.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Focus management

### 6.4 Testing
- 80%+ unit test coverage
- E2E tests for critical flows
- Integration tests for components
- Snapshot tests for UI

### 6.5 Documentation
- API documentation for all exports
- Usage examples (basic, advanced, edge cases)
- Architecture decision records
- Migration guides for API changes

---

## 7. File Structure

```
packages/
├── core/
│   ├── src/
│   │   ├── wrappers/
│   │   │   ├── FormWrapper/
│   │   │   │   ├── FormWrapper.tsx
│   │   │   │   ├── useForm.ts
│   │   │   │   ├── useFormProps.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── __tests__/
│   │   │   └── DataTableWrapper/
│   │   │       ├── DataTableWrapper.tsx
│   │   │       ├── useDataTableWrapperStore.ts
│   │   │       ├── useDataTableContext.ts
│   │   │       ├── types.ts
│   │   │       └── __tests__/
│   │   ├── helpers/
│   │   │   ├── apiDispatch/
│   │   │   │   ├── apiDispatch.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── interceptors.ts
│   │   │   │   ├── queue.ts (offline queue)
│   │   │   │   └── __tests__/
│   │   │   ├── moduleApiCall/
│   │   │   │   ├── index.ts
│   │   │   │   ├── crud.ts
│   │   │   │   ├── batch.ts
│   │   │   │   ├── cache.ts
│   │   │   │   └── __tests__/
│   │   │   └── hooks/
│   │   │       ├── useQuery.ts
│   │   │       ├── useMutation.ts
│   │   │       ├── useDebounce.ts
│   │   │       ├── useLocalStorage.ts
│   │   │       ├── useAsync.ts
│   │   │       ├── usePrevious.ts
│   │   │       └── __tests__/
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── api.ts
│   │   │   ├── form.ts
│   │   │   └── table.ts
│   │   └── index.ts (barrel exports)
│   ├── package.json
│   └── tsconfig.json
│
├── admin/
│   ├── src/
│   │   ├── layouts/
│   │   │   ├── DataTableShell/
│   │   │   │   ├── DataTableShell.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── __tests__/
│   │   │   │   └── README.md
│   │   │   ├── FormShell/
│   │   │   │   ├── FormShell.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── __tests__/
│   │   │   │   └── README.md
│   │   │   ├── DataTableModalShell/
│   │   │   │   ├── DataTableModalShell.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── __tests__/
│   │   │   │   └── README.md
│   │   │   └── AppWrapper/
│   │   │
│   │   ├── components/
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── Table/
│   │   │   ├── Form/
│   │   │   └── __tests__/
│   │   │
│   │   ├── services/
│   │   │   ├── notification.ts
│   │   │   ├── errorBoundary.tsx
│   │   │   ├── moduleRegistry.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── hooks/
│   │   │   ├── useTable.ts
│   │   │   ├── useForm.ts
│   │   │   ├── useModal.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── darkMode.ts
│   │   │   └── theme.ts
│   │   │
│   │   └── index.ts (barrel exports)
│   ├── package.json
│   └── tsconfig.json
│
└── shared/
    ├── src/
    │   ├── types/
    │   │   ├── api.ts
    │   │   ├── form.ts
    │   │   ├── table.ts
    │   │   └── index.ts
    │   ├── constants/
    │   │   ├── httpStatus.ts
    │   │   ├── messages.ts
    │   │   └── index.ts
    │   ├── utils/
    │   │   ├── validation.ts
    │   │   ├── formatting.ts
    │   │   └── index.ts
    │   └── index.ts (barrel exports)
    ├── package.json
    └── tsconfig.json
```

---

## 8. Principles & Constraints

### 8.1 Architecture Principles
1. **Separation of Concerns** - Data layer, UI layer, application layer are separate
2. **Composition Over Inheritance** - Use React patterns, no class inheritance
3. **Single Responsibility** - Each component/hook does one thing well
4. **DRY** - Don't repeat yourself; extract reusable components
5. **Type Safety** - Full TypeScript coverage, no `any` types

### 8.2 Framework Constraints
1. **No Application Dependencies** - @settle/* packages must never import from the admin app
2. **Backward Compatibility** - Never break public APIs without deprecation period
3. **Testability** - All public APIs must be testable
4. **Documentation** - All public APIs must be documented with examples

### 8.3 Performance Constraints
1. **Bundle Size** - @settle/core <30KB, @settle/admin <40KB (gzipped)
2. **Render Time** - Components must render in <200ms
3. **Interaction Latency** - User interactions must feel instant (<100ms)

---

## 9. Success Criteria

### 9.1 Feature Completeness
- [ ] All required features implemented
- [ ] All props documented with types
- [ ] All hooks exported and working
- [ ] All services exported and working

### 9.2 Code Quality
- [ ] 80%+ TypeScript type coverage
- [ ] All public APIs documented
- [ ] No console errors/warnings in dev mode
- [ ] ESLint/Prettier passing

### 9.3 Testing
- [ ] 80%+ unit test coverage
- [ ] All critical flows E2E tested
- [ ] All components integration tested
- [ ] Performance benchmarks pass

### 9.4 Documentation
- [ ] API docs for all exports
- [ ] 3+ examples per component
- [ ] Architecture documentation
- [ ] Migration guides for breaking changes

### 9.5 Performance
- [ ] Bundle sizes within limits
- [ ] Render times within limits
- [ ] No memory leaks
- [ ] Virtual scrolling working

---

## 10. Glossary

- **Module** - A feature in the admin dashboard (Students, Batches, etc.)
- **Wrapper** - A React component that manages state via context
- **Shell** - A layout component that wraps form/table content
- **Query Key** - Unique identifier for React Query caching
- **Dirty Check** - Tracking which form fields have changed
- **Optimistic Update** - Showing changes to user before server confirms
- **Virtual Scrolling** - Only rendering visible rows in a large table
- **Form Versioning** - Supporting old form data with new form schema

---

This requirements document is the complete specification for building the improved Settle framework. It defines what to build, what features each component should have, and what quality standards must be met.
