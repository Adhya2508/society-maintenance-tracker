"""
Seed script — run inside Docker:
  docker exec society_api python seed.py

Or locally (with venv active):
  python seed.py
"""
import uuid
import sys
import os
from datetime import datetime, timedelta, timezone

# Allow running from the backend dir
sys.path.insert(0, os.path.dirname(__file__))

from app.database.session import SessionLocal
from app.database.models.user import User, UserRole
from app.database.models.complaint import Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority
from app.database.models.history import ComplaintHistory
from app.database.models.notice import Notice
from app.database.models.setting import SystemSetting
from app.core.security import get_password_hash

db = SessionLocal()

def wipe():
    db.query(ComplaintHistory).delete()
    db.query(Complaint).delete()
    db.query(Notice).delete()
    db.query(User).delete()
    db.query(SystemSetting).delete()
    db.commit()
    print("✓ Wiped existing data")

def seed_settings():
    db.add(SystemSetting(id="default", overdue_days=7))
    db.commit()
    print("✓ System settings seeded")

def seed_users():
    admin = User(
        id=str(uuid.uuid4()),
        name="Admin User",
        email="admin@society.com",
        password_hash=get_password_hash("DemoAdmin123!"),
        role=UserRole.ADMIN,
    )
    db.add(admin)

    residents = [
        ("Ravi Sharma",    "ravi@society.com"),
        ("Priya Patel",    "priya@society.com"),
        ("Amit Kumar",     "amit@society.com"),
        ("Sunita Mehta",   "sunita@society.com"),
        ("Rahul Verma",    "rahul@society.com"),
    ]
    resident_objs = []
    for name, email in residents:
        r = User(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            password_hash=get_password_hash("DemoResident123!"),
            role=UserRole.RESIDENT,
        )
        db.add(r)
        resident_objs.append(r)
    db.commit()
    db.refresh(admin)
    for r in resident_objs:
        db.refresh(r)
    print(f"✓ 1 admin + {len(resident_objs)} residents seeded")
    return admin, resident_objs

