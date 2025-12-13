from fastapi import FastAPI, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, desc
import json
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url, options_to_json
from pydantic import BaseModel
from datetime import timedelta, date, datetime

from . import models, schemas, database, utils, encryption

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Secure Attendance 3FA System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to Log Security Events
def log_security_event(db: Session, type: str, severity: str, desc: str, ip: str, user: str = "Unknown"):
    new_log = models.SecurityLog(
        event_type=type, severity=severity, description=desc, ip_address=ip, user_identifier=user
    )
    db.add(new_log)
    db.commit()

# --- SECURITY HELPER ---
def check_ip_whitelist(request: Request, db: Session):
    client_ip = request.client.host
    allowed = db.query(models.AllowedNetwork).filter(models.AllowedNetwork.ip_address == client_ip).first()
    
    if not allowed:
        print(f"BLOCKING IP: {client_ip}") 
        log_security_event(db, "security", "error", "Blocked unauthorized IP access", client_ip)
        raise HTTPException(status_code=403, detail=f"Access Denied: IP {client_ip} not authorized.")
    return client_ip

# --- AUTH ROUTES ---
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email already registered")
    
    # Auto-Generate Employee ID
    last_user = db.query(models.User).order_by(desc(models.User.id)).first()
    new_id_num = 1
    if last_user and last_user.employee_id and last_user.employee_id.startswith("EMP-"):
        try:
            last_num = int(last_user.employee_id.split("-")[1])
            new_id_num = last_num + 1
        except:
            new_id_num = last_user.id + 1
    final_emp_id = f"EMP-{new_id_num:05d}"

    hashed_pw = utils.get_password_hash(user.password)
    enc_name = encryption.encrypt_data(user.full_name)
    enc_phone = encryption.encrypt_data(user.phone)
    enc_dept = encryption.encrypt_data(user.department)
    
    new_user = models.User(
        username=user.email, email=user.email, employee_id=final_emp_id,
        full_name=enc_name, phone=enc_phone, department=enc_dept,
        password_hash=hashed_pw, role="employee"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_security_event(db, "admin", "success", f"New user registered: {final_emp_id}", request.client.host, user.email)
    
    return {
        "id": new_user.id, "username": new_user.username, "email": new_user.email,
        "employee_id": new_user.employee_id, "full_name": user.full_name, 
        "department": user.department, "role": new_user.role
    }

@app.post("/webauthn/register/options")
def bind_options(data: schemas.DeviceBindStart, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    user = db.query(models.User).filter(models.User.email == data.username).first()
    if not user: raise HTTPException(404, "User not found")
    
    options = utils.generate_bind_options(user)
    user.current_challenge = bytes_to_base64url(options.challenge)
    db.commit()
    return json.loads(options_to_json(options))

@app.post("/webauthn/register/complete")
def bind_complete(data: schemas.DeviceBindComplete, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    user = db.query(models.User).filter(models.User.email == data.username).first()
    if not user or not user.current_challenge: raise HTTPException(400, "Session expired")
    
    try:
        verification = utils.verify_bind_response(data.credential_json, user.current_challenge)
        cred_id_str = bytes_to_base64url(verification.credential_id)

        if db.query(models.DeviceBinding).filter(models.DeviceBinding.credential_id == cred_id_str).first():
             raise HTTPException(400, "Device already bound")

        new_device = models.DeviceBinding(
            user_id=user.id, credential_id=cred_id_str,
            public_key=verification.credential_public_key,
            sign_count=verification.sign_count, 
            device_name=data.device_name
        )
        db.add(new_device)
        user.current_challenge = None
        db.commit()
        log_security_event(db, "device", "success", f"Bound: {data.device_name}", request.client.host, user.email)
        return {"message": "Device Bound Successfully"}
    except Exception as e:
        log_security_event(db, "device", "error", f"Bind failed: {str(e)}", request.client.host, user.email)
        raise HTTPException(400, detail=str(e))

@app.post("/webauthn/login/options")
def login_options(data: schemas.WebAuthnLoginStart, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    user = db.query(models.User).filter(models.User.email == data.username).first()
    if not user: raise HTTPException(404, "User not found")
    if not user.bound_devices: raise HTTPException(400, "No device bound.")

    creds = [base64url_to_bytes(d.credential_id) for d in user.bound_devices]
    options = utils.generate_login_options(creds)
    user.current_challenge = bytes_to_base64url(options.challenge)
    db.commit()
    return json.loads(options_to_json(options))

@app.post("/webauthn/login/complete")
def login_complete(request: Request, data: schemas.WebAuthnLoginComplete, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    user = db.query(models.User).filter(models.User.email == data.username).first()
    
    if not user or not utils.verify_password(data.password, user.password_hash):
        log_security_event(db, "login", "warning", "Invalid password attempt", request.client.host, data.username)
        raise HTTPException(401, "Invalid Password")

    cred_id = data.credential_json.get("id")
    device = db.query(models.DeviceBinding).filter(models.DeviceBinding.credential_id == cred_id).first()
    if not device or device.user_id != user.id:
        log_security_event(db, "login", "error", "Unrecognized device attempt", request.client.host, user.email)
        raise HTTPException(401, "Device not recognized")

    try:
        verification = utils.verify_login_response(
            data.credential_json, user.current_challenge, device.public_key, device.sign_count
        )
        device.sign_count = verification.new_sign_count
        device.last_used_at = func.now()
        user.current_challenge = None
        db.commit()
        
        log_security_event(db, "login", "success", "Successful 3FA Login", request.client.host, user.email)
        
        return {
            "message": "Login Successful", "role": user.role, "user_id": user.id,
            "full_name": encryption.decrypt_data(user.full_name),
            "department": encryption.decrypt_data(user.department)
        }
    except Exception as e:
        log_security_event(db, "login", "error", "Biometric verification failed", request.client.host, user.email)
        raise HTTPException(400, detail=f"Biometric Failed: {str(e)}")

# --- ATTENDANCE (Auto-Close Old Sessions) ---
@app.post("/attendance/clock-in/{user_id}")
def clock_in(user_id: int, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    
    # Cleanup existing open sessions
    existing_sessions = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == user_id, 
        models.AttendanceLog.clock_out_time == None
    ).all()
    
    for session in existing_sessions:
        session.clock_out_time = func.now()
        session.status = "System Closed"
    
    # Create new session
    enc_ip = encryption.encrypt_data(request.client.host)
    log = models.AttendanceLog(user_id=user_id, ip_address=enc_ip, status="Present")
    db.add(log)
    db.commit()
    return {"message": "Clocked In", "time": log.clock_in_time}

@app.post("/attendance/clock-out/{user_id}")
def clock_out(user_id: int, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    log = db.query(models.AttendanceLog).filter(models.AttendanceLog.user_id == user_id, models.AttendanceLog.clock_out_time == None).first()
    if log:
        log.clock_out_time = func.now()
        db.commit()
    return {"message": "Clocked Out"}

@app.post("/log/inactivity")
def log_inactivity(data: schemas.InactivityRecord, request: Request, db: Session = Depends(database.get_db)):
    check_ip_whitelist(request, db)
    new_log = models.InactivityLog(user_id=data.user_id, duration_seconds=data.duration_seconds)
    db.add(new_log)
    
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    user_email = user.email if user else "Unknown"
    
    log_security_event(
        db, type="security", severity="warning", desc="User Inactive (Productivity Alert)", 
        ip=request.client.host, user=user_email
    )
    db.commit()
    return {"status": "Logged"}

# --- DATA RETRIEVAL (Employee) ---
@app.get("/attendance/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(database.get_db)):
    logs = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.user_id == user_id
    ).order_by(models.AttendanceLog.clock_in_time.desc()).all()
    return logs

@app.get("/analytics/weekly/{user_id}")
def get_weekly_analytics(user_id: int, db: Session = Depends(database.get_db)):
    today = date.today()
    data = []
    for i in range(4, -1, -1): 
        target_date = today - timedelta(days=i)
        day_logs = db.query(models.AttendanceLog).filter(
            models.AttendanceLog.user_id == user_id,
            func.date(models.AttendanceLog.clock_in_time) == target_date
        ).all()
        
        active_seconds = 0
        for log in day_logs:
            if log.clock_out_time:
                duration = (log.clock_out_time - log.clock_in_time).total_seconds()
                active_seconds += duration
        
        inactivity_logs = db.query(models.InactivityLog).filter(
            models.InactivityLog.user_id == user_id,
            func.date(models.InactivityLog.start_time) == target_date
        ).all()
        inactive_seconds = sum(l.duration_seconds for l in inactivity_logs)

        productivity = 100
        if active_seconds > 0:
            productivity = int(((active_seconds - inactive_seconds) / active_seconds) * 100)
            if productivity < 0: productivity = 0

        data.append({
            "day": target_date.strftime("%a"),
            "activeTime": round(active_seconds / 3600, 1),
            "inactiveTime": round(inactive_seconds / 3600, 1),
            "productivity": productivity
        })
    return data

@app.get("/users/{user_id}/devices")
def get_user_devices(user_id: int, db: Session = Depends(database.get_db)):
    devices = db.query(models.DeviceBinding).filter(models.DeviceBinding.user_id == user_id).all()
    results = []
    for d in devices:
        results.append({
            "id": d.id,
            "name": d.device_name, 
            "type": "mobile" if "Phone" in d.device_name or "Android" in d.device_name or "iOS" in d.device_name else "desktop",
            "lastUsed": d.last_used_at.strftime("%Y-%m-%d %H:%M") if d.last_used_at else "Never",
            "enrolled": d.created_at.strftime("%Y-%m-%d")
        })
    return results

@app.delete("/devices/{device_id}")
def delete_device(device_id: int, db: Session = Depends(database.get_db)):
    device = db.query(models.DeviceBinding).filter(models.DeviceBinding.id == device_id).first()
    if device:
        db.delete(device)
        db.commit()
    return {"message": "Device removed"}

# --- ADMIN API ---
@app.get("/users")
def get_all_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    results = []
    for u in users:
        results.append({
            "id": u.id, "username": u.username, "email": u.email,
            "employee_id": u.employee_id,
            "full_name": encryption.decrypt_data(u.full_name),
            "department": encryption.decrypt_data(u.department),
            "role": u.role
        })
    return results

@app.get("/admin/logs")
def get_security_logs(db: Session = Depends(database.get_db)):
    logs = db.query(models.SecurityLog).order_by(models.SecurityLog.timestamp.desc()).limit(100).all()
    return logs

@app.get("/admin/all-attendance")
def get_all_attendance(db: Session = Depends(database.get_db)):
    logs = db.query(models.AttendanceLog).order_by(models.AttendanceLog.clock_in_time.desc()).limit(200).all()
    results = []
    for log in logs:
        user = log.owner
        end_time = log.clock_out_time if log.clock_out_time else datetime.now()
        total_work_seconds = (end_time - log.clock_in_time).total_seconds()
        
        log_date = log.clock_in_time.date()
        inactivity_records = db.query(models.InactivityLog).filter(
            models.InactivityLog.user_id == user.id,
            func.date(models.InactivityLog.start_time) == log_date
        ).all()
        total_inactive_seconds = sum(record.duration_seconds for record in inactivity_records)
        
        productivity = 100
        if total_work_seconds > 0:
            active_seconds = total_work_seconds - total_inactive_seconds
            productivity = int((active_seconds / total_work_seconds) * 100)
            if productivity < 0: productivity = 0

        def format_time(seconds):
            if seconds < 60: return f"{int(seconds)}s"
            minutes = int(seconds // 60)
            hours = int(minutes // 60)
            minutes = minutes % 60
            if hours > 0: return f"{hours}h {minutes}m"
            return f"{minutes}m"

        results.append({
            "id": log.id,
            "name": encryption.decrypt_data(user.full_name),
            "department": encryption.decrypt_data(user.department),
            "date": log.clock_in_time.strftime("%Y-%m-%d"),
            "clockIn": log.clock_in_time.strftime("%H:%M:%S"),
            "clockOut": log.clock_out_time.strftime("%H:%M:%S") if log.clock_out_time else "Active",
            "status": "Active" if log.clock_out_time is None else "Completed",
            "inactiveTime": format_time(total_inactive_seconds),
            "productivity": productivity
        })
    return results

@app.get("/admin/ips")
def get_whitelisted_ips(db: Session = Depends(database.get_db)):
    return db.query(models.AllowedNetwork).all()

class IPRequest(BaseModel):
    ip: str
    desc: str

@app.post("/admin/ips")
def add_ip(data: IPRequest, db: Session = Depends(database.get_db)):
    new_ip = models.AllowedNetwork(ip_address=data.ip, description=data.desc)
    db.add(new_ip)
    db.commit()
    log_security_event(db, "admin", "warning", f"IP Whitelisted: {data.ip}", "Admin", "Admin")
    return {"message": "IP Added"}

@app.delete("/admin/ips/{ip_id}")
def remove_ip(ip_id: int, db: Session = Depends(database.get_db)):
    ip = db.query(models.AllowedNetwork).filter(models.AllowedNetwork.id == ip_id).first()
    if ip:
        db.delete(ip)
        db.commit()
    return {"message": "IP Removed"}

@app.get("/admin/setup-ip")
def setup_current_ip(request: Request, db: Session = Depends(database.get_db)):
    client_ip = request.client.host
    existing = db.query(models.AllowedNetwork).filter(models.AllowedNetwork.ip_address == client_ip).first()
    if existing: return {"message": "IP already whitelisted"}
    new_ip = models.AllowedNetwork(ip_address=client_ip, description="Admin Localhost")
    db.add(new_ip)
    db.commit()
    return {"message": f"SUCCESS: IP {client_ip} added to whitelist."}

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(database.get_db)):
    total_employees = db.query(models.User).filter(models.User.role != 'admin').count()
    active_sessions = db.query(models.AttendanceLog).filter(models.AttendanceLog.clock_out_time == None).count()
    today = func.current_date()
    present_today = db.query(models.AttendanceLog).filter(func.date(models.AttendanceLog.clock_in_time) == today).distinct(models.AttendanceLog.user_id).count()
    attendance_rate = 0
    if total_employees > 0: attendance_rate = int((present_today / total_employees) * 100)
    return {"totalEmployees": total_employees, "activeSessions": active_sessions, "attendanceRate": attendance_rate, "securityAlerts": 0}

@app.get("/admin/live-sessions")
def get_live_sessions(db: Session = Depends(database.get_db)):
    active_logs = db.query(models.AttendanceLog).filter(models.AttendanceLog.clock_out_time == None).all()
    results = []
    seen_users = set()

    for log in active_logs:
        if log.user_id in seen_users:
            continue
        seen_users.add(log.user_id)

        user = log.owner 
        cutoff_time = datetime.now() - timedelta(minutes=2)
        recent_inactivity = db.query(models.InactivityLog).filter(
            models.InactivityLog.user_id == user.id,
            models.InactivityLog.start_time >= cutoff_time
        ).first()
        
        current_status = "active"
        if recent_inactivity:
            current_status = "inactive"

        results.append({
            "id": log.id,
            "name": encryption.decrypt_data(user.full_name),
            "department": encryption.decrypt_data(user.department),
            "clockIn": log.clock_in_time,
            "device": "Bound Device", 
            "ipAddress": encryption.decrypt_data(log.ip_address),
            "status": current_status
        })
    return results

@app.get("/admin/recent-activity")
def get_recent_activity(db: Session = Depends(database.get_db)):
    logs = db.query(models.AttendanceLog).order_by(models.AttendanceLog.clock_in_time.desc()).limit(5).all()
    results = []
    for log in logs:
        user = log.owner
        action = "Clocked In" if log.clock_out_time is None else "Clocked Out"
        results.append({
            "id": log.id, "name": encryption.decrypt_data(user.full_name), "action": action, "time": log.clock_in_time, "status": "success"
        })
    return results