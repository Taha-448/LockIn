import { useState } from 'react';
import { Smartphone, Shield, Check, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { api } from '../services/api';

interface DeviceBindingSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function DeviceBindingSetup({ onComplete, onSkip }: DeviceBindingSetupProps) {
  const [step, setStep] = useState<'intro' | 'binding' | 'success' | 'error'>('intro');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartBinding = async () => {
    setStep('binding');
    setErrorMsg('');
    
    try {
      // Get current user's email from storage (saved during login)
      // If user isn't logged in, this should default or prompt
      const username = localStorage.getItem('user_name') || ''; 
      // NOTE: In real app, store email in localStorage during login too!
      // For now we assume user_name is the identifier or we ask user.
      
      if(!username) throw new Error("User session not found");

      await api.bindDevice(username);
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Binding Failed");
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Intro Step */}
        {step === 'intro' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="w-9 h-9 text-white" />
                </div>
              </div>
              <CardTitle>Device Binding Setup</CardTitle>
              <CardDescription>Secure this device for attendance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-900 mb-1">Security Notice</h4>
                    <p className="text-sm text-amber-700">
                      This will use your device's Secure Enclave (FaceID/TouchID).
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={handleStartBinding} className="w-full bg-amber-500 hover:bg-amber-600">
                Start Device Binding <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              {onSkip && <Button onClick={onSkip} variant="outline" className="w-full">Skip for Now</Button>}
            </CardContent>
          </Card>
        )}

        {/* Binding (Loading) Step */}
        {step === 'binding' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle>Binding Device...</CardTitle>
              <CardDescription>Follow the browser prompts</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Check className="w-9 h-9 text-white" />
                </div>
              </div>
              <CardTitle>Success!</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onComplete} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-9 h-9 text-white" />
                </div>
              </div>
              <CardTitle>Binding Failed</CardTitle>
              <CardDescription>{errorMsg}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setStep('intro')} variant="outline" className="w-full">Try Again</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}