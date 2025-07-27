
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useLocalization } from '@/hooks/use-localization';

declare global {
  interface Window {
    confirmationResult?: {
      confirm: (code: string) => Promise<any>;
    };
  }
}

async function saveUserData(uid: string, name: string, phone: string, language: string) {
    try {
        // Temporarily disabled to prevent Firestore write errors.
        // Re-enable this once Firestore security rules are configured.
        /*
        await setDoc(doc(db, "users", uid), {
            uid,
            name,
            phone,
            language,
            createdAt: new Date().toISOString(),
        });
        */
       // console.log('User data saving is temporarily disabled. UID:', uid);
    } catch (error) {
        // console.error("Error writing document: ", error);
        // This toast can be re-enabled when the feature is turned back on.
        // toast({
        //     title: 'Profile Save Failed',
        //     description: 'Your profile information could not be saved. You can update it later.',
        //     variant: 'destructive',
        // });
    }
}


export default function OtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [authMode, setAuthMode] = useState<string | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const mode = localStorage.getItem('authMode');
    setAuthMode(mode);
  }, []);

  const submitOtp = useCallback(async (finalOtp: string) => {
    if (isLoading) return;

    if (finalOtp.length !== 6) {
      toast({
        title: t('invalidOtpToastTitle'),
        description: t('invalidOtpToastDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const storedUserInfo = localStorage.getItem('userInfo');
    const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : { name: '', phone: '' };
    const language = localStorage.getItem('user_language') || 'en';

    try {
      if (authMode === 'dev') {
        const devUid = `dev_${Date.now()}`;
        await saveUserData(devUid, userInfo.name, userInfo.phone, language);
        router.push('/crop-selection');
      } else if (authMode === 'live') {
        const confirmationResult = window.confirmationResult;
        if (confirmationResult) {
            const result = await confirmationResult.confirm(finalOtp);
            const user = result.user;
            if (user) {
                await saveUserData(user.uid, userInfo.name, userInfo.phone, language);
                router.push('/crop-selection');
            } else {
                 throw new Error("No user found after OTP confirmation.");
            }
        } else {
            throw new Error("No confirmation result found. Please go back and try again.");
        }
      }
    } catch (error: any) {
        // console.error('OTP Verification or Data Saving Error:', error);
        toast({
          title: t('verificationFailedToastTitle'),
          description: error.message || t('verificationFailedToastDescription'),
          variant: 'destructive',
        });
        setOtp(new Array(6).fill('')); // Clear OTP fields on error
        inputRefs.current[0]?.focus();
    } finally {
        setIsLoading(false);
    }
  }, [authMode, router, toast, isLoading, t]);

  useEffect(() => {
    const finalOtp = otp.join('');
    if (finalOtp.length === 6) {
      submitOtp(finalOtp);
    }
  }, [otp, submitOtp]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(paste)) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      // The useEffect will trigger the submission
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    await submitOtp(finalOtp);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center">
          <Logo className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">{t('enterOtpTitle')}</CardTitle>
          <CardDescription>
            {authMode === 'live' 
              ? t('otpSentDescription')
              : t('otpDevDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((data, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 text-center text-xl"
                    required
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || otp.join('').length < 6}>
              {isLoading ? <Loader2 className="animate-spin" /> : t('verifyButton')}
            </Button>
            {authMode === 'live' && (
              <div className="text-center text-sm">
                <Button variant="link" type="button" disabled={isLoading}>{t('resendOtpButton')}</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      {isLoading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
      )}
    </main>
  );
}