def seed_complaints(admin, residents):
    now = datetime.now(timezone.utc)
    specs = [
        # (resident_idx, category, priority, status, days_ago, description)
        (0, ComplaintCategory.PLUMBING,    ComplaintPriority.HIGH,   ComplaintStatus.OPEN,        10, "Severe water leakage from the kitchen sink pipe causing damage to the cabinet below."),
        (0, ComplaintCategory.ELECTRICAL,  ComplaintPriority.MEDIUM, ComplaintStatus.IN_PROGRESS,  5, "Flickering lights in the living room. Possible loose wiring issue in the junction box."),
        (1, ComplaintCategory.PLUMBING,    ComplaintPriority.HIGH,   ComplaintStatus.OPEN,         9, "Bathroom tap dripping continuously for 3 days, wasting a large amount of water."),
        (1, ComplaintCategory.CLEANING,    ComplaintPriority.LOW,    ComplaintStatus.RESOLVED,     2, "Garbage not collected from corridor on Monday. Bins were overflowing."),
        (2, ComplaintCategory.ELECTRICAL,  ComplaintPriority.HIGH,   ComplaintStatus.OPEN,        12, "Power trips every evening between 6-8 PM in flat 304. Likely overloaded circuit."),
        (2, ComplaintCategory.SECURITY,    ComplaintPriority.MEDIUM, ComplaintStatus.IN_PROGRESS,  3, "Main gate CCTV camera not working since last week. Security blind spot."),
        (2, ComplaintCategory.PARKING,     ComplaintPriority.LOW,    ComplaintStatus.RESOLVED,     8, "Visitor vehicle parked in my reserved parking spot #12 for 2 days."),
        (3, ComplaintCategory.PLUMBING,    ComplaintPriority.MEDIUM, ComplaintStatus.OPEN,         4, "Hot water not coming from geyser in master bathroom. Geyser may need repair."),
        (3, ComplaintCategory.CLEANING,    ComplaintPriority.HIGH,   ComplaintStatus.OPEN,        11, "Staircase area on floor 2 has not been cleaned in over a week. Extremely unhygienic."),
        (3, ComplaintCategory.ELECTRICAL,  ComplaintPriority.LOW,    ComplaintStatus.RESOLVED,     6, "Common area lights on floor 3 not working. Need new bulbs."),
        (4, ComplaintCategory.OTHER,       ComplaintPriority.MEDIUM, ComplaintStatus.IN_PROGRESS,  2, "Intercom system in flat 501 not working. Unable to communicate with main gate security."),
        (4, ComplaintCategory.PLUMBING,    ComplaintPriority.HIGH,   ComplaintStatus.OPEN,         8, "Sewage smell coming from bathroom drainage. Possible blockage in the drain pipe."),
        (4, ComplaintCategory.SECURITY,    ComplaintPriority.HIGH,   ComplaintStatus.OPEN,        10, "Unauthorized person seen loitering in basement parking area at night."),
        (0, ComplaintCategory.CLEANING,    ComplaintPriority.MEDIUM, ComplaintStatus.RESOLVED,     1, "Wet mopping not done in lobby area for 3 days. Floor is dirty and slippery."),
        (1, ComplaintCategory.ELECTRICAL,  ComplaintPriority.MEDIUM, ComplaintStatus.OPEN,         7, "Socket near the washing machine area gives mild shock when touched. Urgent safety concern."),
        (2, ComplaintCategory.PLUMBING,    ComplaintPriority.LOW,    ComplaintStatus.RESOLVED,     3, "Roof terrace tap left open. Large water wastage noticed."),
        (3, ComplaintCategory.PARKING,     ComplaintPriority.MEDIUM, ComplaintStatus.IN_PROGRESS,  5, "Speed breaker at parking lot entrance is broken, cars going over at high speed."),
        (4, ComplaintCategory.CLEANING,    ComplaintPriority.LOW,    ComplaintStatus.RESOLVED,     4, "Recycling bins on floor 4 not emptied for 5 days. Overflowing."),
        (0, ComplaintCategory.SECURITY,    ComplaintPriority.MEDIUM, ComplaintStatus.OPEN,         9, "Building entry door lock malfunctioning. Anyone can enter without key card swipe."),
        (1, ComplaintCategory.OTHER,       ComplaintPriority.LOW,    ComplaintStatus.RESOLVED,     2, "Elevator music system is playing same track on loop. Residents finding it irritating."),
        (2, ComplaintCategory.PLUMBING,    ComplaintPriority.HIGH,   ComplaintStatus.IN_PROGRESS,  6, "Water pressure extremely low on floor 5. Shower barely works in the mornings."),
        (3, ComplaintCategory.ELECTRICAL,  ComplaintPriority.MEDIUM, ComplaintStatus.OPEN,         3, "EV charging point in B2 parking not working. Showing error code E4."),
        (4, ComplaintCategory.CLEANING,    ComplaintPriority.MEDIUM, ComplaintStatus.OPEN,         8, "Pest control not done in common areas for over a month. Cockroach sightings increasing."),
        (0, ComplaintCategory.SECURITY,    ComplaintPriority.HIGH,   ComplaintStatus.RESOLVED,     1, "Suspicious van parked outside main gate for over 6 hours."),
        (1, ComplaintCategory.PLUMBING,    ComplaintPriority.LOW,    ComplaintStatus.OPEN,        13, "Minor dripping from rainwater pipe on the outer wall of flat 202."),
    ]

    complaints = []
    for idx, (r_idx, cat, pri, sta, days, desc) in enumerate(specs):
        created = now - timedelta(days=days)
        c = Complaint(
            id=str(uuid.uuid4()),
            complaint_number=f"CMP-{1001 + idx}",
            resident_id=residents[r_idx].id,
            category=cat,
            priority=pri,
            status=sta,
            description=desc,
            created_at=created,
            updated_at=created,
            resolved_at=created + timedelta(hours=12) if sta == ComplaintStatus.RESOLVED else None,
        )
        db.add(c)
        complaints.append((c, residents[r_idx]))

    db.commit()

    # Add history records
    for c, resident in complaints:
        db.refresh(c)
        db.add(ComplaintHistory(
            id=str(uuid.uuid4()),
            complaint_id=c.id,
            actor_id=resident.id,
            old_status=None,
            new_status=ComplaintStatus.OPEN,
            note="Complaint submitted",
            created_at=c.created_at,
        ))
        if c.status == ComplaintStatus.IN_PROGRESS:
            db.add(ComplaintHistory(
                id=str(uuid.uuid4()),
                complaint_id=c.id,
                actor_id=admin.id,
                old_status=ComplaintStatus.OPEN,
                new_status=ComplaintStatus.IN_PROGRESS,
                note="Maintenance team assigned",
                created_at=c.created_at + timedelta(hours=2),
            ))
        elif c.status == ComplaintStatus.RESOLVED:
            db.add(ComplaintHistory(
                id=str(uuid.uuid4()),
                complaint_id=c.id,
                actor_id=admin.id,
                old_status=ComplaintStatus.OPEN,
                new_status=ComplaintStatus.IN_PROGRESS,
                note="Assigned to maintenance",
                created_at=c.created_at + timedelta(hours=1),
            ))
            db.add(ComplaintHistory(
                id=str(uuid.uuid4()),
                complaint_id=c.id,
                actor_id=admin.id,
                old_status=ComplaintStatus.IN_PROGRESS,
                new_status=ComplaintStatus.RESOLVED,
                note="Issue fixed and verified",
                created_at=c.created_at + timedelta(hours=10),
            ))
    db.commit()
    print(f"✓ {len(specs)} complaints + histories seeded")

