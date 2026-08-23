# System Design: Greenview Heights Maintenance Tracker

This document details the architectural specifications, component topology, database schemas, security models, and deployment constraints for the Greenview Heights Society Maintenance Tracker.

---

## 1. System Topology & Architecture

The application implements a **Modular Monolith** pattern. This architecture balances ease of deployment and code simplicity while maintaining strict boundaries between logical domains (Authentication, Complaint Lifecycle, Notice Boards, and System Settings).

```
                 +-----------------------------------------+
                 |            Next.js Frontend             |
                 +--------------------+--------------------+
                                      |
                                      | REST API (JSON / Multipart)
                                      v
                 +--------------------+--------------------+
                 |              FastAPI Backend            |
                 |  +-----------------------------------+  |
                 |  |         Auth Module (JWT)         |  |
                 |  +-----------------------------------+  |
                 |  |        Complaints Module          |  |
                 |  +-----------------------------------+  |
                 |  |         Notices Module            |  |
                 |  +-----------------------------------+  |
                 |  |        Settings / SLA Module      |  |
                 |  +-----------------------------------+  |
                 +--------+--------------------+-----------+
                          |                    |
            SQL Queries   |                    | Signed URLs (1h expiry)
                          v                    v
                 +--------+-------+   +--------+-------+
                 |   PostgreSQL   |   |    Supabase    |
                 |  (Relational)  |   |    Storage     |
                 +--------+-------+   +----------------+
                          |
                          | PubSub Task Queue
                          v
                 +--------+-------+
                 |  Redis Broker  |
                 +--------+-------+
                          |
                          | Worker Pull
                          v
                 +--------+-------+
                 | Celery Workers |
                 +--------+-------+
                          |
                          | REST API Call
                          v
                 +--------+-------+
                 |   Resend API   |
                 +----------------+
```

### Component Breakdown:
1. **Frontend (Next.js 16)**: Operates as a single-page client application utilizing client-side routing (`next/navigation`). It connects to the backend API asynchronously using Axios.
2. **Backend (FastAPI)**: Exposed via Uvicorn. Validates incoming requests, manages session tokens, coordinates database transactions, executes database migrations via Alembic, and signs assets.
3. **Database (PostgreSQL 15)**: Stores transactional tables with relational constraints, indices for fast query lookups, and system configurations.
4. **Broker & Queue (Redis + Celery)**: Separates high-latency operations (like sending emails via third-party APIs) from the request-response thread.

---

## 2. Photo Handling & Storage Strategy

One of the core design requirements is handling binary images (like photos of broken pipes or electrical boxes) in a highly secure, scalable, and fail-safe manner. 

### Security & Signed URLs
Storing photos directly inside PostgreSQL as binary large objects (`BLOB` / `BYTEA`) degrades query performance, inflates database backup sizes, and limits scale. Alternatively, storing files on a public server exposes resident privacy.

To solve this, we use a private **Supabase Storage** bucket combined with dynamic **short-lived signed URLs**:
1. When a resident creates a complaint with a photo, the frontend uploads the binary file via a multipart form request to FastAPI.
2. FastAPI validates the file (MIME type check, maximum 5MB size limit).
3. The backend uploads the file to a private path in Supabase Storage: `complaints/{complaint_uuid}/{photo_uuid}.jpg`.
4. PostgreSQL **only stores the relative path** (`complaints/{uuid}/{photo_uuid}.jpg`) as a string field.
5. When a user requests to view a complaint details page, the backend retrieves the relative path from the database, runs a role-based access control check (RBAC), and uses the Supabase API to generate a **Signed URL** with an expiration time of 3600 seconds (1 hour).
6. The frontend renders the short-lived URL. If an attacker copies this link, it will automatically expire and return a 403 Forbidden message after one hour.

### ACID Fail-Safety
Because writing to storage and committing to a database are separate operations, we implement a fallback pipeline:
* If the Supabase upload succeeds but the subsequent PostgreSQL database transaction fails (e.g., due to constraint violations or database connection loss), FastAPI captures the exception, triggers a rollback, and fires an asynchronous cleanup command to delete the orphaned image from Supabase Storage. This prevents storage bloat.

