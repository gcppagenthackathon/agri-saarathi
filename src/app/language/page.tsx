
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useLocalization } from '@/hooks/use-localization';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'mr', name: 'मराठी' },
];

export default function LanguageSelection() {
  const router = useRouter();
  const { setLanguage, isTranslating, t } = useLocalization();
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLang(langCode);
    await setLanguage(langCode);
    router.push('/onboarding');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <Logo className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">{t('selectLanguageTitle')}</CardTitle>
          <CardDescription>{t('selectLanguageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="h-12 text-base"
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={isTranslating}
              >
                {isTranslating && selectedLang === lang.code ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  lang.name
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
