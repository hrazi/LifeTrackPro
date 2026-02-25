import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Timer } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-slate-900">Life Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/timeline">
                <Button
                  variant={location === "/timeline" ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
              </Link>

              <Link href="/countdown">
                <Button
                  variant={location === "/countdown" ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center"
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Countdown
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}