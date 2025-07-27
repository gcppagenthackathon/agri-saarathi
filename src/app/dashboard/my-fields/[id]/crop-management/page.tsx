
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchCropManagementPlan } from './actions';
import type { CropManagementPlanOutput } from '@/ai/flows/crop-management-plan';
import { Leaf, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

// Mock data to get crop name
const fieldData = {
    'metu-kaddu': { name: 'Metu Kaddu', crop: 'Wheat' },
    'keel-kadu': { name: 'Keel Kadu', crop: 'Banana' },
    'nel-vayal': { name: 'Nel Vayal', crop: 'Rice' },
    'field-a': { name: 'Field A', crop: 'Wheat' },
    'field-b': { name: 'Field B', crop: 'Corn' },
    'field-c': { name: 'Field C', crop: 'Rice' },
    'field-d': { name: 'Field D', crop: 'Soybean' },
};


export default function CropManagementPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as keyof typeof fieldData;
    const data = fieldData[id] || fieldData['metu-kaddu'];

    const [plan, setPlan] = useState<CropManagementPlanOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getPlan = async () => {
            setIsLoading(true);
            if (!data.crop) {
                toast({ title: 'Error', description: 'Crop name not found.', variant: 'destructive' });
                setIsLoading(false);
                return;
            }
            const response = await fetchCropManagementPlan(data.crop);
            if ('error' in response) {
                toast({ title: 'Failed to load plan', description: response.error, variant: 'destructive' });
            } else {
                setPlan(response);
            }
            setIsLoading(false);
        };
        getPlan();
    }, [data.crop, toast]);

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                   {[...Array(3)].map((_, j) => (
                       <div key={j} className="space-y-2 border-b pb-2">
                            <Skeleton className="h-5 w-1/3" />
                           <div className="flex gap-4">
                               <div className="flex-1 space-y-2">
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-5/6" />
                               </div>
                                <Skeleton className="h-20 w-20 rounded-md" />
                           </div>
                       </div>
                   ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                   {[...Array(3)].map((_, j) => (
                       <div key={j} className="space-y-2 border-b pb-2">
                            <Skeleton className="h-5 w-1/3" />
                           <div className="flex gap-4">
                               <div className="flex-1 space-y-2">
                                 <Skeleton className="h-4 w-full" />
                                 <Skeleton className="h-4 w-5/6" />
                               </div>
                                <Skeleton className="h-20 w-20 rounded-md" />
                           </div>
                       </div>
                   ))}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="flex flex-col h-full space-y-6">
            {isLoading ? <LoadingSkeleton /> : (
                <>
                    {plan?.fertilizerPlan && (
                         <Card className="shadow-lg">
                             <CardHeader>
                                 <CardTitle className="flex items-center gap-2 text-base">
                                     <Leaf className="text-primary" />
                                     Fertilizers Checklist
                                 </CardTitle>
                                 <CardDescription>Stage-wise fertilizer and nutrient guidance.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                                    {plan.fertilizerPlan.map((stage, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-sm font-semibold">{stage.stageName}</AccordionTrigger>
                                            <AccordionContent className="space-y-3 pl-2">
                                                <div className="flex gap-4 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                                                        <ul className="space-y-2">
                                                            {stage.checklist.map((item, itemIndex) => (
                                                                <li key={itemIndex} className="flex items-start gap-2 text-xs">
                                                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <Image src={stage.imageUrl} alt={stage.stageName} width={80} height={80} className="rounded-md object-cover" />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                 </Accordion>
                             </CardContent>
                         </Card>
                    )}
                   
                    {plan?.diseasePlan && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Bug className="text-destructive" />
                                    Potential Disease Guide
                                </CardTitle>
                                <CardDescription>Stage-wise disease information and prevention tips.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                                    {plan.diseasePlan.map((disease, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-sm font-semibold">{disease.stageName}: {disease.diseaseName}</AccordionTrigger>
                                            <AccordionContent className="space-y-3 pl-2 text-xs">
                                                 <div className="flex gap-4 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <div>
                                                            <h4 className="font-medium">Symptoms:</h4>
                                                            <p className="text-muted-foreground">{disease.symptoms}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">Guidance:</h4>
                                                            <p className="text-muted-foreground">{disease.guidance}</p>
                                                        </div>
                                                    </div>
                                                    <Image src={disease.imageUrl} alt={disease.diseaseName} width={80} height={80} className="rounded-md object-cover" />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