def seed_notices():
    notices = [
        ("Water Supply Maintenance Tomorrow 10 AM – 1 PM", "Water supply will be shut off tomorrow between 10:00 AM to 1:00 PM for annual pipeline maintenance. Please store sufficient water in advance.", True),
        ("Society AGM Meeting — August 30th", "All residents are invited to attend the Annual General Meeting on 30th August at 6:00 PM in the Community Hall. Agenda: budget review, upcoming renovation plans, and election of committee members.", True),
        ("Diwali Celebrations — October 20th", "The society is organizing a Diwali celebration event on October 20th at 7:00 PM in the garden area. All residents and families are welcome. Snacks and activities for children will be arranged.", False),
        ("Parking Allocation Reminder", "Residents are reminded to use only their designated parking spots. Vehicles parked in visitor slots for more than 24 hours will be towed at owner's expense.", False),
        ("New Cleaning Schedule Effective September 1st", "Starting September 1st, the common area cleaning schedule will be updated. Lobby and staircase cleaning will now happen twice daily — 7:00 AM and 5:00 PM.", False),
        ("Generator Maintenance — Sunday 9 AM", "The building's backup generator will undergo maintenance this Sunday from 9:00 AM to 11:00 AM. There may be brief power fluctuations during this period.", False),
        ("Community Library Hours Update", "The community library on the 1st floor will now be open from 8:00 AM to 9:00 PM on all days including weekends.", False),
    ]
    for title, content, important in notices:
        db.add(Notice(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            is_important=important,
        ))
    db.commit()
    print(f"✓ {len(notices)} notices seeded (2 important)")

if __name__ == "__main__":
    force_wipe = "--force" in sys.argv
    user_count = db.query(User).count()

    if force_wipe or user_count == 0:
        if force_wipe:
            print("⚠️ Force wipe requested!")
            wipe()
        print("🌱 Seeding initial database records...")
        seed_settings()
        admin, residents = seed_users()
        seed_complaints(admin, residents)
        seed_notices()
        print("\n✅ Seed complete!")
        print("   Admin:    admin@society.com / DemoAdmin123!")
        print("   Resident: ravi@society.com  / DemoResident123!")
    else:
        print(f"ℹ️ Database already initialized with {user_count} users. Skipping seed.")
    db.close()
