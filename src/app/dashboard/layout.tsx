
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Camera, LineChart, Menu, Mic, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard-header';
import { useToast } from '@/hooks/use-toast';
import { fetchSpokenResponse } from './actions';


const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/plant-disease', icon: Camera, label: 'Scan' },
  { href: '/dashboard/market-trends', icon: LineChart, label: 'Market' },
  { href: '/dashboard/menu', icon: User, label: 'Profile' },
];

// Extend window for the SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast({ title: 'Listening...', description: 'Please speak your question now.' });
      };

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setIsProcessing(true);
        toast({ title: 'Processing your request...', description: `You said: "${transcript}"` });
        
        try {
            const response = await fetchSpokenResponse(transcript);
            if ('spokenAnswer' in response && audioRef.current) {
                audioRef.current.src = response.spokenAnswer;
                audioRef.current.play().catch(e => {
                  console.error("Audio playback failed:", e);
                  toast({ title: 'Playback Error', description: 'Could not play the audio response.', variant: 'destructive' });
                });
            } else if ('error' in response) {
                toast({ title: 'Error', description: response.error, variant: 'destructive' });
            }
        } catch (e) {
            console.error('Error fetching spoken response:', e);
            toast({ title: 'Error', description: 'Failed to get spoken response.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setIsProcessing(false);
        toast({ title: 'Speech Recognition Error', description: event.error, variant: 'destructive' });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

    }
  }, [toast]);
  

  const handleMicClick = () => {
    if (isProcessing) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition start error:', e);
        toast({ title: 'Could not start listening', description: 'Please try again.', variant: 'destructive'});
      }
    } else {
      toast({ title: 'Not Supported', description: 'Speech recognition is not supported in your browser.', variant: 'destructive' });
    }
  };

  const handlePlay = () => {
    setIsSpeaking(true);
  }
  const handleEnd = () => {
    setIsSpeaking(false);
  }
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      console.error('HTML Audio Element Error:', e);
      setIsSpeaking(false);
      toast({ title: 'Audio Error', description: 'There was an error playing the audio.', variant: 'destructive' });
  }

  const noHeaderPaths = [
    '/dashboard/plant-disease',
    '/dashboard/plant-disease/treatment'
  ];

  if (noHeaderPaths.some(path => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      
      <main className="flex-1 overflow-y-auto bg-muted/40 p-4 pb-20">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background z-50 max-w-[445px] mx-auto">
        <nav className="flex h-full items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary',
                pathname === item.href && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </footer>
      
      <audio ref={audioRef} onPlay={handlePlay} onEnded={handleEnd} onError={handleError} className="hidden" />

      <div className="fixed bottom-20 right-4 flex items-center gap-3">
        {(isSpeaking || isListening) && (
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute h-full w-full animate-ping rounded-full bg-primary/50"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {isSpeaking && <MessageSquare className="h-6 w-6" />}
                  {isListening && <Mic className="h-6 w-6" />}
              </div>
            </div>
        )}
        <button onClick={handleMicClick} disabled={isProcessing} className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg disabled:opacity-50">
          {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mic className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}
