from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime

# --- User ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

# INPUT: What the frontend sends (No ID, No Role)
class UserCreate(UserBase):
    password: str
    full_name: str
    phone: str
    department: str

# OUTPUT: What the backend sends back (Includes Generated ID & Role)
class UserResponse(UserBase):
    id: int
    employee_id: str 
    full_name: str 
    department: str 
    role: str
    class Config:
        from_attributes = True

# --- WebAuthn ---
class DeviceBindStart(BaseModel):
    username: str 

class DeviceBindComplete(BaseModel):
    username: str
    credential_json: Any
    device_name: str

class WebAuthnLoginStart(BaseModel):
    username: str 

class WebAuthnLoginComplete(BaseModel):
    username: str
    password: str
    credential_json: Any 

# --- Productivity ---
class InactivityRecord(BaseModel):
    user_id: int
    duration_seconds: int