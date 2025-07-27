
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wheat, Wind, Thermometer, Droplets, Plus, Camera, Mic, MessageSquare, Sprout, LineChart, ArrowRight, Activity, ScanLine, Tag, Sparkles, BookOpen, Bug, Shield, Landmark, Loader2, Sun, Cloud, CloudRain, CloudSun, CloudLightning, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { fetchPersonalizedContent } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const fields = [
  {
    id: 'metu-kaddu',
    name: 'Metu Kaddu',
    crop: 'Wheat',
    lastCheck: '2 days ago',
    health: 92,
    issues: 0,
    color: 'bg-green-100',
  },
  {
    id: 'keel-kadu',
    name: 'Keel Kadu',
    crop: 'Banana',
    lastCheck: '1 day ago',
    health: 78,
    issues: 1,
    color: 'bg-blue-100',
  },
  {
    id: 'nel-vayal',
    name: 'Nel Vayal',
    crop: 'Rice',
    lastCheck: '3 days ago',
    health: 88,
    issues: 0,
    color: 'bg-yellow-100',
  },
];

const recentActivities = [
    { id: 1, text: 'You scanned a wheat leaf for diseases.', time: '2 hours ago', icon: <ScanLine className="h-5 w-5 text-blue-600" /> },
    { id: 2, text: 'Market price for Banana is up by 5%.', time: '1 day ago', icon: <LineChart className="h-5 w-5 text-green-600" /> },
    { id: 3, text: 'New subsidy available for solar pumps.', time: '3 days ago', icon: <Tag className="h-5 w-5 text-orange-600" /> },
  ];

const recommendationIcons: { [key: string]: React.ReactNode } = {
  BookOpen: <BookOpen className="h-5 w-5 text-purple-600" />,
  Sprout: <Sprout className="h-5 w-5 text-green-600" />,
  LineChart: <LineChart className="h-5 w-5 text-blue-600" />,
  Bug: <Bug className="h-5 w-5 text-red-600" />,
  Shield: <Shield className="h-5 w-5 text-indigo-600" />,
  Landmark: <Landmark className="h-5 w-5 text-yellow-600" />,
};

type Recommendation = {
    text: string;
    category: string;
    icon: string;
    type: string;
    payload: Record<string, any>;
};

const weatherForecast = [
  { day: 'Mon', icon: <Sun className="h-6 w-6 text-yellow-500" />, temp: '32°', color: 'bg-yellow-100/50' },
  { day: 'Tue', icon: <CloudSun className="h-6 w-6 text-gray-500" />, temp: '30°', color: 'bg-gray-100/50' },
  { day: 'Wed', icon: <CloudRain className="h-6 w-6 text-blue-500" />, temp: '28°', color: 'bg-blue-100/50' },
  { day: 'Thu', icon: <Sun className="h-6 w-6 text-yellow-500" />, temp: '33°', color: 'bg-yellow-100/50' },
  { day: 'Fri', icon: <Cloud className="h-6 w-6 text-gray-400" />, temp: '29°', color: 'bg-gray-200/50' },
  { day: 'Sat', icon: <CloudLightning className="h-6 w-6 text-purple-500" />, temp: '27°', color: 'bg-purple-100/50' },
  { day: 'Sun', icon: <Sun className="h-6 w-6 text-yellow-500" />, temp: '31°', color: 'bg-yellow-100/50' },
];

const getStatusColor = (health: number) => {
    if (health > 90) return 'bg-green-500';
    if (health > 70) return 'bg-orange-500';
    return 'bg-red-500';
}

const FieldCard = ({ field }: { field: (typeof fields)[0] }) => (
    <Link href={`/dashboard/my-fields/${field.id}`}>
        <Card className={cn("shadow-md hover:shadow-lg transition-shadow h-full", field.color)}>
        <CardHeader className="p-2">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-sm font-bold">{field.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{field.crop}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', getStatusColor(field.health))}></div>
                    <p className="font-bold text-sm">{field.health}%</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
            
            <div className="text-xs text-muted-foreground">
                {field.issues > 0 ? (
                    <p className="text-sm text-red-500">{`${field.issues} issue(s) found`}</p>
                ) : (
                    <p className="text-sm text-green-600">No issues found</p>
                )}
                <p>Last check: {field.lastCheck}</p>
            </div>
        </CardContent>
        </Card>
    </Link>
  );

const AddNewCard = () => (
    <Link href="/dashboard/plantation">
        <Card className="shadow-md hover:shadow-lg transition-shadow flex items-center justify-center border-dashed border-2 h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Plus className="w-8 h-8" />
                <p className="font-semibold">Add New Field</p>
            </CardContent>
        </Card>
    </Link>
)

