# System Design — Greenview Heights Society Maintenance Tracker

![Architecture Diagram](./Video%20walkthrough%20and%20screenshots/architecture%20diagram.png)

---

## 1. System Topology & Architecture

The application is structured as a **Modular Monolith** prioritizing maintainability, data consistency, and low-latency client-server interactions.

```
[Browser Client] ──(HTTPS)──► [Next.js 16 App Router on Vercel]
                                      │ (REST / JSON / Multipart)
                                      ▼
                             [FastAPI on Render]
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   [PostgreSQL 15 (Render)]  [Supabase Storage]       [Resend API]
   (Relational Data / ACID)  (Private S3 Bucket)   (Transactional Email)
```

The backend is built with **FastAPI** running on Uvicorn, with logically isolated domain modules (Auth, Complaints, Notices, Dashboard, Settings). The frontend is a responsive **Next.js 16** single-page application hosted on Vercel.

---

## 2. Complaint Lifecycle & Status History Design

Complaints follow a strict forward-moving finite state machine:
$$\text{OPEN} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{RESOLVED}$$

```
+-----------+      Admin Claim / Triage      +---------------+      Resolution Verified      +------------+
|   OPEN    | ─────────────────────────────► |  IN_PROGRESS  | ────────────────────────────► |  RESOLVED  |
+-----------+                                +---------------+                               +------------+
```

* **Access Control**: Residents submit complaints; only authorized `ADMIN` roles can transition statuses or assign priorities.
* **Audit Trail (`ComplaintHistory`)**: Every status change atomically records an entry in `complaint_history` capturing `old_status`, `new_status`, `comment`, and `changed_at`. This provides an immutable, chronological timeline visible to residents and administrators.

---

## 3. Overdue Detection & Priority Handling

Complaints are categorized into three operational priorities: `LOW`, `MEDIUM`, and `HIGH`. 

* **Dynamic SLA Computation**: Rather than relying on fragile polling workers, overdue states are derived dynamically at query time:
  $$\text{Overdue} \iff \text{status} \neq \text{RESOLVED} \quad \land \quad (\text{NOW}() - \text{created\_at}) > \text{SLA Threshold}$$
* **Configurable SLA**: The threshold is stored in `system_settings.overdue_days` (default 7 days) and is adjustable via the Admin Settings portal without redeployment.
* **Triage Prioritization**: Open complaints exceeding SLA thresholds are flagged with urgent badges (`OVERDUE`) and elevated in sorting order across admin queues.

---

## 4. Photo Upload & Notice Board Design

### Private Cloud Storage (Supabase)
To preserve database throughput, binary images are never stored as PostgreSQL BLOBs:
1. **Validation**: FastAPI enforces a 5MB size limit and validates MIME types (`image/jpeg`, `image/png`).
2. **Storage Structure**: Uploaded assets reside in a private bucket: `complaints/{complaint_id}/{uuid}.jpg`.
3. **Signed URLs**: On retrieval, the backend generates short-lived, pre-signed URLs (1-hour TTL). Expired links deny unauthorized access.
4. **Rollback Cleanup**: If a database transaction fails post-upload, an asynchronous hook cleans up orphaned files in Supabase.

### Notice Board Architecture
Admins broadcast society-wide alerts with an `is_important` boolean flag. Important notices are pinned to the top of the feed and highlighted with urgent banner styling across resident dashboards.

---

## 5. Notification Flow

When a complaint transitions state, automated email alerts are triggered:

```
[Status Change Triggered]
           │
           ▼
[Background Thread / Async Dispatcher] ──► [Resend API] ──► [Resident Inbox]
           │ (Fail-safe Fallback)
           ▼
[Notification Logged in DB]
```

* **Non-Blocking Execution**: Notifications are dispatched asynchronously using Python `threading.Thread` workers. This decouples third-party API latency (1–2s) from client HTTP response times (<50ms).
* **Hybrid Task Queue**: The architecture natively supports Celery + Redis brokers when deployed on dedicated clusters, but automatically falls back to managed thread pools for zero-overhead serverless environments.

---

## 6. Dashboard & Reporting Engine

The Dashboard engine delivers high-throughput metrics via aggregated SQL queries:
* **Key Metrics**: Total complaints, Active tickets, Pending notices, and Overdue count.
* **Breakdown Visualizations**: Complaints aggregated by Category (Plumbing, Electrical, Security, Cleaning, Other) and Priority status.
* **SLA Performance**: Dynamic computation of resolution times and bottleneck identification.

---

## 7. Database Schema & API Design

```sql
users (id PK, name, email UNIQUE, password_hash, role [ADMIN|RESIDENT], created_at)
complaints (id PK, resident_id FK, title, description, category, priority, status, photo_path, created_at, updated_at)
complaint_history (id PK, complaint_id FK, old_status, new_status, comment, changed_at)
notices (id PK, title, content, is_important, created_at)
system_settings (id PK, overdue_days)
```

* **Authentication**: Stateless JWT (`HS256`, 24-hour expiration) with Argon2 password hashing.
* **REST API Endpoints**:
  * `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
  * `GET/POST /api/complaints`, `GET/PATCH /api/complaints/{id}`
  * `GET/POST/DELETE /api/notices`
  * `GET /api/admin/dashboard`, `GET/PUT /api/settings`
* **Interactive Documentation**: Interactive OpenAPI / Swagger docs are automatically generated and exposed at `/api/docs`.
