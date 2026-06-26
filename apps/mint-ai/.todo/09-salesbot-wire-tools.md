# Wire tools back into salesbot workflow

**File:** `src/workflows/momo/salesbot/index.ts`

**Problem:** The three API tools (`getProductCategory`, `getProductsByCategory`, `getProductData`) are commented out. The core differentiator of the system is not exercised.

**Steps:**

- [ ] Uncomment all three tool definitions
- [ ] Verify `apicall` executor handles `${{fromAI(...)}}` URL interpolation via `resolveToolDynamic`
- [ ] Check `resolveToolDynamic` correctly injects AI-provided values into URL template
