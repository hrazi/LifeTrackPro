import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDailyCheckinSchema } from "@shared/schema";
import type { InsertDailyCheckin, DailyCheckin } from "@shared/schema";

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