---

## 3. Asynchronous Worker & Notification Pipeline

Updating a complaint status (e.g., from `OPEN` to `IN_PROGRESS`) requires sending email alerts to both the resident and the assigned staff member. Making the client wait for a third-party email API (Resend) to respond would introduce 1 to 2 seconds of latency to simple UI actions. 

We utilize a decoupled **Event-Driven Task Queue**:

1. **State Transition**: A controller alters a database record (e.g., `Complaint.status = 'IN_PROGRESS'`).
2. **Notification Logging**: Before trigger, the backend creates an entry in the `notifications` table with `status = PENDING` and a unique `id`.
3. **Enqueueing**: The backend publishes a task payload `dispatch_email_notification(notification_id, recipient, subject, body)` to Redis.
4. **Background Execution**: A running Celery worker pulls the task. It retrieves the notification record, increments the `attempts` count, and makes an HTTP POST request to the Resend API.
5. **Idempotency Guard**: Before sending, the worker verifies that `status != 'SENT'` in the database. If a task is duplicated or retried by Celery due to network hiccups, the worker exits immediately without sending duplicate emails.
6. **Error Handling & Backoff**: If Resend fails or returns an error, the worker updates the notification record to `FAILED`, stores the traceback error string, and retries the task with exponential backoff (up to 3 retries).

---

## 4. Database Schema & State Machine

The database is built on top of relational integrity constraints. The primary entity relationships are defined below:

* **User**: Connects to `complaints` (as creator) and `notices` (as author).
* **Complaint**: Stores the lifecycle of issues. Points to `users` (foreign key `resident_id`) and tracks category, priority, and status.
* **Notification**: Tracks transactional history, attempts, and error logs.
* **SystemSetting**: Stores SLA properties (e.g., `overdue_days`).

### The SLA Overdue State Machine
A Celery beat task runs nightly to check for overdue tickets. If a complaint's status is not `RESOLVED` and the duration since creation exceeds `SystemSetting.overdue_days`, the status is flagged as overdue, alerting administrators.

---

## 5. Cloud Deployment & Render Considerations

For hosting this modular monolith, we have two primary cloud models:

### Deployment Option 1: Render.com
Render is a cloud hosting provider that supports web services, background workers, and managed databases.

**How to deploy backend on Render**:
* **FastAPI Backend (Web Service)**: Create a new Web Service on Render, point it to your repository, set the build command to `pip install -r backend/requirements.txt` and the start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (adjusting directories).
* **Celery Workers (Background Worker)**: Create a Render Background Worker service pointing to the same repo, with start command `celery -A app.infrastructure.celery.celery_app worker --loglevel=info`.
* **Database (Render PostgreSQL)**: Provision a managed Postgres database in the Render dashboard and set the connection string as `DATABASE_URL` in both services.
* **Redis (Render Redis)**: Spin up a managed Redis instance and copy its URL to `REDIS_URL`.
* **Next.js Frontend (Static Site / Web Service)**: Create a Web Service for the frontend folder.

#### Will Render work?
**Yes, Render will work perfectly.** However, you must be aware of the following **Free Tier Limitations** on Render:
1. **Spin-down delay (Cold Starts)**: Free Web Services spin down after 15 minutes of inactivity. When a user visits the page after a period of dormancy, the API will experience a 50+ second delay to spin back up, which might look like a connection timeout on the login screen.
2. **Resource Constraints**: Render's free tier provides 512MB RAM. Running memory-intensive tasks or high-concurrency connections can cause your API or Celery worker to crash due to Out Of Memory (OOM) errors (similar to the 137 exit code we fixed earlier).
3. **No Permanent Local Storage**: Any uploads to local disks will disappear when the service redeploys or restarts. Because our design uses **Supabase Storage** (external cloud bucket) instead of saving files locally on the disk, this limitation does not affect us.

### Deployment Option 2: Docker Compose on a VPS (Recommended)
Hosting on a single $6/month Virtual Private Server (VPS) via Docker Compose provides full root access, zero spin-down delays, and avoids arbitrary resource limits. The database, Redis, Celery, and API run in coordinated containers, sharing memory efficiently.
