
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const cropVarietyMap: Record<string, { id: string, label: string }[]> = {
    tomato: [
        { id: 'country-tomato', label: 'Country Tomato' },
        { id: 'bangalore-tomato', label: 'Bangalore Tomato' },
        { id: 'hybrid-tomato', label: 'Hybrid Tomato' },
    ],
    wheat: [
        { id: 'durum-wheat', label: 'Durum Wheat' },
        { id: 'aestivum-wheat', label: 'Aestivum Wheat' },
        { id: 'sharbati-wheat', label: 'Sharbati Wheat' },
    ],
    paddy_rice: [
        { id: 'basmati-rice', label: 'Basmati Rice' },
        { id: 'sona-masoori-rice', label: 'Sona Masoori Rice' },
        { id: 'ponni-rice', label: 'Ponni Rice' },
    ],
    // Add more crops and varieties as needed
};

export default function PlantationVarietySelectionPage() {
    const router = useRouter();
    const params = useParams();
    const cropId = params.crop as string;
    
    const [varieties, setVarieties] = useState<{ id: string, label: string }[]>([]);
    const [selectedVariety, setSelectedVariety] = useState<{ id: string, label: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // Simulate fetching varieties
        setIsLoading(true);
        const cropVarieties = cropVarietyMap[cropId] || [{ id: `${cropId}-default`, label: `Standard ${cropId.replace(/_/g, ' ')}` }];
        setVarieties(cropVarieties);
        setIsLoading(false);
    }, [cropId]);

    const handleSelectVariety = (variety: { id: string, label: string }) => {
        setSelectedVariety(variety);
        setIsNavigating(true);
        localStorage.setItem('plantation_variety_id', variety.id);
        localStorage.setItem('plantation_variety_name', variety.label);
        const cropId = localStorage.getItem('plantation_crop_id') || 'default';
        router.push(`/dashboard/plantation/${cropId}/${variety.id}`);
    };
    
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
    );

    const VarietyCard = ({ variety, isSelected, onSelect }: { variety: {id: string, label: string}; isSelected: boolean; onSelect: () => void; }) => (
        <Card
            onClick={onSelect}
            className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected ? "border-primary ring-2 ring-primary" : "border-border"
            )}
        >
            <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium text-lg">{variety.label}</span>
                {isSelected ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="w-6 h-6" />}
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4">
                <p className="text-muted-foreground">Now, please select the variety of the crop you wish to plant.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? <LoadingSkeleton /> : (
                    <div className="space-y-4">
                        {varieties.map((variety) => (
                            <VarietyCard 
                                key={variety.id} 
                                variety={variety} 
                                isSelected={selectedVariety?.id === variety.id && isNavigating}
                                onSelect={() => handleSelectVariety(variety)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
