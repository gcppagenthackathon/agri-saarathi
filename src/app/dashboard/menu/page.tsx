
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';

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

export default function MenuPage() {
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
    </div>
  );
}
