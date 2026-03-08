# Audit Trail Implementation 📝🖥️

## Overview

An audit trail system was implemented to automatically record every successful shipment status change.<br><br>

Each audit log entry captures the following information:<br>

- Which shipment was modified<br>
- The previous shipment status<br>
- The new shipment status<br>
- When the change occurred<br><br>

This ensures operational transparency for warehouse managers and provides a reliable history of shipment state transitions.<br><br>

The audit logging mechanism is implemented at the **database layer** using a PostgreSQL trigger. This guarantees that every successful status change is recorded automatically, regardless of where the update originates within the application.<br>

---

# 1. Schema Design

The audit trail is stored in a dedicated table named `audit_logs`.<br>

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),

  shipment_id uuid not null
    references shipments(id)
    on delete cascade,

  old_status text not null,
  new_status text not null,

  changed_at timestamptz not null default now()
);
```

### Column Rationale

**id**<br>
Unique identifier for each audit record. A UUID is used to ensure globally unique log entries.<br><br>

**shipment_id**<br>
Foreign key referencing `shipments.id`. This associates each audit log entry with the shipment that was modified.<br><br>

**old_status**<br>
Stores the shipment status before the update occurred.<br><br>

**new_status**<br>
Stores the shipment status after the update.<br><br>

**changed_at**<br>
Timestamp indicating when the status change occurred. The default `now()` ensures the database records the exact time of the event.<br>

---

# 2. Row Level Security (RLS)

Row Level Security (RLS) is enabled on the `audit_logs` table to protect the integrity of the audit trail.<br><br>

The audit log is designed as an **append-only system log**, meaning:<br>

* Application users cannot modify existing records<br>
* Audit history cannot be altered or deleted<br>
* Only the system is allowed to insert log entries<br><br>

Insert operations are performed by a database trigger function that runs with **`SECURITY DEFINER` privileges**. This allows the database itself to write audit records while preventing application users from inserting logs directly.<br><br>

A policy allows the internal `postgres` role to perform inserts:<br>

```sql
alter policy "allow postgres to insert audit logs"
on "public"."audit_logs"
to postgres
with check (true);
```

Because this policy only applies to the `postgres` role, client applications cannot insert audit records directly.<br>
This ensures the audit trail cannot be tampered with from the application layer.<br>

---

# 3. Insert Mechanism

The **Database Trigger** approach was chosen to record audit events.<br><br>

A PostgreSQL `AFTER UPDATE` trigger is attached to the `shipments` table. Whenever the shipment status changes, the trigger automatically inserts a log entry into `audit_logs`.<br><br>

Example trigger definition:<br>

```sql
create trigger shipment_status_audit_trigger
after update on shipments
for each row
when (old.status is distinct from new.status)
execute function log_shipment_status_change();
```

The trigger calls a PostgreSQL function that inserts the status change into the audit log table.<br><br>

This function runs with `SECURITY DEFINER`, which allows the database to insert records even when RLS is enabled on the table.<br>

---

# 4. Trade-offs

Two approaches were considered for implementing the audit logging mechanism:  
writing the audit log in the **Server Action** or enforcing it at the **Database Trigger** level.<br>

| Aspect | Database Trigger (Chosen) | Server Action (Alternative) |
|--------|---------------------------|-----------------------------|
| Logging location | Database layer | Application layer |
| Consistency | Guaranteed — every successful update triggers a log entry automatically | Depends on application code calling the logging logic |
| Risk of missing logs | Very low — database enforces logging regardless of where updates originate | Higher — future developers might update shipment status without adding the logging call |
| Coupling | Loosely coupled from the application | Tightly coupled to the server action logic |
| Debugging | Slightly harder since logic is inside the database | Easier to debug within application code |

### Reason for Choosing the Trigger Approach

The **database trigger approach** was selected because it guarantees that every successful shipment status change is recorded at the database level.<br>
This ensures the audit trail remains consistent even if future updates are performed outside the current application code.<br>

### Trade-off of Not Choosing Server Action

Using the server action approach could be simpler to debug and maintain within the application layer.<br>
However, it introduces the risk that future developers might update shipment status without including the audit logging logic, resulting in missing audit records.<br>

---

# 5. Conclusion

The audit trail system ensures that every successful shipment status change is recorded automatically in a secure, append-only log.<br><br>
By combining a database trigger, `SECURITY DEFINER` privileges, and RLS protection, the system guarantees reliable and tamper-resistant tracking of shipment status transitions.<br>
