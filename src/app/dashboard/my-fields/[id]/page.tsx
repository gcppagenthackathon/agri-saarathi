
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, ClipboardList, ShieldCheck, Calendar, AreaChart as AreaChartIcon, Leaf, AlertTriangle, Video, Gift, Share2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMarketAnalysis } from '../../market-trends/actions';
import type { MarketTrendAnalysisOutput } from '@/ai/flows/market-trend-analysis';
import { Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { fetchFieldEnhancements } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { PromoteDialog } from '@/components/promote-dialog';

// Mock data - replace with real data fetching
const fieldData = {
    'metu-kaddu': {
      name: 'Metu Kaddu',
      crop: 'Wheat',
      area: '5 Acres',
      plantationDate: '2023-11-15',
      expectedHarvest: '2024-04-20',
      insurance: 'Active',
      health: 92,
      bannerImage: 'https://placehold.co/600x400.png',
      imageHint: 'wheat field sunset',
      issues: [],
    },
    'keel-kadu': {
        name: 'Keel Kadu',
        crop: 'Banana',
        area: '3 Acres',
        plantationDate: '2023-09-01',
        expectedHarvest: '2024-08-15',
        insurance: 'Active',
        health: 78,
        bannerImage: 'https://placehold.co/600x400.png',
        imageHint: 'banana plantation',
        issues: [
            {
                disease: 'Panama Disease',
                date: '2024-07-20',
                status: 'Under Treatment',
                checklist: [
                    { id: 'task1', description: 'Apply fungicide as prescribed.', completed: true },
                    { id: 'task2', description: 'Remove and destroy infected plants.', completed: false },
                    { id: 'task3', description: 'Monitor nearby plants daily.', completed: false },
                ]
            }
        ],
    },
    'nel-vayal': {
      name: 'Nel Vayal',
      crop: 'Rice',
      area: '10 Acres',
      plantationDate: '2024-06-25',
      expectedHarvest: '2024-10-30',
      insurance: 'Inactive',
      health: 88,
      bannerImage: 'https://placehold.co/600x400.png',
      imageHint: 'rice paddy field',
      issues: [],
    },
    'field-a': { name: 'Field A', crop: 'Wheat', bannerImage: 'https://placehold.co/600x400.png', imageHint: 'wheat field', area: '5 Acres', plantationDate: '2023-11-15', expectedHarvest: '2024-04-20', insurance: 'Active', health: 92, issues: [] },
    'field-b': { name: 'Field B', crop: 'Corn', bannerImage: 'https://placehold.co/600x400.png', imageHint: 'corn field', area: '8 Acres', plantationDate: '2024-05-10', expectedHarvest: '2024-09-15', insurance: 'Active', health: 78, issues: [{ disease: 'Northern Corn Leaf Blight', date: '2024-07-18', status: 'Needs Attention', checklist: [{ id: 'task1', description: 'Apply foliar fungicide.', completed: false }, { id: 'task2', description: 'Check for lesions on lower leaves.', completed: true }] }] },
    'field-c': { name: 'Field C', crop: 'Rice', bannerImage: 'https://placehold.co/600x400.png', imageHint: 'rice paddy', area: '10 Acres', plantationDate: '2024-06-25', expectedHarvest: '2024-10-30', insurance: 'Inactive', health: 88, issues: [] },
    'field-d': { name: 'Field D', crop: 'Soybean', bannerImage: 'https://placehold.co/600x400.png', imageHint: 'soybean field', area: '12 Acres', plantationDate: '2024-06-01', expectedHarvest: '2024-10-05', insurance: 'Active', health: 65, issues: [{ disease: 'Soybean Rust', date: '2024-07-22', status: 'High Alert', checklist: [] }] },
};

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--primary))',
  },
};

