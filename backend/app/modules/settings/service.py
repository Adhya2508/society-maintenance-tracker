from sqlalchemy.orm import Session
from app.database.models.setting import SystemSetting
from app.modules.settings.schemas import SettingUpdate

def get_system_settings(db: Session) -> SystemSetting:
    setting = db.query(SystemSetting).first()
    if not setting:
        setting = SystemSetting(id="default", overdue_days=7)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

def update_system_settings(db: Session, payload: SettingUpdate) -> SystemSetting:
    setting = get_system_settings(db)
    setting.overdue_days = payload.overdue_days
    db.commit()
    db.refresh(setting)
    return setting