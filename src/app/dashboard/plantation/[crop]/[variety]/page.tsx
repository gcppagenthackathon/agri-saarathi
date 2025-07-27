
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Check, PlayCircle, Upload, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { fetchPlantationAdvice } from './actions';
import type { PlantationAdvisorOutput } from '@/ai/flows/plantation-advisor';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type PlantationStep = {
    stepNumber: number;
    title: string;
    description: string;
    videoUrl: string;
    completed?: boolean;
    progressImage?: string;
};

export default function PlantationAnalysisPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [cropName, setCropName] = useState('');
    const [cropVariety, setCropVariety] = useState('');
    const [plantationSteps, setPlantationSteps] = useState<PlantationStep[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const storedCropName = localStorage.getItem('plantation_crop_name');
        const storedCropVariety = localStorage.getItem('plantation_variety_name');

        if (storedCropName && storedCropVariety) {
            setCropName(storedCropName);
            setCropVariety(storedCropVariety);
        }

        return () => {
            localStorage.removeItem('plantation_crop_name');
            localStorage.removeItem('plantation_variety_name');
            localStorage.removeItem('plantation_crop_id');
            localStorage.removeItem('plantation_variety_id');
        }
    }, []);
    
    useEffect(() => {
        if (!cropName || !cropVariety) {
            if (!localStorage.getItem('plantation_crop_name')) { 
                 toast({
                    title: 'Something went wrong',
                    description: 'Could not retrieve crop details. Please start over.',
                    variant: 'destructive'
                });
            }
            setIsLoading(false);
            return;
        };

        const getAdvice = async () => {
            setIsLoading(true);
            const result = await fetchPlantationAdvice({ cropName, cropVariety });
            
            if ('error' in result) {
                 toast({
                    title: 'Failed to get advice',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                setPlantationSteps(result.plantationSteps.map(step => ({...step, completed: false})));
            }
            setIsLoading(false);
        };
        getAdvice();
    }, [cropName, cropVariety, toast]);
    
    useEffect(() => {
        const totalTasks = plantationSteps.length;
        const completedTasks = plantationSteps.filter(t => t.completed).length;
        setProgress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
    }, [plantationSteps]);

    const handleToggleTask = (stepNumber: number) => {
        setPlantationSteps(prev => 
            prev.map(step => 
                step.stepNumber === stepNumber ? { ...step, completed: !step.completed } : step
            )
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, stepNumber: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setPlantationSteps(prev =>
                    prev.map(step =>
                        step.stepNumber === stepNumber ? { ...step, progressImage: imageUrl } : step
                    )
                );
            };
            reader.readAsDataURL(file);
        }
    };
    
    const LoadingSkeleton = () => (
        <div className="p-4 space-y-6">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        </div>
    );

    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    if (!plantationSteps || plantationSteps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-xl font-bold">Could not load advice</h2>
                <p className="text-muted-foreground">There was an error fetching the plantation advice. Please try again later.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <Card className="mb-6 shadow-lg">
                    <CardHeader>
                        <CardTitle>Plantation Plan for {cropVariety}</CardTitle>
                        <CardDescription>Overall Progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Progress value={progress} className="h-4" />
                            <span className="font-bold text-lg">{Math.round(progress)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {plantationSteps.map((step, index) => (
                        <AccordionItem value={`item-${index}`} key={step.stepNumber}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold", step.completed ? 'bg-green-500' : 'bg-primary')}>
                                        {step.completed ? <Check className="h-5 w-5" /> : step.stepNumber}
                                    </div>
                                    <span className={cn("font-semibold text-base text-left", step.completed && "line-through text-muted-foreground")}>{step.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4 pb-4 space-y-4">
                                <p className="text-muted-foreground">{step.description}</p>
                                
                                <div className="flex flex-wrap gap-2 items-center">
                                    <a href={step.videoUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm">
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Watch Video
                                        </Button>
                                    </a>
                                    <Button asChild size="sm" variant="outline">
                                        <label>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {step.progressImage ? 'Re-upload' : 'Upload Image'}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, step.stepNumber)} />
                                        </label>
                                    </Button>
                                </div>
                                
                                {step.progressImage && (
                                    <div className="mt-2">
                                        <Image src={step.progressImage} alt={`Progress for ${step.title}`} width={80} height={80} className="rounded-md object-cover"/>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                     <button onClick={() => handleToggleTask(step.stepNumber)}>
                                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2", step.completed ? "border-green-500 bg-green-500" : "border-gray-400")}>
                                            {step.completed && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                    </button>
                                    <span className="text-sm font-medium">Mark as Complete</span>
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <div className="p-4 border-t bg-background">
                 <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full">
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Finish & Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