type Product = {
    name: string;
    description: string;
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export default function FieldDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as keyof typeof fieldData;
    const data = fieldData[id] || fieldData['metu-kaddu'];

    const [marketData, setMarketData] = useState<MarketTrendAnalysisOutput | null>(null);
    const [isLoadingMarket, setIsLoadingMarket] = useState(true);
    const [isLoadingEnhancements, setIsLoadingEnhancements] = useState(true);
    const [bannerImage, setBannerImage] = useState<string>(data.bannerImage);
    const [valueAddedProducts, setValueAddedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!data.crop) {
            setIsLoadingMarket(false);
            setIsLoadingEnhancements(false);
            return;
        };

        const fetchAndCacheData = async () => {
            const now = new Date().getTime();
            
            // Fetch Enhancements
            setIsLoadingEnhancements(true);
            try {
                const cachedEnhancements = localStorage.getItem(`enhancements_${data.crop}`);
                if (cachedEnhancements) {
                    const { data: cachedData, timestamp } = JSON.parse(cachedEnhancements);
                    if (now - timestamp < CACHE_DURATION) {
                        setBannerImage(cachedData.bannerImageUrl);
                        setValueAddedProducts(cachedData.valueAddedProducts);
                        setIsLoadingEnhancements(false);
                    }
                }

                const enhancementsResponse = await fetchFieldEnhancements(data.crop);
                if ('error' in enhancementsResponse) {
                    toast({ title: 'Failed to load field details', description: enhancementsResponse.error, variant: 'destructive' });
                } else {
                    setBannerImage(enhancementsResponse.bannerImageUrl);
                    setValueAddedProducts(enhancementsResponse.valueAddedProducts);
                    localStorage.setItem(`enhancements_${data.crop}`, JSON.stringify({ data: enhancementsResponse, timestamp: now }));
                }
            } catch (e) {
                 toast({ title: 'Error', description: 'Could not fetch field details.', variant: 'destructive' });
            } finally {
                setIsLoadingEnhancements(false);
            }
            
            // Fetch Market Data
            setIsLoadingMarket(true);
            try {
                const cachedMarket = localStorage.getItem(`market_${data.crop}`);
                if (cachedMarket) {
                    const { data: cachedData, timestamp } = JSON.parse(cachedMarket);
                    if (now - timestamp < CACHE_DURATION) {
                         setMarketData(cachedData);
                         setIsLoadingMarket(false);
                    }
                }
                const marketResponse = await getMarketAnalysis([data.crop]);
                if ('error' in marketResponse) {
                    toast({ title: 'Market Analysis Failed', description: marketResponse.error, variant: 'destructive' });
                } else {
                    const sortedAnalysis = {
                        ...marketResponse,
                        analysis: marketResponse.analysis.map((item) => ({
                            ...item,
                            historicalPrices: item.historicalPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                        })),
                    };
                    setMarketData(sortedAnalysis);
                    localStorage.setItem(`market_${data.crop}`, JSON.stringify({ data: sortedAnalysis, timestamp: now }));
                }
            } catch (e) {
                toast({ title: 'Error', description: 'Could not fetch market data.', variant: 'destructive' });
            } finally {
                setIsLoadingMarket(false);
            }

        };
        
        fetchAndCacheData();

    }, [data.crop, toast]);

    const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">{icon}</div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-sm">{value}</p>
            </div>
        </div>
    );
    
    const PriceInfo = ({ label, value }: { label: string; value: string }) => (
        <div className="flex flex-col items-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-muted/20">
            <div className="relative h-40 w-full">
                {isLoadingEnhancements ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <Image
                        src={bannerImage}
                        alt={data.name}
                        fill
                        className="object-cover"
                        data-ai-hint={data.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                    <h1 className="text-xl font-bold text-white">{data.name} - {data.crop}</h1>
                </div>
            </div>

            <div className="p-4 flex justify-around bg-background border-b">
                <Button variant="ghost" className="flex-col h-auto gap-1" onClick={() => router.push('/dashboard/plant-disease')}>
                    <Camera className="h-5 w-5 text-primary" />
                    <span className="text-xs">Scan for Disease</span>
                </Button>
                <Button variant="ghost" className="flex-col h-auto gap-1" onClick={() => router.push(`/dashboard/my-fields/${id}/crop-management`)}>
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <span className="text-xs">Crop Management</span>
                </Button>
                 <PromoteDialog cropName={data.crop} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <h2 className="text-base font-semibold">Crop Summary</h2>
                <Card>
                    <CardContent className="grid grid-cols-2 gap-y-4 gap-x-4 pt-4">
                        <StatCard icon={<AreaChartIcon className="h-4 w-4"/>} label="Total Area" value={data.area} />
                        <StatCard icon={<Calendar className="h-4 w-4"/>} label="Plantation Date" value={data.plantationDate} />
                        <StatCard icon={<Calendar className="h-4 w-4"/>} label="Expected Harvest" value={data.expectedHarvest} />
                        <StatCard icon={<ShieldCheck className="h-4 w-4"/>} label="Insurance" value={data.insurance} />
                        <StatCard icon={<Leaf className="h-4 w-4"/>} label="Crop Health" value={`${data.health}%`} />
                    </CardContent>
                </Card>

                <h2 className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Plant Issues Tracker
                </h2>
                <Card>
                    <CardContent className="pt-6">
                        {data.issues.length === 0 ? (
                            <p className="text-muted-foreground text-center text-sm py-4">No issues detected in this field.</p>
                        ) : (
                            data.issues.map((issue, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-sm">{issue.disease}</p>
                                            <p className="text-xs text-muted-foreground">Detected on: {issue.date}</p>
                                        </div>
                                        <Badge variant={issue.status === 'Under Treatment' ? 'default' : 'destructive'}>{issue.status}</Badge>
                                    </div>
                                    {issue.checklist.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t">
                                            <h4 className="font-medium text-sm">Treatment Checklist</h4>
                                            {issue.checklist.map(task => (
                                                <div key={task.id} className="flex items-center gap-2">
                                                    <Checkbox id={task.id} checked={task.completed} />
                                                    <label htmlFor={task.id} className="text-xs">{task.description}</label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
                
                <h2 className="text-base font-semibold">Market Trend Analysis</h2>
                <Card>
                    <CardContent className="pt-6">
                        {isLoadingMarket ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : marketData && marketData.analysis.length > 0 ? (
                            marketData.analysis.map((item) => (
                                <div key={item.cropName} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Image src={item.imageUrl} alt={item.cropName} width={56} height={56} className="rounded-full object-cover w-14 h-14" data-ai-hint={item.imageHint}/>
                                        <div className="grid grid-cols-3 gap-2 text-center flex-1">
                                            <PriceInfo label="Today" value={item.today.price} />
                                            <PriceInfo label="Tomorrow" value={item.tomorrow.price} />
                                            <PriceInfo label="7-Day Avg" value={item.sevenDayAverage} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">{item.summary}</p>
                                    <div className="h-[120px]">
                                        <ChartContainer config={chartConfig} className="h-full w-full">
                                            <AreaChart data={item.historicalPrices} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id={`fill-${item.cropName.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} className="text-xs"/>
                                                <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
                                                <Tooltip cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} content={<ChartTooltipContent indicator="dot" formatter={(value) => (<div><p className="font-bold">{`₹${value}`}</p></div>)} />} />
                                                <Area dataKey="price" type="natural" fill={`url(#fill-${item.cropName.replace(/\s/g, '')})`} stroke="hsl(var(--primary))" stackId="a" />
                                            </AreaChart>
                                        </ChartContainer>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center text-sm py-4">Market trend data could not be loaded.</p>
                        )}
                    </CardContent>
                </Card>

                <h2 className="text-base font-semibold flex items-center gap-2">
                     Convert your crop to value added products
                </h2>
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        {isLoadingEnhancements ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                </div>
                            </div>
                        ) : valueAddedProducts.length > 0 ? (
                           valueAddedProducts.map((product, index) => (
                               <div key={index} className="flex items-start gap-4">
                                   <div className="bg-primary/10 text-primary p-2 rounded-full mt-1">
                                       <Gift className="h-5 w-5" />
                                   </div>
                                   <div>
                                       <p className="font-semibold text-sm">{product.name}</p>
                                       <p className="text-xs text-muted-foreground">{product.description}</p>
                                   </div>
                               </div>
                           ))
                        ) : (
                            <p className="text-muted-foreground text-center text-sm py-4">Could not load suggestions for value-added products.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
