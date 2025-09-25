import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'not-started' | 'in-progress' | 'done' | 'blocked';
  className?: string;
}

const statusConfig = {
  'not-started': {
    label: 'Not Started',
    className: 'status-not-started'
  },
  'in-progress': {
    label: 'In Progress',
    className: 'status-in-progress'
  },
  'done': {
    label: 'Done',
    className: 'status-done'
  },
  'blocked': {
    label: 'Blocked',
    className: 'status-blocked'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}