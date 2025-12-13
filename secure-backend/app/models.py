from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, LargeBinary
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(150), unique=True, index=True)
    employee_id = Column(String(50), unique=True, index=True)
    full_name = Column(String(500)) 
    department = Column(String(500)) 
    phone = Column(String(500))      
    password_hash = Column(String(255)) 
    role = Column(String(20), default="employee")
    is_active = Column(Boolean, default=True)
    current_challenge = Column(String(255), nullable=True)

    bound_devices = relationship("DeviceBinding", back_populates="owner")
    attendance = relationship("AttendanceLog", back_populates="owner")
    activity_logs = relationship("InactivityLog", back_populates="owner")

class DeviceBinding(Base):
    __tablename__ = "device_bindings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    credential_id = Column(String(500), unique=True, index=True)
    public_key = Column(LargeBinary) 
    sign_count = Column(Integer, default=0)
    device_name = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner = relationship("User", back_populates="bound_devices")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    clock_in_time = Column(DateTime(timezone=True), server_default=func.now())
    clock_out_time = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(String(500)) 
    status = Column(String(20), default="Present") 
    owner = relationship("User", back_populates="attendance")

class InactivityLog(Base):
    __tablename__ = "inactivity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    owner = relationship("User", back_populates="activity_logs")

class AllowedNetwork(Base):
    __tablename__ = "allowed_networks"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(50), unique=True, index=True)
    description = Column(String(100))
    added_at = Column(DateTime(timezone=True), server_default=func.now())

# --- NEW: SECURITY LOGS ---
class SecurityLog(Base):
    __tablename__ = "security_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    event_type = Column(String(50)) # login, logout, security, device
    severity = Column(String(20))   # info, warning, error, success
    description = Column(String(255))
    ip_address = Column(String(50))
    user_identifier = Column(String(100)) # Username or 'Unknown'