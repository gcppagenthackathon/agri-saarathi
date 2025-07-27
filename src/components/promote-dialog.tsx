
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Share2, Sparkles, Star } from 'lucide-react';
import { generateSocialPoster } from '@/app/dashboard/my-fields/[id]/actions';
import { Skeleton } from './ui/skeleton';

interface PromoteDialogProps {
    cropName: string;
    isHeaderButton?: boolean;
}

export function PromoteDialog({ cropName, isHeaderButton = false }: PromoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const { toast } = useToast();

  const handleGeneratePoster = async () => {
    setIsLoading(true);
    setPosterUrl(null);
    const result = await generateSocialPoster(cropName);
    if ('error' in result) {
      toast({
        title: 'Poster Generation Failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setPosterUrl(result.imageUrl);
    }
    setIsLoading(false);
  };

  const handlePost = () => {
    toast({
      title: 'Post Successful!',
      description: `Your promotion for ${cropName} has been posted to ${selectedPlatform}.`,
    });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset state when opening
      setPosterUrl(null);
      handleGeneratePoster();
    }
  }

  const TriggerButton = isHeaderButton ? (
     <Button variant="outline" size="sm">
        <Share2 className="mr-2 h-4 w-4" />
        Promote
    </Button>
  ) : (
    <Button variant="ghost" className="flex-col h-auto gap-1">
        <Share2 className="h-5 w-5 text-primary" />
        <span className="text-xs">Promote</span>
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Sparkles className="text-primary h-5 w-5"/>
            Promote Your Crop
          </DialogTitle>
          <DialogDescription>
            Generate an AI-powered poster to promote your {cropName} on social media.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="aspect-square w-full rounded-md border bg-muted flex items-center justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating your poster...</p>
                </div>
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt={`Promotional poster for ${cropName}`}
                width={400}
                height={400}
                className="rounded-md object-contain"
              />
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p>Could not load poster.</p>
                </div>
            )}
          </div>
        </div>
        <div>
          <Label className="font-semibold">Choose Platform</Label>
          <RadioGroup
            defaultValue="instagram"
            className="grid grid-cols-2 gap-4 mt-2"
            onValueChange={setSelectedPlatform}
          >
            <div>
              <RadioGroupItem value="instagram" id="r-instagram" className="peer sr-only" />
              <Label
                htmlFor="r-instagram"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Instagram
              </Label>
            </div>
            <div>
              <RadioGroupItem value="facebook" id="r-facebook" className="peer sr-only" />
              <Label
                htmlFor="r-facebook"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Facebook
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={handlePost} disabled={isLoading || !posterUrl} className="w-full">
            Post to {selectedPlatform}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