const ActionCard = ({
    icon,
    text,
    href,
    className,
  }: {
    icon: React.ReactNode;
    text: React.ReactNode;
    href: string;
    className: string;
  }) => {
    const router = useRouter();
    return (
      <Link href={href} className="block w-full h-full">
        <Card
          className={cn(
            'flex h-full flex-col items-center justify-center gap-2 p-4 text-center transition-all hover:shadow-lg',
            className
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50">
            {icon}
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs font-normal" style={{fontWeight: 400}}>{text}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
          </div>
        </Card>
      </Link>
    );
  };
  
export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  useEffect(() => {
    const getRecs = async () => {
        setIsLoadingRecs(true);
        const storedCrops = localStorage.getItem('selectedCrops');
        const storedTopics = localStorage.getItem('selectedTopics');

        const crops = storedCrops ? JSON.parse(storedCrops).map((c: any) => c.label) : [];
        const topics = storedTopics ? JSON.parse(storedTopics).map((t: any) => t.label) : [];
        
        // Always fetch, even if selections are empty, to get default recommendations from the backend.
        const response = await fetchPersonalizedContent({ crops, topics });
        
        if ('recommendations' in response) {
            setRecommendations(response.recommendations);
        } else {
             // Fallback to default recommendations on error
             setRecommendations([
                { text: 'Advanced techniques for improving crop yield in your region.', category: 'Article', icon: 'BookOpen', type: 'article', payload: { query: 'Advanced techniques for improving crop yield' } },
                { text: 'A guide to identifying and treating common plant diseases.', category: 'Guide', icon: 'Bug', type: 'article', payload: { query: 'identifying and treating common plant diseases' } },
                { text: 'Price forecast: Is now a good time to sell your harvest?', category: 'Market Intel', icon: 'LineChart', type: 'market_trend', payload: { crops: ['Wheat', 'Rice'] } },
            ]);
        }
        setIsLoadingRecs(false);
    };

    getRecs();
  }, []);

  const handleRecommendationClick = (rec: Recommendation) => {
    const slug = rec.type;
    const query = new URLSearchParams({
        title: rec.text,
        payload: JSON.stringify(rec.payload),
    }).toString();
    router.push(`/dashboard/recommendation/${slug}?${query}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold mb-2" style={{
          fontFamily: 'Roboto',
          fontWeight: 600,
          color: '#000'
        }}>My Farm Data</h2>

        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <FieldCard key={field.name} field={field} />
          ))}
          <AddNewCard />
        </div>
      </div>
      
      <div className="text-center">
        <Logo className="h-[75px] w-[75px] text-primary mx-auto" />
        <h2 className="text-base font-bold" style={{fontSize: '16px'}}>Namaste! I'm Agri Saarathi,</h2>
        <p className="text-sm text-muted-foreground" style={{fontSize: '14px'}}>How can I Help You Today?</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ActionCard
          href="/dashboard/plant-disease"
          icon={<Camera className="h-6 w-6 text-blue-600" />}
          text="Plant Diseases"
          className="bg-gray-100"
        />
        <ActionCard
          href="/dashboard/plantation"
          icon={<Sprout className="h-6 w-6 text-yellow-600" />}
          text="Plantation"
          className="bg-gray-100"
        />
        <ActionCard
          href="/dashboard/market-trends"
          icon={<LineChart className="h-6 w-6 text-green-600" />}
          text="Market trends"
          className="bg-gray-100"
        />
        <ActionCard
          href="/dashboard/subsidy"
          icon={<Landmark className="h-6 w-6 text-indigo-600" />}
          text="Subsidy"
          className="bg-gray-100"
        />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
        </h2>
        <Card className="shadow-md">
            <CardContent className="p-4 space-y-4">
            {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-full mt-1">
                        {activity.icon}
                    </div>
                    <div>
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                </div>
            ))}
            </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Personalized for You
        </h2>
        <Card className="shadow-md">
            <CardContent className="p-4 space-y-4">
            {isLoadingRecs ? (
                <>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </>
            ) : (
                recommendations.map((rec, index) => (
                    <button key={index} className="w-full text-left" onClick={() => handleRecommendationClick(rec)}>
                        <div className="flex items-start gap-3 hover:bg-muted p-2 rounded-md transition-colors">
                            <div className="bg-gray-100 p-2 rounded-full mt-1">
                                {recommendationIcons[rec.icon] || <BookOpen className="h-5 w-5 text-purple-600" />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-primary">{rec.category}</p>
                                <p className="text-sm">{rec.text}</p>
                            </div>
                        </div>
                    </button>
                ))
            )}
            </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-semibold flex items-center gap-2">
                <Sun className="h-5 w-5" />
                7-Day Weather Forecast
            </h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Bengaluru</span>
            </div>
        </div>
        <Card className="shadow-md">
            <CardContent className="p-2">
                <div className="flex justify-around">
                    {weatherForecast.map((day) => (
                        <div key={day.day} className={cn('flex flex-col items-center gap-1 p-2 rounded-lg w-14', day.color)}>
                            <p className="font-semibold text-sm">{day.day}</p>
                            {day.icon}
                            <p className="font-bold text-sm">{day.temp}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
