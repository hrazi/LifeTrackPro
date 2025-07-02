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
import type { InsertDailyAction, WeeklyTask } from "@shared/schema";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateActionDialog({ open, onOpenChange }: CreateActionDialogProps) {
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

  const createMutation = useMutation({
    mutationFn: async (data: InsertDailyAction) => {
      await apiRequest("POST", "/api/daily-actions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Daily action created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create daily action",
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
          <DialogTitle>Create Daily Action</DialogTitle>
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
