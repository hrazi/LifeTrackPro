import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, CheckCircle, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDailyCheckinSchema } from "@shared/schema";
import type { InsertDailyCheckin, DailyCheckin, WeeklyTask, DailyAction } from "@shared/schema";

interface DailyCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyCheckinDialog({ open, onOpenChange }: DailyCheckinDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState<number>(8);

  const { data: existingCheckin } = useQuery<DailyCheckin | null>({
    queryKey: ["/api/daily-checkins/today"],
    enabled: open,
  });

  const { data: weeklyTasks = [] } = useQuery<WeeklyTask[]>({
    queryKey: ["/api/weekly-tasks"],
    queryFn: () => fetch("/api/weekly-tasks?currentWeek=true").then(res => res.json()),
    enabled: open,
  });

  const { data: dailyActions = [] } = useQuery<DailyAction[]>({
    queryKey: ["/api/daily-actions"],
    queryFn: () => fetch("/api/daily-actions?today=true").then(res => res.json()),
    enabled: open,
  });

  const form = useForm<InsertDailyCheckin>({
    resolver: zodResolver(insertDailyCheckinSchema),
    defaultValues: {
      date: new Date(),
      rating: 8,
      wins: "",
      priorities: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDailyCheckin) => {
      await apiRequest("POST", "/api/daily-checkins", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-checkins/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Daily check-in saved successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save daily check-in",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/weekly-tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const updateActionMutation = useMutation({
    mutationFn: async ({ actionId, completed }: { actionId: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/daily-actions/${actionId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const onSubmit = (data: InsertDailyCheckin) => {
    createMutation.mutate({ ...data, rating: selectedRating });
  };

  const ratingButtons = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Daily Check-in</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {existingCheckin ? (
          <div className="space-y-4">
            <p className="text-slate-600">You've already completed today's check-in!</p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm"><strong>Rating:</strong> {existingCheckin.rating}/10</p>
              {existingCheckin.wins && (
                <p className="text-sm mt-2"><strong>Wins:</strong> {existingCheckin.wins}</p>
              )}
              {existingCheckin.priorities && (
                <p className="text-sm mt-2"><strong>Priorities:</strong> {existingCheckin.priorities}</p>
              )}
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Weekly Tasks Review */}
              {weeklyTasks.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-medium text-slate-700">This Week's Tasks</h3>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {weeklyTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={!!task.completed}
                          onCheckedChange={(checked) => {
                            updateTaskMutation.mutate({ taskId: task.id, completed: !!checked });
                          }}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-sm flex-1 cursor-pointer ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-700'
                          }`}
                        >
                          {task.title}
                        </label>
                        {task.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              )}

              {/* Daily Actions Review */}
              {dailyActions.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <h3 className="text-sm font-medium text-slate-700">Today's Actions</h3>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dailyActions.map((action) => (
                      <div key={action.id} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                        <Checkbox
                          id={`action-${action.id}`}
                          checked={!!action.completed}
                          onCheckedChange={(checked) => {
                            updateActionMutation.mutate({ actionId: action.id, completed: !!checked });
                          }}
                        />
                        <label
                          htmlFor={`action-${action.id}`}
                          className={`text-sm flex-1 cursor-pointer ${
                            action.completed ? 'line-through text-slate-500' : 'text-slate-700'
                          }`}
                        >
                          {action.title}
                          {action.time && <span className="text-xs text-slate-400 ml-1">at {action.time}</span>}
                        </label>
                        {action.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              )}

              {/* Day Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How was your day? (1-10)
                </label>
                <div className="flex space-x-2">
                  {ratingButtons.map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSelectedRating(rating)}
                      className={`w-8 h-8 rounded-full border-2 text-sm transition-colors ${
                        selectedRating === rating
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 hover:border-primary"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="wins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quick wins today</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What went well today?"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priorities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tomorrow's priorities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Top 3 things to focus on tomorrow"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Skip for today
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Save Check-in"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
