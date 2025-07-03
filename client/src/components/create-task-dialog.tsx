import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertWeeklyTaskSchema } from "@shared/schema";
import { getStartOfWeek, getEndOfWeek } from "@/lib/date-utils";
import type { InsertWeeklyTask, MonthlyMilestone, WeeklyTask } from "@shared/schema";
import { useEffect } from "react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: WeeklyTask; // For editing
}

export function CreateTaskDialog({ open, onOpenChange, task }: CreateTaskDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monthlyMilestones = [] } = useQuery<MonthlyMilestone[]>({
    queryKey: ["/api/monthly-milestones"],
  });

  const form = useForm<InsertWeeklyTask>({
    resolver: zodResolver(insertWeeklyTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      monthlyMilestoneId: undefined,
      weekStart: getStartOfWeek(),
      weekEnd: getEndOfWeek(),
      completed: false,
    },
  });

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        monthlyMilestoneId: task.monthlyMilestoneId || undefined,
        weekStart: new Date(task.weekStart),
        weekEnd: new Date(task.weekEnd),
      });
    } else {
      form.reset({
        title: "",
        description: "",
        monthlyMilestoneId: undefined,
        weekStart: getStartOfWeek(),
        weekEnd: getEndOfWeek(),
        completed: false,
        recurring: false,
      });
    }
  }, [task, form, open]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertWeeklyTask) => {
      if (task) {
        await apiRequest("PATCH", `/api/weekly-tasks/${task.id}`, data);
      } else {
        await apiRequest("POST", "/api/weekly-tasks", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: task ? "Weekly task updated successfully" : "Weekly task created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: task ? "Failed to update weekly task" : "Failed to create weekly task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertWeeklyTask) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Weekly Task" : "Create Weekly Task"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyMilestoneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Milestone (optional)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a monthly milestone or leave unlinked" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No milestone (standalone task)</SelectItem>
                      {monthlyMilestones.map((milestone) => (
                        <SelectItem key={milestone.id} value={milestone.id.toString()}>
                          {milestone.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Week to Schedule</label>
              <Select 
                onValueChange={(value) => {
                  const weekOffset = parseInt(value);
                  const startOfWeek = getStartOfWeek();
                  const endOfWeek = getEndOfWeek();
                  
                  // Calculate the target week
                  const targetWeekStart = new Date(startOfWeek);
                  const targetWeekEnd = new Date(endOfWeek);
                  targetWeekStart.setDate(targetWeekStart.getDate() + (weekOffset * 7));
                  targetWeekEnd.setDate(targetWeekEnd.getDate() + (weekOffset * 7));
                  
                  form.setValue("weekStart", targetWeekStart);
                  form.setValue("weekEnd", targetWeekEnd);
                }}
                defaultValue="0"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select week to schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">This Week</SelectItem>
                  <SelectItem value="1">Next Week</SelectItem>
                  <SelectItem value="2">In 2 Weeks</SelectItem>
                  <SelectItem value="3">In 3 Weeks</SelectItem>
                  <SelectItem value="4">In 4 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your weekly task"
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
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Recurring weekly task
                    </FormLabel>
                    <p className="text-xs text-slate-500">
                      Automatically create this task for future weeks
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
