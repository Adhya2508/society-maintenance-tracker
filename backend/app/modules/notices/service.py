import uuid
from sqlalchemy.orm import Session
from app.database.models.notice import Notice
from app.modules.notices.schemas import NoticeCreate

def create_notice(db: Session, payload: NoticeCreate) -> Notice:
    notice = Notice(
        id=str(uuid.uuid4()),
        title=payload.title,
        content=payload.content,
        is_important=payload.is_important
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

def get_all_notices(db: Session):
    # Important notices pin to the top, followed by newest
    return db.query(Notice).order_by(Notice.is_important.desc(), Notice.created_at.desc()).all()