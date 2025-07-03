import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CreateGoalDialog } from "@/components/create-goal-dialog";
import { CreateMilestoneDialog } from "@/components/create-milestone-dialog";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { CreateActionDialog } from "@/components/create-action-dialog";
import type { QuarterlyGoal, MonthlyMilestone, WeeklyTask, DailyAction } from "@shared/schema";

export default function Timeline() {
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    const currentYear = new Date().getFullYear();
    return `${currentYear}-Q${currentQuarter}`;
  });

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateAction, setShowCreateAction] = useState(false);

  // Parse selected quarter
  const [year, quarter] = selectedQuarter.split('-Q').map((part, index) => 
    index === 0 ? parseInt(part) : `Q${part}`
  );

  // Fetch data for all entities
  const { data: goals = [] } = useQuery<QuarterlyGoal[]>({
    queryKey: ["/api/quarterly-goals"],
  });

  const { data: milestones = [] } = useQuery<MonthlyMilestone[]>({
    queryKey: ["/api/monthly-milestones"],
  });

  const { data: tasks = [] } = useQuery<WeeklyTask[]>({
    queryKey: ["/api/weekly-tasks"],
  });

  const { data: actions = [] } = useQuery<DailyAction[]>({
    queryKey: ["/api/daily-actions"],
  });

  // Filter data for selected quarter
  const quarterGoals = useMemo(() => {
    return goals.filter(goal => goal.quarter === quarter && goal.year === parseInt(year as string));
  }, [goals, quarter, year]);

  // Generate quarter navigation options
  const generateQuarters = () => {
    const quarters = [];
    const currentYear = new Date().getFullYear();
    
    // Generate past, current, and future quarters (2 years back, 2 years forward)
    for (let yearOffset = -2; yearOffset <= 2; yearOffset++) {
      const targetYear = currentYear + yearOffset;
      for (let q = 1; q <= 4; q++) {
        quarters.push(`${targetYear}-Q${q}`);
      }
    }
    
    return quarters;
  };

  const availableQuarters = generateQuarters();
  const currentQuarterIndex = availableQuarters.indexOf(selectedQuarter);

  const navigateQuarter = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentQuarterIndex - 1)
      : Math.min(availableQuarters.length - 1, currentQuarterIndex + 1);
    
    setSelectedQuarter(availableQuarters[newIndex]);
  };

  const getQuarterStatus = () => {
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    const currentYear = new Date().getFullYear();
    const currentQuarterString = `${currentYear}-Q${currentQuarter}`;
    
    if (selectedQuarter === currentQuarterString) return "current";
    if (selectedQuarter < currentQuarterString) return "past";
    return "future";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return <Badge className="bg-blue-100 text-blue-800">Current Quarter</Badge>;
      case "past":
        return <Badge className="bg-gray-100 text-gray-800">Past Quarter</Badge>;
      case "future":
        return <Badge className="bg-green-100 text-green-800">Future Quarter</Badge>;
      default:
        return null;
    }
  };

  const getQuarterProgress = () => {
    if (quarterGoals.length === 0) return 0;
    const completed = quarterGoals.filter(goal => goal.completed).length;
    return Math.round((completed / quarterGoals.length) * 100);
  };

  const getMonthsInQuarter = () => {
    const quarterNum = parseInt((quarter as string).replace('Q', ''));
    const startMonth = (quarterNum - 1) * 3;
    return [
      new Date(parseInt(year as string), startMonth, 1).toLocaleString('default', { month: 'long' }),
      new Date(parseInt(year as string), startMonth + 1, 1).toLocaleString('default', { month: 'long' }),
      new Date(parseInt(year as string), startMonth + 2, 1).toLocaleString('default', { month: 'long' })
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Goal Timeline</h1>
              <p className="text-slate-600">Navigate through quarters to view and manage your goals</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateGoal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Goal
              </Button>
            </div>
          </div>
        </div>

        {/* Quarter Navigation */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigateQuarter('prev')}
              disabled={currentQuarterIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-slate-600" />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">{selectedQuarter}</h2>
                <p className="text-sm text-slate-600">{getMonthsInQuarter().join(' • ')}</p>
              </div>
              {getStatusBadge(getQuarterStatus())}
            </div>

            <Button
              variant="outline"
              onClick={() => navigateQuarter('next')}
              disabled={currentQuarterIndex === availableQuarters.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Quarter Progress */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <CircularProgress 
              percentage={getQuarterProgress()} 
              size={60}
              color="#3B82F6"
            />
            <div>
              <p className="text-sm text-slate-600">Quarter Progress</p>
              <p className="text-lg font-semibold text-slate-900">
                {quarterGoals.filter(g => g.completed).length} of {quarterGoals.length} goals completed
              </p>
            </div>
          </div>
        </Card>

        {/* Goals for Selected Quarter */}
        <div className="grid gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Goals for {selectedQuarter}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateMilestone(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>

            {quarterGoals.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-slate-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">No goals for this quarter</h4>
                <p className="text-slate-600 mb-4">Start by creating your first quarterly goal</p>
                <Button onClick={() => setShowCreateGoal(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Goal
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {quarterGoals.map((goal) => (
                  <Card key={goal.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-lg font-medium ${goal.completed ? 'line-through opacity-75' : ''}`}>
                          {goal.title}
                        </h4>
                        <p className="text-slate-600 mt-1">{goal.description}</p>
                        
                        {/* Show related milestones */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-slate-700">Milestones</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCreateTask(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2">
                            {milestones
                              .filter(m => m.quarterlyGoalId === goal.id)
                              .map((milestone) => (
                                <div key={milestone.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className={`text-sm ${milestone.completed ? 'line-through opacity-75' : ''}`}>
                                    {milestone.title}
                                  </span>
                                  <Badge variant={milestone.completed ? "secondary" : "outline"}>
                                    {milestone.completed ? "Complete" : "In Progress"}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <CircularProgress 
                          percentage={goal.completed ? 100 : 50} 
                          size={50}
                          color={goal.completed ? "#10B981" : "#3B82F6"}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons for other items */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
          <Button
            className="rounded-full shadow-lg"
            onClick={() => setShowCreateAction(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Action
          </Button>
        </div>

        {/* Dialogs */}
        <CreateGoalDialog 
          open={showCreateGoal} 
          onOpenChange={setShowCreateGoal}
        />
        <CreateMilestoneDialog 
          open={showCreateMilestone} 
          onOpenChange={setShowCreateMilestone}
        />
        <CreateTaskDialog 
          open={showCreateTask} 
          onOpenChange={setShowCreateTask}
        />
        <CreateActionDialog 
          open={showCreateAction} 
          onOpenChange={setShowCreateAction}
        />
      </div>
    </div>
  );
}