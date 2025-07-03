import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertQuarterlyGoalSchema } from "@shared/schema";
import { getCurrentQuarter } from "@/lib/date-utils";
import type { InsertQuarterlyGoal, QuarterlyGoal } from "@shared/schema";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: QuarterlyGoal; // For editing
}

export function CreateGoalDialog({ open, onOpenChange, goal }: CreateGoalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!goal;

  const form = useForm<InsertQuarterlyGoal>({
    resolver: zodResolver(insertQuarterlyGoalSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      quarter: goal?.quarter || getCurrentQuarter(),
      year: goal?.year || new Date().getFullYear(),
      completed: goal?.completed || false,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertQuarterlyGoal) => {
      if (isEditing) {
        await apiRequest("PATCH", `/api/quarterly-goals/${goal!.id}`, data);
      } else {
        await apiRequest("POST", "/api/quarterly-goals", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quarterly-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: `Quarterly goal ${isEditing ? 'updated' : 'created'} successfully`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} quarterly goal`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/quarterly-goals/${goal!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quarterly-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Quarterly goal deleted successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quarterly goal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertQuarterlyGoal) => {
    saveMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Quarterly Goal' : 'Create Quarterly Goal'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter goal title" {...field} />
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
                      placeholder="Describe your quarterly goal"
                      rows={3}
                      {...field} 
                    />
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
                {saveMutation.isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Goal" : "Create Goal")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
