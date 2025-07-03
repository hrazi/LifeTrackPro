import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuarterlyGoalSchema,
  insertMonthlyMilestoneSchema,
  insertWeeklyTaskSchema,
  insertDailyActionSchema,
  insertDailyCheckinSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quarterly Goals
  app.get("/api/quarterly-goals", async (req, res) => {
    try {
      const goals = await storage.getQuarterlyGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quarterly goals" });
    }
  });

  app.get("/api/quarterly-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getQuarterlyGoalWithMilestones(id);
      if (!goal) {
        return res.status(404).json({ message: "Quarterly goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quarterly goal" });
    }
  });

  app.post("/api/quarterly-goals", async (req, res) => {
    try {
      const goalData = insertQuarterlyGoalSchema.parse(req.body);
      const goal = await storage.createQuarterlyGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.patch("/api/quarterly-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateQuarterlyGoal(id, updates);
      if (!goal) {
        return res.status(404).json({ message: "Quarterly goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quarterly goal" });
    }
  });

  app.delete("/api/quarterly-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuarterlyGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quarterly goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quarterly goal" });
    }
  });

  // Monthly Milestones
  app.get("/api/monthly-milestones", async (req, res) => {
    try {
      const goalId = req.query.goalId ? parseInt(req.query.goalId as string) : undefined;
      const milestones = goalId 
        ? await storage.getMilestonesByGoal(goalId)
        : await storage.getMonthlyMilestones();
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly milestones" });
    }
  });

  app.post("/api/monthly-milestones", async (req, res) => {
    try {
      const milestoneData = insertMonthlyMilestoneSchema.parse(req.body);
      const milestone = await storage.createMonthlyMilestone(milestoneData);
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ message: "Invalid milestone data" });
    }
  });

  app.patch("/api/monthly-milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const milestone = await storage.updateMonthlyMilestone(id, updates);
      if (!milestone) {
        return res.status(404).json({ message: "Monthly milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Failed to update monthly milestone" });
    }
  });

  app.delete("/api/monthly-milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMonthlyMilestone(id);
      if (!success) {
        return res.status(404).json({ message: "Monthly milestone not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete monthly milestone" });
    }
  });

  // Weekly Tasks
  app.get("/api/weekly-tasks", async (req, res) => {
    try {
      const milestoneId = req.query.milestoneId ? parseInt(req.query.milestoneId as string) : undefined;
      const currentWeek = req.query.currentWeek === 'true';
      
      let tasks;
      if (currentWeek) {
        tasks = await storage.getCurrentWeekTasks();
      } else if (milestoneId) {
        tasks = await storage.getTasksByMilestone(milestoneId);
      } else {
        tasks = await storage.getWeeklyTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly tasks" });
    }
  });

  app.post("/api/weekly-tasks", async (req, res) => {
    try {
      const taskData = insertWeeklyTaskSchema.parse(req.body);
      const task = await storage.createWeeklyTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/weekly-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateWeeklyTask(id, updates);
      if (!task) {
        return res.status(404).json({ message: "Weekly task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update weekly task" });
    }
  });

  app.delete("/api/weekly-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWeeklyTask(id);
      if (!success) {
        return res.status(404).json({ message: "Weekly task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete weekly task" });
    }
  });

  // Daily Actions
  app.get("/api/daily-actions", async (req, res) => {
    try {
      const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;
      const today = req.query.today === 'true';
      
      let actions;
      if (today) {
        actions = await storage.getTodayActions();
      } else if (taskId) {
        actions = await storage.getActionsByTask(taskId);
      } else {
        actions = await storage.getDailyActions();
      }
      
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily actions" });
    }
  });

  app.post("/api/daily-actions", async (req, res) => {
    try {
      const actionData = insertDailyActionSchema.parse(req.body);
      const action = await storage.createDailyAction(actionData);
      res.status(201).json(action);
    } catch (error) {
      res.status(400).json({ message: "Invalid action data" });
    }
  });

  app.patch("/api/daily-actions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const action = await storage.updateDailyAction(id, updates);
      if (!action) {
        return res.status(404).json({ message: "Daily action not found" });
      }
      res.json(action);
    } catch (error) {
      res.status(500).json({ message: "Failed to update daily action" });
    }
  });

  app.delete("/api/daily-actions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDailyAction(id);
      if (!success) {
        return res.status(404).json({ message: "Daily action not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete daily action" });
    }
  });

  // Daily Checkins
  app.get("/api/daily-checkins/today", async (req, res) => {
    try {
      const checkin = await storage.getTodayCheckin();
      res.json(checkin);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's checkin" });
    }
  });

  app.post("/api/daily-checkins", async (req, res) => {
    try {
      const checkinData = insertDailyCheckinSchema.parse(req.body);
      const checkin = await storage.createDailyCheckin(checkinData);
      res.status(201).json(checkin);
    } catch (error) {
      res.status(400).json({ message: "Invalid checkin data" });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const quarterlyGoals = await storage.getQuarterlyGoals();
      const monthlyMilestones = await storage.getMonthlyMilestones();
      const weeklyTasks = await storage.getCurrentWeekTasks();
      const dailyActions = await storage.getTodayActions();

      const stats = {
        quarterly: {
          completed: quarterlyGoals.filter(g => g.completed).length,
          total: quarterlyGoals.length,
          percentage: quarterlyGoals.length > 0 
            ? Math.round((quarterlyGoals.filter(g => g.completed).length / quarterlyGoals.length) * 100)
            : 0
        },
        monthly: {
          completed: monthlyMilestones.filter(m => m.completed).length,
          total: monthlyMilestones.length,
          percentage: monthlyMilestones.length > 0 
            ? Math.round((monthlyMilestones.filter(m => m.completed).length / monthlyMilestones.length) * 100)
            : 0
        },
        weekly: {
          completed: weeklyTasks.filter(t => t.completed).length,
          total: weeklyTasks.length,
          percentage: weeklyTasks.length > 0 
            ? Math.round((weeklyTasks.filter(t => t.completed).length / weeklyTasks.length) * 100)
            : 0
        },
        daily: {
          completed: dailyActions.filter(a => a.completed).length,
          total: dailyActions.length,
          percentage: dailyActions.length > 0 
            ? Math.round((dailyActions.filter(a => a.completed).length / dailyActions.length) * 100)
            : 0
        }
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
