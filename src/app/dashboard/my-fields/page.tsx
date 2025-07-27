'use client'
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const fields = [
  {
    id: 'field-a',
    name: 'Field A',
    crop: 'Wheat',
    lastCheck: '2 days ago',
    health: 92,
    issues: 0,
  },
  {
    id: 'field-b',
    name: 'Field B',
    crop: 'Corn',
    lastCheck: '1 day ago',
    health: 78,
    issues: 1,
  },
  {
    id: 'field-c',
    name: 'Field C',
    crop: 'Rice',
    lastCheck: '3 days ago',
    health: 88,
    issues: 0,
  },
  {
    id: 'field-d',
    name: 'Field D',
    crop: 'Soybean',
    lastCheck: '5 hours ago',
    health: 65,
    issues: 3,
  },
];

const getStatusColor = (health: number) => {
    if (health > 90) return 'bg-green-500';
    if (health > 70) return 'bg-orange-500';
    return 'bg-red-500';
}

const FieldCard = ({ field }: { field: (typeof fields)[0] }) => (
    <Link href={`/dashboard/my-fields/${field.id}`}>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 flex justify-between items-center">
            <div>
            <h3 className="font-semibold text-base">{`${field.name} - ${field.crop}`}</h3>
            <p className="text-xs text-muted-foreground">{`Last check: ${field.lastCheck}`}</p>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                    <div className={cn('w-2.5 h-2.5 rounded-full', getStatusColor(field.health))}></div>
                    <p className="font-semibold text-base">{`${field.health}%`}</p>
                </div>
                {field.issues > 0 && (
                    <p className="text-xs text-red-500">{`${field.issues} issue(s)`}</p>
                )}
            </div>
        </CardContent>
        </Card>
    </Link>
  );

export default function MyFieldsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4">
        {fields.map((field) => (
          <FieldCard key={field.name} field={field} />
        ))}
      </div>
    </div>
  );
}
