import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import type { WeeklyTask } from "@shared/schema";

interface TaskItemProps {
  task: WeeklyTask;
}

export function TaskItem({ task }: TaskItemProps) {
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

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <div className="flex-1">
        <p className={`text-sm text-slate-800 ${task.completed ? 'line-through opacity-75' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-slate-500">
          {task.description || "Weekly task"}
        </p>
      </div>
    </div>
  );
}
