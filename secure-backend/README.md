# 🛡️ SecureAttend: Zero-Trust Attendance System

> **Course:** Information Security
> **Architecture:** Full Stack (React + Python FastAPI + MySQL)
> **Security Model:** Zero Trust / Defense in Depth

## 📖 Project Overview

**SecureAttend** is an enterprise-grade web application designed to eliminate "buddy punching" (attendance fraud) and prevent unauthorized access to sensitive employee data. 

Unlike traditional systems that rely solely on passwords, this project implements a **True 3-Factor Authentication (3FA)** architecture combined with strict **Network Geofencing** and **AES-256 Encryption at Rest**. It assumes the network is hostile and the database could be compromised, protecting data integrity and confidentiality under all scenarios.

---

## 🔐 Key Security Features

### 1. True 3-Factor Authentication (3FA)
To log in, a user must satisfy three distinct authentication factors:
1.  **Knowledge (Password):** Verifies the user knows the secret. Passwords are hashed using **Argon2id** (memory-hard hashing) to resist brute-force attacks.
2.  **Possession (Device Binding):** Verifies the user holds a specific, registered device. A cryptographic **Private Key** is stored in the device's Secure Enclave; the server holds the Public Key.
3.  **Inherence (Biometrics):** Verifies the user *is* who they say they are. Uses **WebAuthn (FIDO2)** to require a Fingerprint or FaceID scan to unlock the private key.

### 2. Zero-Trust Network Geofencing
*   **Mechanism:** Application-Layer IP Whitelisting Middleware.
*   **Effect:** The application is invisible to the public internet. If a request originates from an unauthorized IP (e.g., home WiFi, VPN, or a hacker's machine), the server rejects the connection with a `403 Forbidden` error *before* checking any credentials.

### 3. Military-Grade Encryption (Data Privacy)
*   **Mechanism:** **AES-256-GCM** (Galois/Counter Mode).
*   **Effect:** Sensitive PII (Full Name, Phone, Department) and Location Logs are encrypted by the backend *before* being sent to the database.
*   **Outcome:** If the database is stolen via SQL Injection or insider theft, the data appears as unreadable gibberish (`gAAAAABk...`).

### 4. Continuous Security Monitoring
*   **Inactivity Watchdog:** Client-side tracking of mouse/keyboard events. Automatically flags users as "Inactive" after 30 seconds of idleness and force-logs them out after 30 minutes to prevent Session Hijacking.
*   **Tamper-Proof Audit Logs:** Immutable logs tracking every login, IP block, and device binding event.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React (TypeScript) + Vite
*   **UI Library:** TailwindCSS + Lucide Icons + Recharts
*   **Security:** `navigator.credentials` (WebAuthn API)

### Backend
*   **Framework:** Python FastAPI (Asynchronous)
*   **Database:** MySQL (Relational)
*   **ORM:** SQLAlchemy
*   **Cryptography:**
    *   `webauthn`: FIDO2 Protocol handling.
    *   `argon2-cffi`: Password Hashing.
    *   `cryptography`: AES-256-GCM Encryption.

---

## 🚀 Installation & Setup Guide

### Prerequisites
*   Python 3.11+
*   Node.js & npm
*   XAMPP (for MySQL)

### Step 1: Database Setup
1.  Open XAMPP and start **MySQL**.
2.  Go to `http://localhost/phpmyadmin`.
3.  Create a new database named **`secure_attendance_db`**.

### Step 2: Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd secure-backend
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\Activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file in `secure-backend/` and add your AES Master Key:
    ```env
    ENCRYPTION_KEY=Your_Generated_Base64_Key_Here=
    ```
5.  Start the Server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Step 3: Frontend Setup
1.  Open a new terminal and navigate to the project root.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the UI:
    ```bash
    npm run dev
    ```

### Step 4: Initial Security Configuration
Since the database starts empty, the IP Whitelist is empty (Lockdown Mode).
1.  Open your browser to the **Backend Admin Setup URL**:
    `http://127.0.0.1:8000/admin/setup-ip`
2.  You will see `SUCCESS: IP 127.0.0.1 added to whitelist.`
3.  Now you can access the frontend at `http://localhost:3000`.

---

## 📖 User Guide

### 1. Registration & Binding
*   Go to **Register**. Enter your details.
*   The system will auto-assign a sequential Employee ID (e.g., `EMP-00001`).
*   Click **Bind Device**.
*   **Action:** Your browser will prompt you to use TouchID, Windows Hello, or scan a QR code with your phone. This cryptographically links your hardware to your account.

### 2. Login (3FA Flow)
*   Enter Email and Password.
*   **Action:** The system checks the password. If correct, it challenges your device.
*   **Action:** You must scan your fingerprint/FaceID again to sign the challenge.
*   **Result:** Access granted.

### 3. Admin Access
*   *Note:* By default, new users are "Employees".
*   To promote a user to Admin:
    1.  Register a user.
    2.  Open **phpMyAdmin** -> `users` table.
    3.  Change the `role` column to `admin`.
    4.  Refresh the dashboard.

---

## 🛡️ Threat Model Analysis

| Threat Scenario | Mitigation Strategy |
| :--- | :--- |
| **Credential Phishing** | Even if a hacker steals the password, they fail the **Device Binding** check because they don't have the user's physical laptop/phone. |
| **Stolen Device** | If a hacker steals the laptop, they fail the **Biometric** check (Fingerprint) required to unlock the key. |
| **Remote Access** | If a hacker tries to login from home using stolen credentials, the **IP Whitelist** blocks the connection request entirely. |
| **Database Dump** | If the SQL database is leaked, names and logs are **AES-256 Encrypted**. The hacker only sees ciphertext. |

---

## 👤 Credits
**Project Lead:** Muhammad Taha Anjum