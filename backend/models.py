import uuid
import enum
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, Boolean, Float, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID

db = SQLAlchemy()


class VehicleTypeEnum(str, enum.Enum):
    jeep = "jeep"
    bus = "bus"
    tricycle = "tricycle"


class User(db.Model):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Route(db.Model):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    fare = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    vehicle_type = Column(
        Enum(VehicleTypeEnum, name="vehicle_type_enum"),
        nullable=False,
        default=VehicleTypeEnum.jeep
    )
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Route(id={self.id}, origin={self.origin}, destination={self.destination})>"