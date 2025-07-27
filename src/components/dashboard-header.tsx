
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Thermometer, Wind, Droplets, Menu, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';
import { useState, useEffect } from 'react';
import { PromoteDialog } from './promote-dialog';


const getTitle = (pathname: string) => {
    if (pathname === '/dashboard') return 'AgriSaarathi';
    if (pathname.startsWith('/dashboard/my-fields/')) {
        if (pathname.endsWith('/crop-management')) {
            return 'Crop Management';
        }
        return 'My Field Details';
    }
    if (pathname.startsWith('/dashboard/plantation')) {
        if (pathname.match(/\/dashboard\/plantation\/.+\/.+/)) {
            return 'Plantation Advisor';
        }
        if (pathname.match(/\/dashboard\/plantation\/.+/)) {
            return 'Select Variety';
        }
        return 'Select Crop';
    }
    if (pathname.startsWith('/dashboard/my-fields')) return 'My Fields';
    if (pathname.startsWith('/dashboard/market-trends')) return 'Market Price Analyzer';
    if (pathname.startsWith('/dashboard/subsidy')) return 'Subsidy Hub';
    if (pathname.startsWith('/dashboard/plant-disease/treatment')) return 'Treatment Plan';
    if (pathname.startsWith('/dashboard/recommendation')) return 'Recommendation';
    if (pathname.startsWith('/dashboard/menu')) return 'Menu';
    return 'AgriSaarathi';
};

const fieldData = {
    'metu-kaddu': { crop: 'Wheat' },
    'keel-kadu': { crop: 'Banana' },
    'nel-vayal': { crop: 'Rice' },
    'field-a': { crop: 'Wheat' },
    'field-b': { crop: 'Corn' },
    'field-c': { crop: 'Rice' },
    'field-d': { crop: 'Soybean' },
};


export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [title, setTitle] = useState('AgriSaarathi');
  const [showBackButton, setShowBackButton] = useState(false);
  const [showPromoteButton, setShowPromoteButton] = useState(false);
  const [currentCrop, setCurrentCrop] = useState('');

  useEffect(() => {
    setTitle(getTitle(pathname));
    const isMyFieldSubpage = pathname.startsWith('/dashboard/my-fields/') && pathname.split('/').length > 4;
    const isMyFieldPage = pathname.startsWith('/dashboard/my-fields/') && !isMyFieldSubpage;
    setShowBackButton(pathname !== '/dashboard' && !isMyFieldPage);
    
    const fieldIdMatch = pathname.match(/\/dashboard\/my-fields\/([a-z-]+)/);
    if(fieldIdMatch) {
      const fieldId = fieldIdMatch[1] as keyof typeof fieldData;
      if (fieldData[fieldId]) {
        setCurrentCrop(fieldData[fieldId].crop);
        setShowPromoteButton(true);
      } else {
        setShowPromoteButton(false);
      }
    } else {
      setShowPromoteButton(false);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
             <Logo className="h-8 w-8 text-primary" />
          </Link>
        )}
         <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {title === 'AgriSaarathi' && (
            <>
                <div className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span>32°C</span>
                </div>
                <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-blue-500" />
                    <span>5 km/h</span>
                </div>
                <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <span>65%</span>
                </div>
            </>
        )}
        {showPromoteButton && <PromoteDialog cropName={currentCrop} isHeaderButton={true} />}
      </div>
    </header>
  );
}
