from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from database import Base


class TransactionRecord(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    row_index = Column(Integer, nullable=True)
    merchant = Column(String, default="UNSPECIFIED_MERCHANT", index=True)
    category = Column(String, default="General")
    amount = Column(Float, nullable=False)
    location = Column(String, default="Online")
    time_stamp = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    risk_level = Column(String, nullable=False, index=True)  # "safe" | "caution" | "danger"
    risk_score = Column(Float, nullable=False)  # 0 - 100
    reasons_json = Column(String, nullable=False, default="[]")  # JSON encoded reasons string
    is_resolved = Column(Boolean, default=False, index=True)
    resolution = Column(String, nullable=True)  # "safe" | "blocked"
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))


class CardSetting(Base):
    __tablename__ = "card_settings"

    id = Column(Integer, primary_key=True, default=1)
    frozen = Column(Boolean, default=False)
    single_purchase_limit = Column(Float, default=1500.0)
    block_overseas = Column(Boolean, default=True)
    block_high_risk_merchants = Column(Boolean, default=True)
    updated_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))


class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, default=1)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)  # "M" | "F" | "other"
    home_city = Column(String, nullable=False)
    home_state = Column(String, nullable=False)
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

