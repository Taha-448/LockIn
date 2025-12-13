import { useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-amber-500/20 rounded-full animate-ping" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-14 h-14 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-white mb-2 text-2xl font-bold">LockIn</h1>
        <p className="text-slate-300">Enterprise Attendance & Access Control</p>
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Initializing secure connection...</span>
        </div>
      </div>
    </div>
  );
}