
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Leaf, CheckCircle, HandCoins, BarChart, LayoutDashboard, Loader2 } from 'lucide-react';
import { useLocalization } from '@/hooks/use-localization';

export default function OnboardingPage() {
  const router = useRouter();
  const { t, language } = useLocalization();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const features = [
    { text: t('featureScan'), icon: <Leaf className="h-6 w-6 text-primary" /> },
    { text: t('featureGuidance'), icon: <CheckCircle className="h-6 w-6 text-primary" /> },
    { text: t('featureSubsidy'), icon: <HandCoins className="h-6 w-6 text-primary" /> },
    { text: t('featureMarket'), icon: <BarChart className="h-6 w-6 text-primary" /> },
    { text: t('featureDashboard'), icon: <LayoutDashboard className="h-6 w-6 text-primary" /> },
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prevIndex => {
        if (prevIndex < features.length - 1) {
          return prevIndex + 1;
        }
        clearInterval(timer);
        return prevIndex;
      });
    }, 400); // Time between each feature appearing

    return () => clearInterval(timer);
  }, [features.length]);


  const handleContinue = () => {
    setIsLoading(true);
    
    // Play audio on user interaction
    const supportedAudioLanguages = ['en', 'hi', 'ta', 'kn'];
    if (language && supportedAudioLanguages.includes(language)) {
      const audio = new Audio(`/audio/${language}.wav`);
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
    
    router.push('/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Logo className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold">{t('welcomeToAgriSaarathi')}</h1>
            <p className="text-muted-foreground">{t('aiAssistantForFarming')}</p>
          </div>

          <div className="space-y-4 min-h-[280px]">
            {features.map((feature, index) => (
                <div
                    key={index}
                    className={`flex items-center gap-4 p-2 transition-opacity duration-700 ease-in-out ${activeIndex >= index ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                        {feature.icon}
                    </div>
                    <p className="text-base font-medium">{feature.text}</p>
                </div>
            ))}
          </div>
          
          <Button 
            onClick={handleContinue} 
            className="w-full mt-8" 
            disabled={activeIndex < features.length - 1 || isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : t('continueButton')}
          </Button>

        </CardContent>
      </Card>
    </main>
  );
}
