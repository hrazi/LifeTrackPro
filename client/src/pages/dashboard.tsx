import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus, Settings, User } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { GoalCard } from "@/components/goal-card";
import { MilestoneItem } from "@/components/milestone-item";
import { TaskItem } from "@/components/task-item";
import { ActionItem } from "@/components/action-item";
import { CreateGoalDialog } from "@/components/create-goal-dialog";
import { CreateMilestoneDialog } from "@/components/create-milestone-dialog";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { CreateActionDialog } from "@/components/create-action-dialog";
import { DailyCheckinDialog } from "@/components/daily-checkin-dialog";
import { CelebrationDialog } from "@/components/celebration-dialog";
import { getCurrentQuarter, getCurrentWeekRange, getTodayDate } from "@/lib/date-utils";
import type { QuarterlyGoal, MonthlyMilestone, WeeklyTask, DailyAction } from "@shared/schema";

export default function Dashboard() {
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateAction, setShowCreateAction] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  
  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: quarterlyGoals = [] } = useQuery<QuarterlyGoal[]>({
    queryKey: ["/api/quarterly-goals"],
  });

  const { data: monthlyMilestones = [] } = useQuery<MonthlyMilestone[]>({
    queryKey: ["/api/monthly-milestones"],
  });

  const { data: weeklyTasks = [] } = useQuery<WeeklyTask[]>({
    queryKey: ["/api/weekly-tasks"],
    queryFn: () => fetch("/api/weekly-tasks?currentWeek=true").then(res => res.json())
  });

  const { data: dailyActions = [] } = useQuery<DailyAction[]>({
    queryKey: ["/api/daily-actions"],
    queryFn: () => fetch("/api/daily-actions?today=true").then(res => res.json())
  });

  const currentQuarter = getCurrentQuarter();
  const currentWeekRange = getCurrentWeekRange();
  const todayDate = getTodayDate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-slate-800">Life Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-slate-600 mt-1">Here's your progress overview for {currentQuarter}</p>
            </div>
            <Button onClick={() => setShowCheckin(true)} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Daily Check-in</span>
            </Button>
          </div>

          {/* Progress Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Quarterly Goals</h3>
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {stats?.quarterly.completed || 0}
                  </span>
                  <span className="text-slate-500">/ {stats?.quarterly.total || 0}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats?.quarterly.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats?.quarterly.percentage || 0}% complete</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Monthly Milestones</h3>
                  <span className="text-2xl">📅</span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {stats?.monthly.completed || 0}
                  </span>
                  <span className="text-slate-500">/ {stats?.monthly.total || 0}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats?.monthly.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats?.monthly.percentage || 0}% complete</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Weekly Tasks</h3>
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {stats?.weekly.completed || 0}
                  </span>
                  <span className="text-slate-500">/ {stats?.weekly.total || 0}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats?.weekly.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats?.weekly.percentage || 0}% complete</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Today's Actions</h3>
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {stats?.daily.completed || 0}
                  </span>
                  <span className="text-slate-500">/ {stats?.daily.total || 0}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-future h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats?.daily.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats?.daily.percentage || 0}% complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quarterly Goals Column */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Quarterly Goals</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateGoal(true)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-1">{currentQuarter}</p>
              </div>
              
              <CardContent className="p-6 space-y-4">
                {quarterlyGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No quarterly goals yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowCreateGoal(true)}
                    >
                      Create your first goal
                    </Button>
                  </div>
                ) : (
                  quarterlyGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Milestones Column */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Monthly Milestones</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateMilestone(true)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-1">December 2024</p>
              </div>
              
              <CardContent className="p-6 space-y-3">
                {monthlyMilestones.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No milestones yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowCreateMilestone(true)}
                    >
                      Add milestone
                    </Button>
                  </div>
                ) : (
                  monthlyMilestones.map((milestone) => (
                    <MilestoneItem key={milestone.id} milestone={milestone} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Tasks Column */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Weekly Tasks</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateTask(true)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-1">{currentWeekRange}</p>
              </div>
              
              <CardContent className="p-6 space-y-2">
                {weeklyTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No tasks this week</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowCreateTask(true)}
                    >
                      Add task
                    </Button>
                  </div>
                ) : (
                  weeklyTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Actions Column */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Today's Actions</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateAction(true)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-1">{todayDate}</p>
              </div>
              
              <CardContent className="p-6 space-y-2">
                {dailyActions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No actions for today</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowCreateAction(true)}
                    >
                      Add action
                    </Button>
                  </div>
                ) : (
                  dailyActions.map((action) => (
                    <ActionItem key={action.id} action={action} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateGoalDialog open={showCreateGoal} onOpenChange={setShowCreateGoal} />
      <CreateMilestoneDialog open={showCreateMilestone} onOpenChange={setShowCreateMilestone} />
      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
      <CreateActionDialog open={showCreateAction} onOpenChange={setShowCreateAction} />
      <DailyCheckinDialog open={showCheckin} onOpenChange={setShowCheckin} />
    </div>
  );
}
