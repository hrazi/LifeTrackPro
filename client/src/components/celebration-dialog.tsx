import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface CelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
}

export function CelebrationDialog({ open, onOpenChange, title, description }: CelebrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">🎉 Goal Achieved!</h3>
        <p className="text-slate-600 mb-6">
          You've successfully completed "{title}". {description || "Keep up the great work!"}
        </p>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
