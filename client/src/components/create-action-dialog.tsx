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
import { insertDailyActionSchema } from "@shared/schema";
import type { InsertDailyAction, WeeklyTask, DailyAction } from "@shared/schema";
import { useEffect } from "react";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: DailyAction; // For editing
}

export function CreateActionDialog({ open, onOpenChange, action }: CreateActionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: weeklyTasks = [] } = useQuery<WeeklyTask[]>({
    queryKey: ["/api/weekly-tasks"],
    queryFn: () => fetch("/api/weekly-tasks?currentWeek=true").then(res => res.json())
  });

  const form = useForm<InsertDailyAction>({
    resolver: zodResolver(insertDailyActionSchema),
    defaultValues: {
      title: "",
      description: "",
      weeklyTaskId: undefined,
      date: new Date(),
      time: "",
      completed: false,
    },
  });

  // Reset form when action changes or dialog opens
  useEffect(() => {
    if (action) {
      form.reset({
        title: action.title,
        description: action.description || "",
        weeklyTaskId: action.weeklyTaskId || undefined,
        date: new Date(action.date),
        time: action.time || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        weeklyTaskId: undefined,
        date: new Date(),
        time: "",
        completed: false,
        recurring: false,
      });
    }
  }, [action, form, open]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertDailyAction) => {
      if (action) {
        await apiRequest("PATCH", `/api/daily-actions/${action.id}`, data);
      } else {
        await apiRequest("POST", "/api/daily-actions", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: action ? "Daily action updated successfully" : "Daily action created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: action ? "Failed to update daily action" : "Failed to create daily action",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDailyAction) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{action ? "Edit Daily Action" : "Create Daily Action"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="weeklyTaskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Task (optional)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a weekly task or leave unlinked" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No task (standalone action)</SelectItem>
                      {weeklyTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Day to Schedule</label>
              <Select 
                onValueChange={(value) => {
                  const dayOffset = parseInt(value);
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() + dayOffset);
                  form.setValue("date", targetDate);
                }}
                defaultValue="0"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day to schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Today</SelectItem>
                  <SelectItem value="1">Tomorrow</SelectItem>
                  <SelectItem value="2">In 2 Days</SelectItem>
                  <SelectItem value="3">In 3 Days</SelectItem>
                  <SelectItem value="4">In 4 Days</SelectItem>
                  <SelectItem value="5">In 5 Days</SelectItem>
                  <SelectItem value="6">In 6 Days</SelectItem>
                  <SelectItem value="7">Next Week</SelectItem>
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
                    <Input placeholder="Enter action title" {...field} />
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
                      placeholder="Describe your daily action"
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
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9:00 AM" {...field} value={field.value || ""} />
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
                      Recurring daily action
                    </FormLabel>
                    <p className="text-xs text-slate-500">
                      Automatically create this action for future days
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
                {createMutation.isPending ? "Creating..." : "Create Action"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
