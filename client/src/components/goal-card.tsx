import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";
import type { QuarterlyGoal } from "@shared/schema";

interface GoalCardProps {
  goal: QuarterlyGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
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
    <div className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
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
    </div>
  );
}
