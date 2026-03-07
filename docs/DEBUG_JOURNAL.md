# Debug Journal

Complete one entry per bug. All six entries are required for full marks.

---

## Bug 1 — Silent RLS Block

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    | The dashboard page loads successfully, but the shipments table displays "No Data Found". However, the `shipments` table in Supabase contains 5 rows confirmed through the Table Editor. No errors appear in the browser console, indicating that the query executes but returns no visible rows. |
| **Hypothesis** | Since the database clearly contains rows but the frontend query returns an empty dataset without errors, the issue may be related to database access control. Supabase uses Row Level Security (RLS), so it is possible that the current RLS configuration does not allow the `anon` role used by the frontend client to perform SELECT operations on the `shipments` table. |
| **AI Prompt**  | I'm debugging a Next.js logistics dashboard that fetches data from a Supabase table called `shipments`. <br><br> The dashboard loads but shows "No Data Found" even though the database contains 5 rows. <br><br> Observations: <br> - The query does not produce an error but results in an empty dataset. <br> - No error appears in the console. <br> - Row Level Security is enabled on the table. <br><br> Could RLS cause a query to silently return empty results instead of throwing an error? <br> How can I inspect the current RLS policies to confirm whether access is being blocked? |
| **Fix**        | Upon inspecting the RLS policies for the `shipments` table, it was discovered that only an UPDATE policy existed for the `public` role, while no SELECT policy was defined. Because RLS denies access by default when no policy explicitly allows it, the frontend query could not retrieve any rows. To resolve this issue, a new SELECT policy was created allowing the `anon` role to read rows from the `shipments` table. After applying the policy and refreshing the dashboard, the shipment records were successfully displayed. |

---

## Bug 2 — Ghost Mutation

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom** | Changing the shipment status from the dropdown triggers a success notification ("Status updated successfully") with a check icon in the UI. However, after refreshing the page, the status reverts to its original value.<br><br>This behavior occurs for every status transition (e.g., Pending → In Transit or In Transit → Delivered). The UI appears to indicate success, but the change never persists in the database after refreshing the dashboard. |
| **Hypothesis** | **Observations:**<br>- The UI consistently shows a success notification after attempting to update the shipment status.<br>- Refreshing the dashboard immediately restores the original status.<br>- No errors appear in the browser console.<br>- Checking the Supabase dashboard confirms the `shipments` table rows never actually change.<br><br>**Possible hypotheses:**<br>1. UPDATE operations might be blocked by Row-Level Security (similar to Bug 1).<br>2. The mutation query might not correctly target the intended row.<br>3. The Supabase mutation may not be awaited, causing the server action to return before the update completes.<br>4. The mutation result may not be validated, causing the function to return success even when the update fails.<br><br>**Investigation:**<br>After inspecting `src/actions/update-status.ts`, I found that the Supabase mutation was executed without `await`, and the returned result was never inspected for errors. The function always returned `{ success: true }`, meaning the UI displayed success regardless of whether the database update actually succeeded. |
| **AI Prompt**  | I am debugging a Next.js Server Action that updates a shipment status in a Supabase table.<br><br>Observed behavior:<br>- Changing the shipment status from the dropdown shows a success notification.<br>- Refreshing the dashboard restores the original status.<br>- The Supabase `shipments` table does not reflect any changes after the update.<br>- No errors appear in the browser console.<br><br>The server action currently executes this mutation:<br>`supabase.from('shipments').update({ status }).eq('id', id)`<br><br>The function then immediately returns `{ success: true }`.<br><br>Could this behavior occur if the Supabase mutation is not awaited or if the mutation result is not checked for errors? |
| **Fix** | Updated the server action to properly await the Supabase mutation so the function waits for the database operation to complete before returning a response and handle potential errors returned by the database.<br><br>The mutation result is now captured using `const { error } = await supabase.from('shipments').update({ status }).eq('id', id)`. If an error occurs, the function throws an exception instead of silently returning success. This ensures the UI only reports success when the database update actually completes.<br><br>After applying this change, status updates persist correctly in the database and remain unchanged after refreshing the dashboard. |

---

## Bug 3 — Infinite Loop

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom** | When opening `/dashboard`, the page freezes immediately and becomes unresponsive. The backend server logs show hundreds of repeated `GET /dashboard` requests every second even though the user is not interacting with the page. |
| **Hypothesis** | **Observations:**<br>- The issue occurs immediately when the dashboard loads.<br>- Server logs show continuous `GET /dashboard` requests.<br>- Requests occur without any user interaction.<br>- The DataTable component contains a `useEffect` that updates the URL using `router.push()` when sorting changes.<br><br>**Possible hypotheses:**<br>1. The `useEffect` dependency array may contain a value that changes on every render.<br>2. The effect may be triggering `router.push()` repeatedly, causing continuous navigation.<br>3. The navigation may cause the page to re-render, which triggers the effect again and creates a render loop.<br><br>**Investigation:**<br>Inspection of `src/components/data-table.tsx` revealed that the `useEffect` responsible for syncing sorting state to the URL query parameters was running repeatedly. The dependency array contained an unstable reference that changed during every render. Because the effect executed `router.push()`, each render triggered navigation to `/dashboard`, which caused the page to reload and the effect to run again, resulting in an infinite navigation loop. |
| **AI Prompt** | I am debugging a Next.js 15 application using the App Router and TanStack Table.<br><br>Observed behavior:<br>- Opening `/dashboard` causes the page to freeze.<br>- The server logs show hundreds of repeated `GET /dashboard` requests.<br>- The requests occur even when the user does nothing.<br>- No errors appear in the browser console.<br><br>In `src/components/data-table.tsx`, a `useEffect` updates the URL query parameters whenever the sorting state changes.<br><br>Possible hypotheses I am considering:<br>- The dependency used inside the `useEffect` might produce a new reference on every render.<br>- The effect might be triggering `router.push()` repeatedly, causing continuous navigation.<br>- The navigation might cause the page to re-render, which triggers the effect again and creates a render loop.<br><br>Could one of these explain the repeated `GET /dashboard` requests, and what would be the correct way to stabilize the dependency so the effect only runs when the sorting state actually changes? |
| **Fix** | The issue was caused by the `useEffect` dependency referencing `table.getState().sorting`, which could produce a new reference on every render. React therefore treated the dependency as changed each time, repeatedly executing the effect and triggering `router.push()`, which caused continuous navigation and flooded the server with repeated `GET /dashboard` requests.<br><br>The fix was to depend only on the stable React state `sorting`, which changes only when the user updates the table sorting. This prevents the effect from running on every render.<br><br>Additionally, the ESLint `react-hooks/exhaustive-deps` rule was disabled for this line to intentionally limit the dependency to `sorting`, avoiding unnecessary re-execution of the effect.<br><br>Final dependency:<br>`// eslint-disable-next-line react-hooks/exhaustive-deps`<br>`}, [sorting]);` |

---

## Bug 4 — The Invisible Cargo

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

---

## Bug 5 — The Unreliable Search

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

---

## Bug 6 — The Persistent Ghost

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |
