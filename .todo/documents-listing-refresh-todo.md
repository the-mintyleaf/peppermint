# Documents listing refresh

## Phase 1: Columns

- [x] Reorder columns: Applicant → By status → Code → Documents → Last Updated
- [x] Bump status badges xs → sm
- [x] Last Updated: compact relative time + exact-time tooltip (timeAgo helper)

## Phase 2: Editor column

- [x] Rename Actions column → Editor
- [x] Subtle "Open Editor" button + ArrowUpRight icon
- [x] Info ActionIcon opening the detail drawer
- [x] Wire drawer state in DocumentsList

## Phase 3: Detail drawer

- [x] DocumentWorkspaceDrawer.types.ts
- [x] DocumentWorkspaceDrawer.tsx (accordion of documents, lazy)
- [x] DocumentRevisionsPrintsPanel.tsx (lazy revisions + prints)
- [x] index.ts barrel

## Phase 4: Verify

- [x] pnpm format && check-types && lint (documents scope clean)
- [ ] visual review (needs running app)
