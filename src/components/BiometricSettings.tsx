import { useState, useEffect } from 'react';
import { Fingerprint, Check, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { api } from '../services/api';

export function BiometricSettings() {
  const [methods, setMethods] = useState<any[]>([]);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    const userId = parseInt(localStorage.getItem('user_id') || '0');
    if (userId) {
      const data = await api.getUserDevices(userId);
      setMethods(data);
    }
  };

  const handleRemove = async (id: string) => {
    if(confirm("Remove this biometric credential?")) {
      await api.deleteDevice(id);
      loadMethods();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Biometric Authentication</CardTitle>
          <CardDescription>Manage your enrolled WebAuthn credentials (Fingerprint/FaceID)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {methods.length === 0 ? <p className="text-slate-500">No biometrics enrolled.</p> : methods.map((method) => (
              <div key={method.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-900">{method.name}</h4>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Active</Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        Enrolled on {method.enrolled}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(method.id)} className="text-red-500">
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