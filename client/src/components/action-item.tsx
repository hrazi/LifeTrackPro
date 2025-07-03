import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Edit2, Repeat } from "lucide-react";
import type { DailyAction } from "@shared/schema";

interface ActionItemProps {
  action: DailyAction;
  onEdit?: (action: DailyAction) => void;
}

export function ActionItem({ action, onEdit }: ActionItemProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      await apiRequest("PATCH", `/api/daily-actions/${action.id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked);
  };

  const formatActionDate = (date: Date) => {
    const actionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (actionDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (actionDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return actionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
      <Checkbox
        checked={!!action.completed}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className={`text-sm text-slate-800 ${action.completed ? 'line-through opacity-75' : ''}`}>
            {action.title}
          </p>
          {action.recurring && (
            <Badge variant="secondary" className="text-xs">
              <Repeat className="w-3 h-3 mr-1" />
              Recurring
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {action.description && `${action.description} • `}
          {formatActionDate(action.date)}
          {action.time && ` at ${action.time}`}
        </p>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(action)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
