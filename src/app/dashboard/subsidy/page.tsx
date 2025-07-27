
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSubsidyInfo } from './actions';
import type { GetSubsidyInformationOutput } from '@/ai/flows/subsidy-information-extraction';
import { Loader2, Search, Droplets, Tractor, Wind } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


const subsidyTopics = [
    { id: 'drip_irrigation', label: 'Drip Irrigation', query: 'Subsidies for drip irrigation for farmers', icon: <Droplets className="h-8 w-8 text-blue-500"/> },
    { id: 'machinery', label: 'Machinery', query: 'Subsidies for agricultural machinery like tractors and harvesters', icon: <Tractor className="h-8 w-8 text-orange-500" /> },
    { id: 'fertilizers', label: 'Fertilizers', query: 'Government subsidies on fertilizers for farmers', icon: <Wind className="h-8 w-8 text-green-500" /> },
    { id: 'pm_kisan', label: 'PM-KISAN', query: 'Details and application process for PM-KISAN scheme', icon: <Search className="h-8 w-8 text-yellow-500" /> },
];

export default function SubsidyPage() {
  const [selectedTopic, setSelectedTopic] = useState<(typeof subsidyTopics)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GetSubsidyInformationOutput | null>(null);
  const { toast } = useToast();
  const [customQuery, setCustomQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
        toast({ title: "Query is empty", description: "Please enter a topic to search.", variant: "destructive" });
        return;
    }
    setSearchQuery(query);
    setIsLoading(true);
    setResult(null);

    const response = await getSubsidyInfo(query);
    if ('error' in response) {
      toast({
        title: 'Search Failed',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setResult(response);
    }
    setIsLoading(false);
  }

  const handleTopicSelect = (topic: (typeof subsidyTopics)[0]) => {
    setSelectedTopic(topic);
    setCustomQuery(topic.query);
    handleSearch(topic.query);
  };
  
  const AnswerSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );

  return (
    <div className='flex flex-col h-full'>
        <p className="text-muted-foreground mb-4">Select a topic or type your own question to get clear, AI-powered information on government subsidies.</p>
        
        <div className="flex gap-2 mb-4">
            <Textarea 
                placeholder="e.g., Subsidies for solar water pumps"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="resize-none"
                rows={1}
            />
            <Button onClick={() => handleSearch(customQuery)} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
        </div>


        <div className="flex-1 overflow-auto">
          <div className="grid gap-8">
                <div className="grid grid-cols-2 gap-4">
                    {subsidyTopics.map((topic) => (
                        <Card 
                            key={topic.id}
                            onClick={() => handleTopicSelect(topic)}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-lg",
                                selectedTopic?.id === topic.id && "ring-2 ring-primary border-primary"
                            )}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                                {topic.icon}
                                <p className="font-semibold text-sm">{topic.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
              
              <Card className="shadow-lg min-h-[250px]">
                  <CardHeader>
                      <CardTitle>AI Generated Answer</CardTitle>
                      <CardDescription>
                        {searchQuery ? `Showing results for "${searchQuery}"` : 'Select a topic or type a question to see information here.'}
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                      {isLoading && (
                          <div className="flex flex-col items-center justify-center pt-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Searching for the latest information...</p>
                          </div>
                      )}
                      {result && (
                          <p>{result.answer}</p>
                      )}
                      {!isLoading && !result && (
                          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center text-muted-foreground">
                              <p>The answer to your question will appear here.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
        </div>
    </div>
  );
}
