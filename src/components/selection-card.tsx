
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectionCardProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}

export function SelectionCard({ label, isSelected, onSelect, icon }: SelectionCardProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ease-in-out",
        isSelected 
          ? "bg-accent border-primary text-primary" 
          : "bg-card border-border text-card-foreground hover:border-primary/50"
      )}
      onClick={onSelect}
      role="button"
      aria-pressed={isSelected}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="font-medium text-left text-sm flex-1">{label}</span>
      <Checkbox checked={isSelected} id={`check-${label}`} aria-label={`Select ${label}`} />
    </div>
  );
}
