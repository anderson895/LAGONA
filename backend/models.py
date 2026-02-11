from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
import enum

db = SQLAlchemy()

class VehicleTypeEnum(enum.Enum):
    jeep = "jeep"
    bus = "bus"
    tricycle = "tricycle"

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Route(db.Model):
    __tablename__ = "routes"
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    fare = db.Column(db.Float, nullable=False)
    distance_km = db.Column(db.Float, nullable=False)
    vehicle_type = db.Column(db.Enum(VehicleTypeEnum), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # ADD THIS METHOD to fix serialization
    def to_dict(self):
        return {
            'id': str(self.id),
            'origin': self.origin,
            'destination': self.destination,
            'fare': float(self.fare),
            'distance_km': float(self.distance_km),
            'vehicle_type': self.vehicle_type.value,  # Returns "jeep" not "VehicleTypeEnum.jeep"
            'description': self.description,
            'is_active': self.is_active
        }