import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Edit2, Repeat } from "lucide-react";
import type { WeeklyTask } from "@shared/schema";

interface TaskItemProps {
  task: WeeklyTask;
  onEdit?: (task: WeeklyTask) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      await apiRequest("PATCH", `/api/weekly-tasks/${task.id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked);
  };

  const formatWeekRange = (weekStart: Date, weekEnd: Date) => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
      <Checkbox
        checked={!!task.completed}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className={`text-sm text-slate-800 ${task.completed ? 'line-through opacity-75' : ''}`}>
            {task.title}
          </p>
          {task.recurring && (
            <Badge variant="secondary" className="text-xs">
              <Repeat className="w-3 h-3 mr-1" />
              Recurring
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {task.description && `${task.description} • `}
          Week of {formatWeekRange(task.weekStart, task.weekEnd)}
        </p>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(task)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
