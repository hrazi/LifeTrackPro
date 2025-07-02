import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quarterlyGoals = pgTable("quarterly_goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  quarter: text("quarter").notNull(), // e.g., "Q4 2024"
  year: integer("year").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyMilestones = pgTable("monthly_milestones", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  quarterlyGoalId: integer("quarterly_goal_id").notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyTasks = pgTable("weekly_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  monthlyMilestoneId: integer("monthly_milestone_id").notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyActions = pgTable("daily_actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  weeklyTaskId: integer("weekly_task_id").notNull(),
  date: timestamp("date").notNull(),
  time: text("time"), // e.g., "9:00 AM"
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  rating: integer("rating").notNull(), // 1-10
  wins: text("wins"),
  priorities: text("priorities"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertQuarterlyGoalSchema = createInsertSchema(quarterlyGoals).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlyMilestoneSchema = createInsertSchema(monthlyMilestones).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyTaskSchema = createInsertSchema(weeklyTasks).omit({
  id: true,
  createdAt: true,
});

export const insertDailyActionSchema = createInsertSchema(dailyActions).omit({
  id: true,
  createdAt: true,
});

export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({
  id: true,
  createdAt: true,
});

// Types
export type QuarterlyGoal = typeof quarterlyGoals.$inferSelect;
export type InsertQuarterlyGoal = z.infer<typeof insertQuarterlyGoalSchema>;

export type MonthlyMilestone = typeof monthlyMilestones.$inferSelect;
export type InsertMonthlyMilestone = z.infer<typeof insertMonthlyMilestoneSchema>;

export type WeeklyTask = typeof weeklyTasks.$inferSelect;
export type InsertWeeklyTask = z.infer<typeof insertWeeklyTaskSchema>;

export type DailyAction = typeof dailyActions.$inferSelect;
export type InsertDailyAction = z.infer<typeof insertDailyActionSchema>;

export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;

// Extended types with relationships
export type QuarterlyGoalWithMilestones = QuarterlyGoal & {
  milestones: MonthlyMilestone[];
};

export type MonthlyMilestoneWithTasks = MonthlyMilestone & {
  tasks: WeeklyTask[];
  quarterlyGoal: QuarterlyGoal;
};

export type WeeklyTaskWithActions = WeeklyTask & {
  actions: DailyAction[];
  milestone: MonthlyMilestone;
};

export type DailyActionWithTask = DailyAction & {
  task: WeeklyTask;
};
