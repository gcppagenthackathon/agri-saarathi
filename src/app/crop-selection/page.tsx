

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SelectionCard } from '@/components/selection-card';
import { fetchRegionalCrops } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/hooks/use-localization';
import { Loader2 } from 'lucide-react';


type Crop = {
  id: string;
  label: string;
};

const defaultCrops: Crop[] = [
    { id: 'wheat', label: 'Wheat' },
    { id: 'paddy_rice', label: 'Paddy' },
    { id: 'maize', label: 'Maize' },
    { id: 'finger_millet', label: 'Finger Millet' },
    { id: 'groundnut', label: 'Groundnut' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'mango', label: 'Mango' },
    { id: 'banana', label: 'Banana' },
];


export default function CropSelection() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [selectedCrops, setSelectedCrops] = useState<Crop[]>([]);
  const [displayedCrops, setDisplayedCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const showDefaultCrops = (message: string) => {
    toast({
        title: t('couldNotFetchCrops'),
        description: message,
    });
    setDisplayedCrops(defaultCrops);
    setIsLoading(false);
  }

  useEffect(() => {
    const getLocationAndFetchCrops = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetchRegionalCrops({ latitude, longitude });
            if ('crops' in response && response.crops.length > 0) {
              setDisplayedCrops(response.crops.map(c => ({ id: c.id, label: c.label })));
            } else {
              showDefaultCrops(t('showingDefaultCrops'));
            }
            setIsLoading(false);
          },
          (error) => {
            let message = t('showingDefaultCrops');
            if (error.code === 1) { // PERMISSION_DENIED
                message = t('locationAccessDenied');
            } else if (error.code === 2) { // POSITION_UNAVAILABLE
                message = t('locationUnavailable');
            }
            showDefaultCrops(message);
          }
        );
      } else {
        showDefaultCrops(t('geolocationNotSupported'));
      }
    };
    getLocationAndFetchCrops();
  }, [t, toast]);


  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrops((prevSelected) => {
      if (prevSelected.find(c => c.id === crop.id)) {
        return prevSelected.filter((c) => c.id !== crop.id);
      } else {
        return [...prevSelected, crop];
      }
    });
  };

  const handleNext = () => {
    if (selectedCrops.length > 0) {
      setIsNavigating(true);
      localStorage.setItem('selectedCrops', JSON.stringify(selectedCrops));
      router.push('/topic-selection');
    }
  };
  
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-3 p-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border-2 h-16">
           <Skeleton className="h-6 w-6 rounded" />
           <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );


  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{t('selectYourCropsTitle')}</h1>
            <p className="text-muted-foreground">{t('selectYourCropsDescription')}</p>
        </div>
        
        <div className="flex-1">
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <div className="flex flex-col gap-3 p-4">
                {displayedCrops.map((crop) => (
                    <SelectionCard
                    key={crop.id}
                    label={crop.label}
                    isSelected={!!selectedCrops.find(c => c.id === crop.id)}
                    onSelect={() => handleSelectCrop(crop)}
                    />
                ))}
                </div>
            )}
        </div>
      </div>
      <div className="py-4">
        <Button onClick={handleNext} disabled={selectedCrops.length === 0 || isNavigating} size="lg" className="w-full">
            {isNavigating ? <Loader2 className="animate-spin" /> : t('nextButton')}
        </Button>
      </div>
    </main>
  );
}
