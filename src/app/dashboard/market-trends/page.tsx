
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMarketAnalysis } from './actions';
import type { MarketTrendAnalysisOutput } from '@/ai/flows/market-trend-analysis';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const defaultCrops = ['Wheat', 'Cotton', 'Soybean', 'Rice', 'Corn', 'Sugarcane'];

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--primary))',
  },
};

export default function MarketTrendsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<MarketTrendAnalysisOutput | null>(null);
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const analyzeDefaultCrops = async () => {
      setIsLoading(true);
      const response = await getMarketAnalysis(defaultCrops);
      if ('error' in response) {
        toast({
          title: 'Analysis Failed',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        const sortedAnalysis = response.analysis.map((item) => ({
          ...item,
          historicalPrices: item.historicalPrices.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }));
        setResult({ ...response, analysis: sortedAnalysis });
        if (sortedAnalysis.length > 0) {
            setOpenCollapsible(sortedAnalysis[0].cropName);
        }
      }
      setIsLoading(false);
    };
    analyzeDefaultCrops();
  }, [toast]);
  
  const toggleCollapsible = (cropName: string) => {
    setOpenCollapsible(openCollapsible === cropName ? null : cropName);
  }

  const PriceInfo = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-base">{value}</p>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="shadow-lg overflow-hidden">
          <div className="p-4 flex items-center gap-4">
              <div className="flex flex-col items-center w-20 shrink-0">
                  <Skeleton className="rounded-full w-16 h-16" />
                  <Skeleton className="h-4 w-12 mt-1" />
              </div>
              <div className="w-px bg-border h-20"></div>
              <div className="flex flex-col justify-center flex-1">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <Skeleton className="h-3 w-10 mx-auto mb-1" />
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-10 mx-auto mb-1" />
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-12 mx-auto mb-1" />
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                  </div>
              </div>
              <Skeleton className="h-5 w-5" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {isLoading ? <LoadingSkeleton /> : (
          result?.analysis.map((item) => (
            <Collapsible
              key={item.cropName}
              open={openCollapsible === item.cropName}
              onOpenChange={() => toggleCollapsible(item.cropName)}
              className="w-full"
            >
              <Card className="shadow-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                      <div className="p-4 flex items-center gap-4 cursor-pointer">
                          <div className="flex flex-col items-center w-20 shrink-0">
                              <Image
                              src={item.imageUrl}
                              alt={item.cropName}
                              width={64}
                              height={64}
                              className="rounded-full object-cover w-16 h-16"
                              data-ai-hint={item.imageHint}
                              />
                              <p className="font-bold mt-1 text-center text-sm">{item.cropName}</p>
                          </div>
                          <div className="w-px bg-border h-20"></div>
                          <div className="flex flex-col justify-center flex-1">
                              <div className="grid grid-cols-3 gap-2 text-center">
                                  <PriceInfo label="Today" value={item.today.price} />
                                  <PriceInfo label="Tomorrow" value={item.tomorrow.price} />
                                  <PriceInfo label="7-Day Avg" value={item.sevenDayAverage} />
                              </div>
                          </div>
                          <ChevronDown className={cn("h-5 w-5 transition-transform", openCollapsible === item.cropName && 'rotate-180')} />
                      </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4">
                          <div className="border-t border-border pt-2">
                               <p className="text-xs text-muted-foreground mt-2 px-2">{item.summary}</p>
                          </div>
                          {item.historicalPrices && item.historicalPrices.length > 0 && (
                               <Card className="shadow-inner bg-muted/50">
                                   <CardHeader>
                                       <p className="text-sm font-semibold text-center">7-Day Price Trend</p>
                                   </CardHeader>
                                  <CardContent className="p-4 pt-0 h-[130px] flex flex-col justify-center">
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
                                              tickFormatter={(value) =>
                                                  new Date(value).toLocaleDateString('en-US', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  })
                                              }
                                              className="text-xs"
                                              />
                                              <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
                                              <Tooltip
                                              cursor={{
                                                  stroke: 'hsl(var(--primary))',
                                                  strokeWidth: 1,
                                                  strokeDasharray: '3 3',
                                              }}
                                              content={
                                                  <ChartTooltipContent
                                                  indicator="dot"
                                                  formatter={(value) => (
                                                      <div>
                                                      <p className="font-bold">{`₹${value}`}</p>
                                                      </div>
                                                  )}
                                                  />
                                              }
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
                                  </CardContent>
                               </Card>
                          )}
                      </div>
                  </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
