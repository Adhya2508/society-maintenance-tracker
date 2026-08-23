# System Design Document: Society Maintenance Tracker

## 1. System Architecture

The application is structured as a **Modular Monolith** using FastAPI and Next.js, backed by PostgreSQL, Redis, Celery, Supabase Storage, and Resend.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
└────────────────────────────┬────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                      │
│  ├── Auth & RBAC (JWT)                                  │
│  ├── Complaint Management                               │
│  ├── Notice Board                                       │
│  └── SLA Settings                                       │
└────────────┬────────────────────┬───────────────────────┘
             │                    │
             ▼                    ▼
   ┌──────────────────┐  ┌──────────────────┐
   │    PostgreSQL    │  │ Supabase Storage │
   │ (Metadata & DB)  │  │ (Private Photos) │
   └──────────────────┘  └──────────────────┘
             │
             ▼
   ┌──────────────────┐
   │  Redis & Celery  │
   └─────────┬────────┘
             │
             ▼
   ┌──────────────────┐
   │ Resend Email API │
   └──────────────────┘
```

## 2. Photo Handling & Storage Strategy

Complaint images are uploaded through the FastAPI backend and validated for MIME type, size (max 5MB), and image integrity using Pillow before being stored in a private Supabase Storage bucket (`complaint-photos`). 

PostgreSQL stores only the relative storage object path (`complaints/{uuid}/{photo_id}.jpg`) rather than the binary image or permanent public URL. When an authorized resident or administrator requests a complaint, FastAPI verifies access permissions (RBAC) and dynamically generates a short-lived signed URL (expiring in 1 hour). 

This architecture guarantees:
1. **Privacy**: Private images cannot be accessed directly without an authenticated session.
2. **ACID Fail-Safety**: Since Supabase Storage and PostgreSQL are separate systems, the upload service includes cleanup logic to delete orphaned files from storage if the database transaction fails.
3. **Database Efficiency**: Database backups and queries remain lightweight.

## 3. Asynchronous Email Notifications

State transitions (e.g. ticket creation, status changes) trigger asynchronous background tasks using Celery and Redis as a message broker:
1. An immutable `Notification` record is inserted into PostgreSQL with `status = "PENDING"`.
2. A Celery task `dispatch_email_notification` is queued.
3. The task attempts delivery via Resend API and updates the notification status to `SENT` or `FAILED` with idempotency guards to prevent duplicate emails.
