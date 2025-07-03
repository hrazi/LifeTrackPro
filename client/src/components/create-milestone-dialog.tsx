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
import { insertMonthlyMilestoneSchema } from "@shared/schema";
import type { InsertMonthlyMilestone, QuarterlyGoal, MonthlyMilestone } from "@shared/schema";

interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: MonthlyMilestone; // For editing
}

export function CreateMilestoneDialog({ open, onOpenChange, milestone }: CreateMilestoneDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!milestone;

  const { data: quarterlyGoals = [] } = useQuery<QuarterlyGoal[]>({
    queryKey: ["/api/quarterly-goals"],
  });

  const form = useForm<InsertMonthlyMilestone>({
    resolver: zodResolver(insertMonthlyMilestoneSchema),
    defaultValues: {
      title: milestone?.title || "",
      description: milestone?.description || "",
      quarterlyGoalId: milestone?.quarterlyGoalId || 0,
      month: milestone?.month || new Date().getMonth() + 1,
      year: milestone?.year || new Date().getFullYear(),
      completed: milestone?.completed || false,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertMonthlyMilestone) => {
      if (isEditing) {
        await apiRequest("PATCH", `/api/monthly-milestones/${milestone!.id}`, data);
      } else {
        await apiRequest("POST", "/api/monthly-milestones", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: `Monthly milestone ${isEditing ? 'updated' : 'created'} successfully`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} monthly milestone`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/monthly-milestones/${milestone!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Monthly milestone deleted successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete monthly milestone",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMonthlyMilestone) => {
    saveMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this milestone? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Monthly Milestone' : 'Create Monthly Milestone'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quarterlyGoalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quarterly Goal</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quarterly goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {quarterlyGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id.toString()}>
                          {goal.title}
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
                    <Input placeholder="Enter milestone title" {...field} />
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
                      placeholder="Describe your monthly milestone"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Milestone" : "Create Milestone")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
