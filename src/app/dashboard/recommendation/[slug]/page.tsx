
'use client';

import { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMarketAnalysis } from '../../market-trends/actions';
import type { MarketTrendAnalysisOutput } from '@/ai/flows/market-trend-analysis';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const trendIcons = {
  up: <TrendingUp className="h-5 w-5 text-green-500" />,
  down: <TrendingDown className="h-5 w-5 text-red-500" />,
  stable: <Minus className="h-5 w-5 text-gray-500" />,
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  stable: 'text-gray-600',
};

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--primary))',
  },
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Card className="shadow-lg overflow-hidden">
      <CardHeader>
        <Skeleton className="h-7 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-20 ml-auto mb-1" />
            <Skeleton className="h-7 w-20 ml-auto" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);

function MarketTrendComponent({ title, payload }: { title: string; payload: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<MarketTrendAnalysisOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const analyzeCrops = async () => {
      setIsLoading(true);
      try {
        if (!payload.crops || payload.crops.length === 0) {
          toast({ title: 'No crops specified', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        
        const response = await getMarketAnalysis(payload.crops);
        if ('error' in response) {
          toast({
            title: 'Analysis Failed',
            description: response.error,
            variant: 'destructive',
          });
        } else {
          const sortedAnalysis = response.analysis.map((item) => ({
            ...item,
            historicalPrices: item.historicalPrices
              .filter(price => price.date && !isNaN(new Date(price.date).getTime()))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          }));
          setResult({ ...response, analysis: sortedAnalysis });
        }
      } catch (error) {
        console.error('Error analyzing crops:', error);
        toast({
          title: 'Analysis Failed',
          description: 'An unexpected error occurred while analyzing crops.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    analyzeCrops();
  }, [toast, payload]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!result || !result.analysis || result.analysis.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No market trend data is available for the specified crops.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {result.analysis.map((item) => (
        <Card key={item.cropName} className="shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl">{item.cropName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{item.today?.price || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tomorrow (Est.)</p>
                <p className="text-xl font-semibold text-muted-foreground">
                  {item.tomorrow?.price || 'N/A'}
                </p>
              </div>
            </div>
            {item.historicalPrices && item.historicalPrices.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">7-Day Trend</p>
                <div className="h-[100px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart 
                      data={item.historicalPrices} 
                      margin={{ top: 5, right: 10, left: -30, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient 
                          id={`fill-${item.cropName.replace(/\s/g, '')}`} 
                          x1="0" 
                          y1="0" 
                          x2="0" 
                          y2="1"
                        >
                          <stop 
                            offset="5%" 
                            stopColor="hsl(var(--primary))" 
                            stopOpacity={0.8} 
                          />
                          <stop 
                            offset="95%" 
                            stopColor="hsl(var(--primary))" 
                            stopOpacity={0.1} 
                          />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8} 
                        tickFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString('en-US', { 
                              day: 'numeric', 
                              month: 'short' 
                            });
                          } catch {
                            return value;
                          }
                        }}
                        className="text-xs" 
                      />
                      <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
                      <Tooltip 
                        cursor={{ 
                          stroke: 'hsl(var(--primary))', 
                          strokeWidth: 1, 
                          strokeDasharray: '3 3' 
                        }} 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                                <p className="text-sm text-muted-foreground">
                                  {new Date(label).toLocaleDateString('en-US', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p className="font-bold text-foreground">
                                  ₹{payload[0].value}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        dataKey="price" 
                        type="natural" 
                        fill={`url(#fill-${item.cropName.replace(/\s/g, '')})`} 
                        stroke="hsl(var(--primary))" 
                        stackId="a" 
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GenericComponent({ title, payload }: { title: string; payload: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Work in Progress</AlertTitle>
          <AlertDescription>
            This recommendation type is currently being developed. The query for this topic is: "
            {payload?.query || 'No query provided'}"
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function RecommendationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const title = searchParams.get('title') || 'Recommendation Details';
  const payloadString = searchParams.get('payload');
  
  if (!payloadString) {
    return (
      <div className="p-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No payload provided.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  let payload;
  try {
    payload = JSON.parse(payloadString);
  } catch (error) {
    return (
      <div className="p-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Invalid payload format. Please check the URL parameters.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderContent = () => {
    switch (slug) {
      case 'market_trend':
        return <MarketTrendComponent title={title} payload={payload} />;
      case 'subsidy_info':
        return <GenericComponent title={title} payload={payload} />;
      case 'article':
        return <GenericComponent title={title} payload={payload} />;
      default:
        return (
          <div className="p-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Unsupported Type</AlertTitle>
              <AlertDescription>
                Unsupported recommendation type: "{slug}"
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  return <div>{renderContent()}</div>;
}

export default function RecommendationPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    }>
      <RecommendationPage />
    </Suspense>
  );
}

    