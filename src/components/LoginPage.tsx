import { useState } from 'react';
import { Shield, Eye, EyeOff, Fingerprint, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { api } from '../services/api';

interface LoginPageProps {
  onLogin: (role: 'employee' | 'admin') => void;
  onRegister: () => void;
}

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setShowDialog(true);
    setStatusMsg('Checking credentials...');

    try {
      const result = await api.login(email, password);
      
      setStatusMsg('Success! Logging in...');
      setTimeout(() => {
        setShowDialog(false);
        localStorage.setItem('user_id', result.user_id);
        localStorage.setItem('user_name', result.full_name);
        onLogin(result.role === 'admin' ? 'admin' : 'employee');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Login failed');
      setShowDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">SecureAttend</h1>
          <p className="text-slate-600">Enterprise Attendance & Access Control</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-500">Sign in to your account</p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50 text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* FIX: Increased spacing from space-y-5 to space-y-6 for breathing room */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium mb-1 block">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium mb-1 block">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 mt-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-600 text-sm mb-3">Don't have an account?</p>
            <Button onClick={onRegister} variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
              Register New Account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>3FA Verification</DialogTitle>
            <DialogDescription>{statusMsg}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Fingerprint className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Please verify using your biometric device.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}