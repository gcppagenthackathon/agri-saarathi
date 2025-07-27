
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocalization } from '@/hooks/use-localization';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
    // For reCAPTCHA reset
    grecaptcha?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLocalization();
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mode, setMode] = useState('dev');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'live' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [mode]);

  const handleDevLogin = () => {
    localStorage.setItem('authMode', 'dev');
    router.push('/otp');
  };

  const handleLiveLogin = async () => {
    localStorage.setItem('authMode', 'live');
    const phoneNumber = `+91${mobileNumber}`;
    const appVerifier = window.recaptchaVerifier;

    if (!appVerifier) {
      console.error('reCAPTCHA verifier not initialized.');
      setIsLoading(false);
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      toast({
        title: t('otpSentToastTitle'),
        description: `${t('otpSentToastDescription')} ${phoneNumber}.`,
      });
      router.push('/otp');
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      let description = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/billing-not-enabled') {
        description = 'Firebase Phone Authentication requires a billing account to be linked to the project. Please enable billing in your Firebase console.';
      } else if (error.code === 'auth/captcha-check-failed') {
        description = 'reCAPTCHA check failed. Ensure this app\'s domain is authorized in the Firebase console under Authentication > Settings > Authorized domains.';
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        title: 'Authentication Error',
        description: description,
        variant: 'destructive',
      });
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
          window.recaptchaVerifier.render().then((widgetId) => {
              // @ts-ignore
              window.grecaptcha?.reset(widgetId);
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || mobileNumber.length !== 10) {
      toast({
        title: t('invalidInputToastTitle'),
        description: t('invalidInputToastDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const userInfo = { name: name.trim(), phone: mobileNumber };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    if (mode === 'dev') {
      handleDevLogin();
    } else {
      await handleLiveLogin();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center">
          <Logo className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">{t('welcomeFarmer')}</CardTitle>
          <CardDescription>{t('loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dev">Dev</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">{t('mobileNumberLabel')}</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder={t('mobileNumberPlaceholder')}
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : t('sendOtpButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </main>
  );
}
