

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SelectionCard } from '@/components/selection-card';
import { fetchTopics } from './actions';
import type { Topic } from '@/ai/flows/topic-images';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/hooks/use-localization';
import { Bug, Sprout, LineChart, Landmark, BookOpen, Shield, HelpCircle, Loader2 } from 'lucide-react';

const topicIcons: { [key: string]: React.ReactNode } = {
    'plant_disease': <Bug className="w-6 h-6" />,
    'plantation': <Sprout className="w-6 h-6" />,
    'market_trends': <LineChart className="w-6 h-6" />,
    'subsidy': <Landmark className="w-6 h-6" />,
    'agri_training': <BookOpen className="w-6 h-6" />,
    'insurance': <Shield className="w-6 h-6" />,
    'default': <HelpCircle className="w-6 h-6" />,
};

const getTopicIcon = (topicId: string) => {
    return topicIcons[topicId] || topicIcons.default;
};

export default function TopicSelection() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const getTopics = async () => {
      setIsLoading(true);
      const response = await fetchTopics();
      if ('error' in response) {
        toast({
          title: t('failedToLoadTopics'),
          description: response.error,
          variant: 'destructive',
        });
        setTopics([]); // Set empty array on error
      } else {
        setTopics(response.topics);
      }
      setIsLoading(false);
    };
    getTopics();
  }, [t, toast]);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopics((prevSelected) => {
      if (prevSelected.find(t => t.id === topic.id)) {
        return prevSelected.filter((t) => t.id !== topic.id);
      } else {
        return [...prevSelected, topic];
      }
    });
  };

  const handleNext = () => {
    if (selectedTopics.length > 0) {
      setIsNavigating(true);
      localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
      router.push('/dashboard');
    }
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-3 p-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border-2 h-16">
           <Skeleton className="h-8 w-8 rounded" />
           <Skeleton className="h-4 w-28" />
           <div className="flex-grow" />
           <Skeleton className="h-6 w-6 rounded-sm" />
        </div>
      ))}
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{t('selectTopicsTitle')}</h1>
          <p className="text-muted-foreground">{t('selectTopicsDescription')}</p>
        </div>
        <div className="flex-1">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {topics.map((topic) => (
                <SelectionCard
                  key={topic.id}
                  icon={getTopicIcon(topic.id)}
                  label={topic.label}
                  isSelected={!!selectedTopics.find(t => t.id === topic.id)}
                  onSelect={() => handleSelectTopic(topic)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="py-4">
        <Button onClick={handleNext} disabled={selectedTopics.length === 0 || isNavigating} size="lg" className="w-full">
          {isNavigating ? <Loader2 className="animate-spin" /> : t('continueButton')}
        </Button>
      </div>
    </main>
  );
}
