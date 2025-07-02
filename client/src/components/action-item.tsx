import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import type { DailyAction } from "@shared/schema";

interface ActionItemProps {
  action: DailyAction;
}

export function ActionItem({ action }: ActionItemProps) {
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

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
      <Checkbox
        checked={action.completed}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <div className="flex-1">
        <p className={`text-sm text-slate-800 ${action.completed ? 'line-through opacity-75' : ''}`}>
          {action.title}
        </p>
        <p className="text-xs text-slate-500">
          {action.time} • {action.description || "Daily action"}
        </p>
      </div>
    </div>
  );
}
