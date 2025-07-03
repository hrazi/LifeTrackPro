import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import type { QuarterlyGoal } from "@shared/schema";

interface GoalCardProps {
  goal: QuarterlyGoal;
  onEdit?: (goal: QuarterlyGoal) => void;
  onDelete?: (goalId: number) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  // Mock progress calculation - in real app this would be calculated from milestones
  const progress = goal.completed ? 100 : Math.floor(Math.random() * 90) + 10;
  
  const getStatusBadge = () => {
    if (goal.completed) {
      return <Badge className="bg-secondary/10 text-secondary">Complete</Badge>;
    }
    if (progress >= 75) {
      return <Badge className="bg-secondary/10 text-secondary">On Track</Badge>;
    }
    if (progress >= 50) {
      return <Badge className="bg-accent/10 text-accent">Behind</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-600">Starting</Badge>;
  };

  const getProgressColor = () => {
    if (goal.completed) return "#10B981";
    if (progress >= 75) return "#3B82F6";
    if (progress >= 50) return "#F59E0B";
    return "#8B5CF6";
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-medium text-slate-800 ${goal.completed ? 'line-through opacity-75' : ''}`}>
            {goal.title}
          </h4>
          <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <CircularProgress 
            percentage={progress} 
            color={getProgressColor()}
          />
          {getStatusBadge()}
        </div>
      </div>
      
      {(onEdit || onDelete) && (
        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-slate-100">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="text-slate-600 hover:text-slate-800"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
