'use client';

import {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';
import type {IdentifyPlantDiseaseOutput} from '@/ai/flows/plant-disease-identification';
import {cn} from '@/lib/utils';
import {verifyProgress} from './actions';
import {useToast} from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

type Task = {
  id: string;
  description: string;
  completed?: boolean;
  progressImage?: string;
  verification?: {
    verified: boolean;
    feedback: string;
  };
  isVerifying?: boolean;
};

type TreatmentDay = {
  day: number;
  tasks: Task[];
};

export default function TreatmentPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [plan, setPlan] = useState<IdentifyPlantDiseaseOutput | null>(null);
  const [treatmentDays, setTreatmentDays] = useState<TreatmentDay[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [progress, setProgress] = useState(0);
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  useEffect(() => {
    const storedPlan = localStorage.getItem('treatmentPlan');
    if (storedPlan) {
      const parsedPlan: IdentifyPlantDiseaseOutput = JSON.parse(storedPlan);
      setPlan(parsedPlan);

      const storedProgress = localStorage.getItem(`treatmentProgress_${parsedPlan.diseaseName}_${parsedPlan.plantName}`);
      let initialTasks: TreatmentDay[];

      if (storedProgress) {
        initialTasks = JSON.parse(storedProgress);
      } else {
        initialTasks = parsedPlan.treatmentPlan.map(day => ({
            ...day,
            tasks: day.tasks.map(task => ({ ...task, completed: false }))
        }));
      }
      
      setTreatmentDays(initialTasks);
      setOpenDay(initialTasks.find(d => d.tasks.some(t => !t.completed))?.day || 1);
    } else {
      router.back();
    }
  }, [router]);
  
  useEffect(() => {
    if (treatmentDays.length > 0 && plan) {
      localStorage.setItem(`treatmentProgress_${plan.diseaseName}_${plan.plantName}`, JSON.stringify(treatmentDays));
    }
    const totalTasks = treatmentDays.reduce((acc, day) => acc + day.tasks.length, 0);
    const completedTasks = treatmentDays.reduce((acc, day) => acc + day.tasks.filter(t => t.completed).length, 0);
    setProgress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
  }, [treatmentDays, plan]);

  const toggleDay = (day: number) => {
    setOpenDay(openDay === day ? null : day);
  };
  
  const handleToggleTask = (dayIndex: number, taskIndex: number) => {
    const newTreatmentDays = [...treatmentDays];
    const task = newTreatmentDays[dayIndex].tasks[taskIndex];
    if (!task.completed && !task.progressImage) {
        toast({
            title: 'Upload Required',
            description: 'Please upload a progress picture before marking as complete.',
            variant: 'destructive'
        })
        return;
    }
    task.completed = !task.completed;
    setTreatmentDays(newTreatmentDays);
  };
  
  const handleImageUploadClick = (dayIndex: number, taskIndex: number) => {
    fileInputRefs.current[`${dayIndex}-${taskIndex}`]?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, dayIndex: number, taskIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newTreatmentDays = [...treatmentDays];
        const task = newTreatmentDays[dayIndex].tasks[taskIndex];
        task.progressImage = imageUrl;
        task.isVerifying = true;
        setTreatmentDays(newTreatmentDays);
        handleVerification(imageUrl, dayIndex, taskIndex);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerification = async (imageUrl: string, dayIndex: number, taskIndex: number) => {
    if (!plan) return;
    const task = treatmentDays[dayIndex].tasks[taskIndex];

    const result = await verifyProgress({
      image: imageUrl,
      task: task.description,
      disease: plan.diseaseName
    });
    
    const newTreatmentDays = [...treatmentDays];
    const updatedTask = newTreatmentDays[dayIndex].tasks[taskIndex];
    updatedTask.isVerifying = false;

    if ('error' in result) {
      updatedTask.verification = { verified: false, feedback: result.error };
      toast({ title: 'Verification Failed', description: result.error, variant: 'destructive'});
    } else {
      updatedTask.verification = result;
      toast({ title: 'Verification Complete', description: result.feedback });
      if(result.verified) {
        updatedTask.completed = true;
      }
    }
    setTreatmentDays(newTreatmentDays);
  };

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold truncate">Treatment Plan</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>{plan.plantName} - {plan.diseaseName}</CardTitle>
            <CardDescription>Overall Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={progress} className="h-4" />
              <span className="font-bold text-lg">{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
            {treatmentDays.map((day, dayIndex) => (
                <Card key={day.day} className={cn('overflow-hidden transition-all', openDay === day.day ? 'shadow-xl' : 'shadow-md')}>
                    <CardHeader className="flex flex-row items-center justify-between cursor-pointer p-4" onClick={() => toggleDay(day.day)}>
                        <div className="flex items-center gap-3">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", day.tasks.every(t => t.completed) ? 'bg-green-500' : 'bg-primary')}>
                                <span className="font-bold">{day.day}</span>
                            </div>
                            <CardTitle className="text-lg">Day {day.day}</CardTitle>
                        </div>
                        {openDay === day.day ? <ChevronUp /> : <ChevronDown />}
                    </CardHeader>
                    {openDay === day.day && (
                        <CardContent className="p-4 pt-0 space-y-4 animate-in fade-in-20">
                            {day.tasks.map((task, taskIndex) => (
                                <div key={task.id}>
                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-white border">
                                        <button onClick={() => handleToggleTask(dayIndex, taskIndex)} disabled={!task.progressImage}>
                                            <div className={cn("mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2", task.completed ? "border-green-500 bg-green-500" : "border-gray-400")}>
                                                {task.completed && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                        </button>
                                        <div className="flex-1">
                                            <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.description}</p>
                                            
                                            <div className="mt-2 flex items-center gap-4">
                                                <input 
                                                  type="file" 
                                                  accept="image/*" 
                                                  className="hidden" 
                                                  ref={el => fileInputRefs.current[`${dayIndex}-${taskIndex}`] = el}
                                                  onChange={(e) => handleFileChange(e, dayIndex, taskIndex)}
                                                />
                                                <Button size="sm" variant="outline" onClick={() => handleImageUploadClick(dayIndex, taskIndex)} disabled={task.isVerifying}>
                                                    {task.isVerifying ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="mr-2 h-4 w-4" />
                                                    )}
                                                    {task.progressImage ? 'Re-upload' : 'Upload'}
                                                </Button>
                                                {task.progressImage && (
                                                    <Image src={task.progressImage} alt="Progress" width={40} height={40} className="rounded-md object-cover" />
                                                )}
                                            </div>
                                            {task.verification && (
                                                <Alert className={cn('mt-3 text-sm', task.verification.verified ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')}>
                                                    <AlertTitle className="flex items-center gap-2 font-semibold">
                                                        {task.verification.verified ? <CheckCircle className="h-4 w-4 text-green-600"/> : <XCircle className="h-4 w-4 text-red-600"/>}
                                                        AI Verification
                                                    </AlertTitle>
                                                    <AlertDescription className="pl-2">
                                                        {task.verification.feedback}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                             {!task.verification && task.completed && (
                                                 <Alert variant="default" className="mt-3 text-sm border-blue-200 bg-blue-50">
                                                     <AlertTitle className="flex items-center gap-2 font-semibold">
                                                        <Info className="h-4 w-4 text-blue-600"/>
                                                        Note
                                                     </AlertTitle>
                                                     <AlertDescription>
                                                         This task was marked complete manually.
                                                     </AlertDescription>
                                                 </Alert>
                                             )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
