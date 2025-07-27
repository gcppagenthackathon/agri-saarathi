
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type Crop = {
  id: string;
  label: string;
};

const allCrops: Crop[] = [
    { id: 'wheat', label: 'Wheat' },
    { id: 'paddy_rice', label: 'Paddy' },
    { id: 'maize', label: 'Maize' },
    { id: 'tomato', label: 'Tomato' },
    { id: 'potato', label: 'Potato' },
    { id: 'onion', label: 'Onion' },
    { id: 'sugarcane', label: 'Sugarcane' },
    { id: 'cotton', label: 'Cotton' },
    { id: 'soybean', label: 'Soybean' },
    { id: 'groundnut', label: 'Groundnut' },
    { id: 'banana', label: 'Banana' },
    { id: 'mango', label: 'Mango' },
];

export default function PlantationCropSelectionPage() {
  const router = useRouter();
  const [interestedCrops, setInterestedCrops] = useState<Crop[]>([]);
  const [otherCrops, setOtherCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Clear any previous selections when starting the flow
    localStorage.removeItem('plantation_crop_id');
    localStorage.removeItem('plantation_crop_name');
    localStorage.removeItem('plantation_variety_id');
    localStorage.removeItem('plantation_variety_name');

    const storedCropsRaw = localStorage.getItem('selectedCrops');
    const storedCrops: Crop[] = storedCropsRaw ? JSON.parse(storedCropsRaw) : [];
    
    setInterestedCrops(storedCrops);
    
    const other = allCrops.filter(
      (crop) => !storedCrops.some((sc) => sc.id === crop.id)
    );
    setOtherCrops(other);
  }, []);

  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsNavigating(true);
    localStorage.setItem('plantation_crop_id', crop.id);
    localStorage.setItem('plantation_crop_name', crop.label);
    router.push(`/dashboard/plantation/${crop.id}`);
  };

  const CropCard = ({ crop, isSelected, onSelect }: { crop: Crop; isSelected: boolean; onSelect: () => void; }) => (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-primary ring-2 ring-primary" : "border-border"
      )}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <span className="font-medium text-sm">{crop.label}</span>
        {isSelected ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="h-5 w-5" />}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {interestedCrops.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Your Interested Crops</h2>
            <div className="grid grid-cols-2 gap-4">
              {interestedCrops.map((crop) => (
                <CropCard 
                  key={crop.id} 
                  crop={crop} 
                  isSelected={selectedCrop?.id === crop.id && isNavigating} 
                  onSelect={() => handleSelectCrop(crop)} 
                />
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">All Crops</h2>
          <div className="grid grid-cols-2 gap-4">
            {otherCrops.map((crop) => (
              <CropCard 
                key={crop.id} 
                crop={crop} 
                isSelected={selectedCrop?.id === crop.id && isNavigating} 
                onSelect={() => handleSelectCrop(crop)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
