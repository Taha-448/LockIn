import { useState } from 'react';
import { Fingerprint, Shield, Check, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface BiometricEnrollmentProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function BiometricEnrollment({ onComplete, onSkip }: BiometricEnrollmentProps) {
  const [step, setStep] = useState<'intro' | 'enrolling' | 'success' | 'error'>('intro');
  const [progress, setProgress] = useState(0);
  const [scansCompleted, setScansCompleted] = useState(0);
  const totalScans = 5;

  const handleStartEnrollment = () => {
    setStep('enrolling');
    setProgress(0);
    setScansCompleted(0);

    // Simulate biometric enrollment with progressive scans
    const interval = setInterval(() => {
      setScansCompleted((prev) => {
        const next = prev + 1;
        setProgress((next / totalScans) * 100);
        
        if (next >= totalScans) {
          clearInterval(interval);
          setTimeout(() => {
            // 90% success rate for demo
            if (Math.random() > 0.1) {
              setStep('success');
            } else {
              setStep('error');
            }
          }, 500);
        }
        
        return next;
      });
    }, 1000);
  };

  const handleRetry = () => {
    setStep('intro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'intro' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Fingerprint className="w-9 h-9 text-white" />
                </div>
              </div>
              <CardTitle>Biometric Enrollment</CardTitle>
              <CardDescription>
                Set up biometric authentication for secure access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="mb-3">Available Methods</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <Fingerprint className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <h4>Fingerprint</h4>
                        <p className="text-sm text-slate-600">Use your fingerprint to authenticate</p>
                      </div>
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <h4>Face Recognition</h4>
                        <p className="text-sm text-slate-600">Use facial recognition</p>
                      </div>
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <h4>How it Works</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-purple-600">1</span>
                      </div>
                      <span>Place your finger on the sensor multiple times</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-purple-600">2</span>
                      </div>
                      <span>The system will capture different angles</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-purple-600">3</span>
                      </div>
                      <span>Your biometric data is stored securely on your device</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-purple-900 mb-1">Privacy & Security</h4>
                      <p className="text-sm text-purple-700">
                        Your biometric data never leaves your device. All authentication is performed locally using WebAuthn standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleStartEnrollment}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Start Enrollment
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                {onSkip && (
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'enrolling' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Fingerprint className="w-14 h-14 text-white" />
                </div>
              </div>
              <CardTitle>Scanning Biometric...</CardTitle>
              <CardDescription>
                Please place your finger on the sensor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Scan Progress</span>
                  <span className="text-purple-600">{scansCompleted} of {totalScans} scans</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="space-y-2">
                {Array.from({ length: totalScans }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      idx < scansCompleted
                        ? 'bg-emerald-50 border border-emerald-200'
                        : idx === scansCompleted
                        ? 'bg-purple-50 border border-purple-200'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {idx < scansCompleted ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : idx === scansCompleted ? (
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${
                        idx < scansCompleted
                          ? 'text-emerald-900'
                          : idx === scansCompleted
                          ? 'text-purple-900'
                          : 'text-slate-600'
                      }`}>
                        Scan #{idx + 1} {idx < scansCompleted && '- Complete'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-slate-600">
                Keep your finger steady on the sensor...
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Check className="w-9 h-9 text-white" />
                </div>
              </div>
              <CardTitle>Enrollment Successful!</CardTitle>
              <CardDescription>
                Your biometric has been registered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="text-emerald-900 mb-3">Biometric Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Method:</span>
                    <span className="text-slate-900">Fingerprint</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Scans Captured:</span>
                    <span className="text-slate-900">{totalScans} samples</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Quality:</span>
                    <span className="text-emerald-600">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Enrolled On:</span>
                    <span className="text-slate-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="mb-2">What's Next</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>You can now use biometric authentication to log in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Your attendance actions will be verified with biometrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Add more biometric methods from security settings</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={onComplete}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'error' && (
          <Card>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-9 h-9 text-white" />
                </div>
              </div>
              <CardTitle>Enrollment Failed</CardTitle>
              <CardDescription>
                We couldn't complete the biometric enrollment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-900 mb-2">Possible Issues</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• Sensor was not properly detected</li>
                  <li>• Finger placement was inconsistent</li>
                  <li>• Environmental conditions affected scanning</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="mb-2">Troubleshooting Tips</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Make sure your finger is clean and dry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Place your finger firmly on the sensor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Try in a well-lit area</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Try Again
                </Button>
                {onSkip && (
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
