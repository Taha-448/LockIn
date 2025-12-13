import { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowLeft, Check, AlertCircle, Fingerprint, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { api } from '../services/api';

interface RegistrationPageProps {
  onComplete: (role: 'employee' | 'admin') => void;
  onBack: () => void;
}

export function RegistrationPage({ onComplete, onBack }: RegistrationPageProps) {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [bindingStatus, setBindingStatus] = useState<'idle'|'scanning'|'success'|'error'>('idle');

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.register({
        username: email,
        email,
        full_name: fullName,
        phone,
        department,
        password
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeviceSetup = async () => {
    setShowDeviceDialog(true);
    setBindingStatus('scanning');
    try {
      await api.bindDevice(email);
      setBindingStatus('success');
      setTimeout(() => {
        setShowDeviceDialog(false);
        onComplete('employee');
      }, 1500);
    } catch (err) {
      console.error(err);
      setBindingStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">LockIn</h1>
          <p className="text-slate-600">Create Your Account</p>
        </div>

        {step === 'details' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 -ml-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 text-red-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmitDetails} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="font-medium text-slate-700 mb-1 block">Full Name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 mb-1 block">Email Address *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 mb-1 block">Phone Number *</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 mb-1 block">Department *</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 mb-1 block">Password *</Label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 mb-1 block">Confirm Password *</Label>
                  <div className="relative">
                    <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-6 py-2.5" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
            <p className="text-slate-600 mb-6">Your account is ready. Please bind your device to enable secure login.</p>
            <Button onClick={handleDeviceSetup} className="w-full bg-amber-500 hover:bg-amber-600 text-white" size="lg">
              <Fingerprint className="mr-2 h-5 w-5" /> Bind Device (WebAuthn)
            </Button>
          </div>
        )}

        <Dialog open={showDeviceDialog} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Device Binding</DialogTitle>
              <DialogDescription>
                {bindingStatus === 'scanning' ? 'Scan your fingerprint or FaceID now...' :
                 bindingStatus === 'success' ? 'Success!' : 'Error occurred.'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              {bindingStatus === 'scanning' && <Loader2 className="w-12 h-12 animate-spin text-amber-500" />}
              {bindingStatus === 'success' && <Check className="w-12 h-12 text-emerald-500" />}
              {bindingStatus === 'error' && <AlertCircle className="w-12 h-12 text-red-500" />}
            </div>
            {bindingStatus === 'error' && (
                <Button onClick={() => setShowDeviceDialog(false)} variant="outline">Close</Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}