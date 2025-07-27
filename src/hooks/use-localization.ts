
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { translations, TranslationKey } from '@/lib/translations';
import { translateText } from '@/ai/flows/translate-text-google';

const LANGUAGE_KEY = 'user_language';

export function useLocalization() {
  const [language, setLanguageState] = useState('en');
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    if (storedLang && translations[storedLang]) {
      // Use a function form of setLanguageState to avoid dependency issues if needed,
      // but a simple call is fine here as it runs once on mount.
      setLanguageState(storedLang);
      
      // If translations for the stored language are already fetched, load them
      const storedTranslations = sessionStorage.getItem(`translations_${storedLang}`);
      if (storedTranslations) {
        setDynamicTranslations(JSON.parse(storedTranslations));
      }
    }
  }, []);

  const setLanguage = useCallback(async (langCode: string) => {
    if (!translations[langCode]) return;
    
    localStorage.setItem(LANGUAGE_KEY, langCode);
    setLanguageState(langCode);

    if (langCode === 'en') {
      setDynamicTranslations({});
      sessionStorage.removeItem(`translations_en`);
      return;
    }

    // Check session storage first
    const storedTranslations = sessionStorage.getItem(`translations_${langCode}`);
    if (storedTranslations) {
        setDynamicTranslations(JSON.parse(storedTranslations));
        return;
    }

    setIsTranslating(true);
    try {
      const keysToTranslate = Object.keys(translations.en) as TranslationKey[];
      const englishTexts = keysToTranslate.map(key => translations.en[key]);

      const separator = '|||';
      const combinedText = englishTexts.join(separator);

      const result = await translateText({
        text: combinedText,
        targetLanguage: langCode,
      });

      if (result.translatedText) {
        const translatedTexts = result.translatedText.split(separator);
        const newTranslations: Record<string, string> = {};
        keysToTranslate.forEach((key, index) => {
          newTranslations[key] = translatedTexts[index]?.trim() || translations[langCode]?.[key] || translations.en[key];
        });
        setDynamicTranslations(newTranslations);
        sessionStorage.setItem(`translations_${langCode}`, JSON.stringify(newTranslations));
      } else {
        setDynamicTranslations(translations[langCode] || {});
      }
    } catch (error) {
      console.error('An error occurred during the translation process:', error);
      setDynamicTranslations(translations[langCode] || {});
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      // On initial load, dynamic translations might not be ready. Fallback logic is crucial.
      const staticTranslations = translations[language] || translations.en;
      return dynamicTranslations[key] || staticTranslations[key] || translations.en[key];
    },
    [language, dynamicTranslations]
  );
  
  const memoizedT = useMemo(() => t, [t]);

  return { language, setLanguage, t: memoizedT, isTranslating };
}
