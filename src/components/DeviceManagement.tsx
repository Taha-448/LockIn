import { useState, useEffect } from 'react';
import { Smartphone, Laptop, Trash2, Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { api } from '../services/api';

export function DeviceManagement() {
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const userId = parseInt(localStorage.getItem('user_id') || '0');
    if (userId) {
      const data = await api.getUserDevices(userId);
      setDevices(data);
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm("Remove this device? You will need to re-bind it to login.")) {
      await api.deleteDevice(id);
      loadDevices();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Trusted Devices</CardTitle>
              <CardDescription>Devices authorized via WebAuthn</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.length === 0 ? <p className="text-slate-500">No devices found.</p> : devices.map((device) => (
              <div key={device.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      {device.type === 'mobile' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-900">{device.name}</h4>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Trusted</Badge>
                      </div>
                      <div className="text-sm text-slate-600 flex gap-4">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Added: {device.enrolled}</span>
                        <span>Last used: {device.lastUsed}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(device.id)} className="text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}