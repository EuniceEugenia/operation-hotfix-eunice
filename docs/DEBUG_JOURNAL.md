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
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

---

## Bug 3 — Infinite Loop

| Field          | Your Entry |
| -------------- | ---------- |
| **Symptom**    |            |
| **Hypothesis** |            |
| **AI Prompt**  |            |
| **Fix**        |            |

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
