
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getVoiceGuide, analyzePlantDiseaseAction } from './actions';
import type { IdentifyPlantDiseaseOutput } from '@/ai/flows/plant-disease-identification';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, ArrowLeft, RefreshCw, AlertTriangle, Upload, CheckCircle, ShieldCheck, FileKey } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/hooks/use-localization';


export default function PlantDiseasePage() {
  const router = useRouter();
  const { t } = useLocalization();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPlantDiseaseOutput | null>(null);
  const [voiceGuideUrl, setVoiceGuideUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const voiceGuidePlayed = useRef(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('cameraAccessDenied'),
          description: t('enableCameraPermission'),
        });
      }
    };

    getCameraPermission();
  }, [toast, t]);

  useEffect(() => {
    if (capturedImage || result) return;
    const fetchVoiceGuide = async () => {
      if (voiceGuidePlayed.current) return;
      voiceGuidePlayed.current = true;
      
      const voiceText = t('captureInstruction');
      const response = await getVoiceGuide(voiceText);
      if ('media' in response) {
        setVoiceGuideUrl(response.media);
      }
    };
    const timer = setTimeout(fetchVoiceGuide, 500);
    return () => clearTimeout(timer);
  }, [t, capturedImage, result]);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        handleSubmit(dataUrl);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCapturedImage(dataUrl);
        handleSubmit(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
    setResult(null);
    voiceGuidePlayed.current = false;
  }

  const handleSubmit = async (imageData: string) => {
    if (!imageData) {
      toast({
        title: t('noImageCaptured'),
        description: t('captureToAnalyze'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
        const finalResult = await analyzePlantDiseaseAction({ photoDataUri: imageData });
        if ('error' in finalResult) {
          throw new Error(finalResult.error);
        }

        setResult(finalResult);

        if (finalResult.treatmentPlan && finalResult.treatmentPlan.length > 0) {
            localStorage.setItem('treatmentPlan', JSON.stringify(finalResult));
        }

    } catch (error: any) {
        toast({
            title: t('analysisFailed'),
            description: error.message || 'An unknown error occurred.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const viewTreatmentPlan = () => {
      router.push('/dashboard/plant-disease/treatment');
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-black bg-opacity-50">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full h-full relative bg-black overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
                <p className="text-lg">Analyzing your plant...</p>
            </div>
        )}
        {hasCameraPermission === null && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        {hasCameraPermission === false && !capturedImage &&(
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold">{t('cameraAccessRequired')}</h2>
                <p className="text-muted-foreground">{t('grantCameraPermission')}</p>
            </div>
        )}
        {(hasCameraPermission || capturedImage) && (
            <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted style={{ display: capturedImage ? 'none' : 'block' }} />
                {capturedImage && (
                    <Image
                        src={capturedImage}
                        alt={t('capturedPlantLeaf')}
                        fill
                        objectFit="cover"
                    />
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </>
        )}
        </div>
      </main>
      
      {voiceGuideUrl && !capturedImage && !result && <audio src={voiceGuideUrl} autoPlay />}

      <footer className="w-full p-4 bg-black bg-opacity-70 absolute bottom-0">
        {result && (
          <Card className="bg-white/10 backdrop-blur-md text-white border-white/20 mb-4 animate-in fade-in-50 slide-in-from-bottom-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.diseaseName === 'None' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-yellow-400" />}
                {t('analysisResult')}
              </CardTitle>
              <CardDescription className="text-white/80">{result.plantName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-base">{t('identifiedDisease')}</h3>
                    <Badge variant={result.diseaseName === 'None' ? 'default' : 'destructive'} className="text-base">
                        {result.diseaseName}
                    </Badge>
                </div>
                <div>
                    <p className="text-sm">{result.summary}</p>
                </div>
              {result.treatmentSummary && (
                <div>
                  <h3 className="font-semibold text-base">Treatment Overview</h3>
                  <p className="text-sm text-white/90">{result.treatmentSummary}</p>
              </div>
              )}
            </CardContent>
            {result.treatmentPlan && result.treatmentPlan.length > 0 && (
                <CardFooter>
                    <Button onClick={viewTreatmentPlan} className="w-full bg-primary/80 hover:bg-primary text-white">
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        View Full Treatment Plan
                    </Button>
                </CardFooter>
            )}
          </Card>
        )}
      
        <div className="flex items-center justify-center gap-8">
            {capturedImage ? (
                <Button onClick={handleRetake} variant="outline" size="lg" className="rounded-full bg-white/20 border-none text-white hover:bg-white/30">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    {t('retake')}
                </Button>
            ) : (
                <>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Button onClick={handleUploadClick} variant="ghost" size="lg" className="rounded-full text-white hover:bg-white/20">
                    <Upload className="h-8 w-8" />
                  </Button>
                  <Button onClick={handleCapture} disabled={isLoading || hasCameraPermission !== true} className="w-20 h-20 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-black ring-2 ring-white shadow-lg">
                      {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                  </Button>
                  <div className="w-16 h-16" />
                </>
            )}
        </div>
      </footer>
    </div>
  );
}
