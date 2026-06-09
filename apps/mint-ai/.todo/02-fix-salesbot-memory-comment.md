# Fix: Misleading memoryLimit comment in salesbot

**File:** `src/workflows/momo/salesbot/index.ts`

**Problem:** `memoryLimit: 1000` has a comment saying "fetch last 5 messages" — misleading.

**Fix:** Update comment to accurately describe the limit value.

- [ ] Fix inline comment on memoryLimit
