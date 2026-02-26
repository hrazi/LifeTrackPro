import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Timer } from "lucide-react";

interface Countdown {
  id: string;
  label: string;
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

function CountdownCard({ countdown, onDelete }: { countdown: Countdown; onDelete: (id: string) => void }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(countdown.targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(countdown.targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown.targetDate]);

  const formattedDate = new Date(countdown.targetDate).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">{countdown.label}</h3>
          <p className="text-primary-foreground/80 text-sm mt-0.5">{formattedDate}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 hover:text-white"
          onClick={() => onDelete(countdown.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-6">
        {timeLeft.isPast ? (
          <p className="text-center text-slate-500 font-medium py-4">This date has passed.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <span className="block text-3xl font-bold text-slate-800 tabular-nums">
                  {String(value).padStart(2, "0")}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">{label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const STORAGE_KEY = "lifetrack-countdowns";

function loadCountdowns(): Countdown[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCountdowns(countdowns: Countdown[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
}

export default function CountdownPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>(loadCountdowns);
  const [label, setLabel] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!label.trim()) {
      setError("Please enter a label for this countdown.");
      return;
    }
    if (!targetDate) {
      setError("Please select a target date.");
      return;
    }
    setError("");

    const updated = [
      ...countdowns,
      { id: crypto.randomUUID(), label: label.trim(), targetDate },
    ];
    setCountdowns(updated);
    saveCountdowns(updated);
    setLabel("");
    setTargetDate("");
  };

  const handleDelete = (id: string) => {
    const updated = countdowns.filter((c) => c.id !== id);
    setCountdowns(updated);
    saveCountdowns(updated);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Countdown Calculator</h1>
          </div>
          <p className="text-slate-500 ml-12">Track how many days are left until important dates.</p>
        </div>

        {/* Add new countdown */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Add a countdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="countdown-label">Event name</Label>
                <Input
                  id="countdown-label"
                  placeholder="e.g. My Birthday"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="countdown-date">Target date</Label>
                <Input
                  id="countdown-date"
                  type="date"
                  min={today}
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <Button className="mt-4 flex items-center space-x-2" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              <span>Add Countdown</span>
            </Button>
          </CardContent>
        </Card>

        {/* Countdown list */}
        {countdowns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Timer className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No countdowns yet</p>
            <p className="text-sm mt-1">Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {countdowns.map((c) => (
              <CountdownCard key={c.id} countdown={c} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
