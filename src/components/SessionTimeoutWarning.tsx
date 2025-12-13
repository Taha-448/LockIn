import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface SessionTimeoutWarningProps {
  show: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({ show, timeRemaining, onExtend, onLogout }: SessionTimeoutWarningProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription>
            Your session will expire due to inactivity. You will be automatically logged out in:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-3" />
            <div className="text-amber-600">{formatTime(countdown)}</div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex-1"
          >
            Logout Now
          </Button>
          <Button
            onClick={onExtend}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
