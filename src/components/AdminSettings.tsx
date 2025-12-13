import { useState, useEffect } from 'react';
import { MapPin, Shield, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { api } from '../services/api';

export function AdminSettings() {
  const [ips, setIps] = useState<any[]>([]);
  const [newIp, setNewIp] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadIps();
  }, []);

  const loadIps = async () => {
    const data = await api.getWhitelistedIPs();
    setIps(data);
  };

  const handleAddIP = async () => {
    if(!newIp) return;
    await api.addIP(newIp, newDesc || "Office");
    setNewIp('');
    setNewDesc('');
    loadIps();
  };

  const handleRemoveIP = async (id: number) => {
    if(confirm("Are you sure? This will block access from this IP.")) {
      await api.removeIP(id);
      loadIps();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="security">
        <TabsList>
          <TabsTrigger value="security">Security & Network</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <CardTitle>IP Whitelist Configuration</CardTitle>
              </div>
              <CardDescription>Only IPs listed here can access the login page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>IP Address</Label>
                  <Input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="e.g. 192.168.1.5" />
                </div>
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. Headquarters" />
                </div>
                <Button onClick={handleAddIP} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {ips.map((ip) => (
                  <div key={ip.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-mono text-slate-900">{ip.ip_address}</span>
                      <span className="ml-4 text-sm text-slate-500">{ip.description}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveIP(ip.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}