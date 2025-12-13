import { createCredential, getCredential } from "../utils/webauthn";

const API_URL = "http://127.0.0.1:8000";

// Helper to guess device name from User Agent
const getDeviceName = () => {
  const ua = navigator.userAgent;
  let device = "Unknown Device";
  let os = "Unknown OS";

  if (ua.indexOf("Win") !== -1) os = "Windows";
  if (ua.indexOf("Mac") !== -1) os = "Mac";
  if (ua.indexOf("Linux") !== -1) os = "Linux";
  if (ua.indexOf("Android") !== -1) os = "Android";
  if (ua.indexOf("like Mac") !== -1) os = "iOS";

  if (ua.indexOf("Chrome") !== -1) device = "Chrome";
  else if (ua.indexOf("Firefox") !== -1) device = "Firefox";
  else if (ua.indexOf("Safari") !== -1) device = "Safari";
  else if (ua.indexOf("Edg") !== -1) device = "Edge";

  return `${device} on ${os}`;
};

export const api = {
  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }
    return response.json();
  },

  bindDevice: async (username: string) => {
    const optResp = await fetch(`${API_URL}/webauthn/register/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const options = await optResp.json();

    const credential = await createCredential(options);
    
    // Auto-detect device name
    const detectedName = getDeviceName();

    const verifyResp = await fetch(`${API_URL}/webauthn/register/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username, 
        credential_json: credential,
        device_name: detectedName // Sending real name
      }),
    });
    
    if (!verifyResp.ok) throw new Error("Device binding failed");
    return verifyResp.json();
  },

  login: async (username: string, password: string) => {
    const optResp = await fetch(`${API_URL}/webauthn/login/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    
    if (!optResp.ok) throw new Error("User not found or no device bound");
    const options = await optResp.json();

    const credential = await getCredential(options);

    const verifyResp = await fetch(`${API_URL}/webauthn/login/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username, 
        password,
        credential_json: credential 
      }),
    });

    if (!verifyResp.ok) {
      const err = await verifyResp.json();
      throw new Error(err.detail || "Login failed");
    }
    return verifyResp.json();
  },

  clockIn: async (userId: number) => {
    return fetch(`${API_URL}/attendance/clock-in/${userId}`, { method: "POST" });
  },
  
  clockOut: async (userId: number) => {
    return fetch(`${API_URL}/attendance/clock-out/${userId}`, { method: "POST" });
  },

  logInactivity: async (userId: number, seconds: number) => {
    return fetch(`${API_URL}/log/inactivity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, duration_seconds: seconds }),
    });
  },

  getAttendanceHistory: async (userId: number) => {
    const res = await fetch(`${API_URL}/attendance/history/${userId}`);
    if (!res.ok) return [];
    return res.json();
  },

  getWeeklyAnalytics: async (userId: number) => {
    const res = await fetch(`${API_URL}/analytics/weekly/${userId}`);
    if (!res.ok) return [];
    return res.json();
  },

  getUserDevices: async (userId: number) => {
    const res = await fetch(`${API_URL}/users/${userId}/devices`);
    if (!res.ok) return [];
    return res.json();
  },

  deleteDevice: async (deviceId: string) => {
    return fetch(`${API_URL}/devices/${deviceId}`, { method: "DELETE" });
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`);
    if (!res.ok) return null;
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) return [];
    return res.json();
  },

  getLiveSessions: async () => {
    const res = await fetch(`${API_URL}/admin/live-sessions`);
    if (!res.ok) return [];
    return res.json();
  },

  getRecentActivity: async () => {
    const res = await fetch(`${API_URL}/admin/recent-activity`);
    if (!res.ok) return [];
    return res.json();
  },

  getAllAttendance: async () => {
    const res = await fetch(`${API_URL}/admin/all-attendance`);
    if (!res.ok) return [];
    return res.json();
  },

  getSecurityLogs: async () => {
    const res = await fetch(`${API_URL}/admin/logs`);
    if (!res.ok) return [];
    return res.json();
  },

  getWhitelistedIPs: async () => {
    const res = await fetch(`${API_URL}/admin/ips`);
    if (!res.ok) return [];
    return res.json();
  },

  addIP: async (ip: string, desc: string) => {
    return fetch(`${API_URL}/admin/ips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, desc }),
    });
  },

  removeIP: async (id: number) => {
    return fetch(`${API_URL}/admin/ips/${id}`, { method: "DELETE" });
  }
};