import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { MonthlyMilestone } from "@shared/schema";

interface MilestoneItemProps {
  milestone: MonthlyMilestone;
  onEdit?: (milestone: MonthlyMilestone) => void;
}

export function MilestoneItem({ milestone, onEdit }: MilestoneItemProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      await apiRequest("PATCH", `/api/monthly-milestones/${milestone.id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked);
  };

  const getStatusBadge = () => {
    if (milestone.completed) {
      return <Badge className="bg-secondary/10 text-secondary">Done</Badge>;
    }
    return <Badge className="bg-accent/10 text-accent">Active</Badge>;
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <Checkbox
        checked={milestone.completed}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <div className="flex-1">
        <p className={`text-sm font-medium text-slate-800 ${milestone.completed ? 'line-through opacity-75' : ''}`}>
          {milestone.title}
        </p>
        <p className="text-xs text-slate-500">
          {milestone.description || "Monthly milestone"}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusBadge()}
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(milestone)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
