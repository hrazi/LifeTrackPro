import {
  QuarterlyGoal,
  InsertQuarterlyGoal,
  MonthlyMilestone,
  InsertMonthlyMilestone,
  WeeklyTask,
  InsertWeeklyTask,
  DailyAction,
  InsertDailyAction,
  DailyCheckin,
  InsertDailyCheckin,
  QuarterlyGoalWithMilestones,
  MonthlyMilestoneWithTasks,
  WeeklyTaskWithActions,
  quarterlyGoals,
  monthlyMilestones,
  weeklyTasks,
  dailyActions,
  dailyCheckins,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Quarterly Goals
  getQuarterlyGoals(): Promise<QuarterlyGoal[]>;
  getQuarterlyGoal(id: number): Promise<QuarterlyGoal | undefined>;
  getQuarterlyGoalWithMilestones(id: number): Promise<QuarterlyGoalWithMilestones | undefined>;
  createQuarterlyGoal(goal: InsertQuarterlyGoal): Promise<QuarterlyGoal>;
  updateQuarterlyGoal(id: number, updates: Partial<QuarterlyGoal>): Promise<QuarterlyGoal | undefined>;
  deleteQuarterlyGoal(id: number): Promise<boolean>;

  // Monthly Milestones
  getMonthlyMilestones(): Promise<MonthlyMilestone[]>;
  getMilestonesByGoal(goalId: number): Promise<MonthlyMilestone[]>;
  getMonthlyMilestone(id: number): Promise<MonthlyMilestone | undefined>;
  getMonthlyMilestoneWithTasks(id: number): Promise<MonthlyMilestoneWithTasks | undefined>;
  createMonthlyMilestone(milestone: InsertMonthlyMilestone): Promise<MonthlyMilestone>;
  updateMonthlyMilestone(id: number, updates: Partial<MonthlyMilestone>): Promise<MonthlyMilestone | undefined>;
  deleteMonthlyMilestone(id: number): Promise<boolean>;

  // Weekly Tasks
  getWeeklyTasks(): Promise<WeeklyTask[]>;
  getTasksByMilestone(milestoneId: number): Promise<WeeklyTask[]>;
  getCurrentWeekTasks(): Promise<WeeklyTask[]>;
  getWeeklyTask(id: number): Promise<WeeklyTask | undefined>;
  getWeeklyTaskWithActions(id: number): Promise<WeeklyTaskWithActions | undefined>;
  createWeeklyTask(task: InsertWeeklyTask): Promise<WeeklyTask>;
  updateWeeklyTask(id: number, updates: Partial<WeeklyTask>): Promise<WeeklyTask | undefined>;
  deleteWeeklyTask(id: number): Promise<boolean>;

  // Daily Actions
  getDailyActions(): Promise<DailyAction[]>;
  getActionsByTask(taskId: number): Promise<DailyAction[]>;
  getTodayActions(): Promise<DailyAction[]>;
  getDailyAction(id: number): Promise<DailyAction | undefined>;
  createDailyAction(action: InsertDailyAction): Promise<DailyAction>;
  updateDailyAction(id: number, updates: Partial<DailyAction>): Promise<DailyAction | undefined>;
  deleteDailyAction(id: number): Promise<boolean>;

  // Daily Checkins
  getDailyCheckins(): Promise<DailyCheckin[]>;
  getTodayCheckin(): Promise<DailyCheckin | undefined>;
  createDailyCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin>;
}

export class DatabaseStorage implements IStorage {

  // Quarterly Goals
  async getQuarterlyGoals(): Promise<QuarterlyGoal[]> {
    return await db.select().from(quarterlyGoals);
  }

  async getQuarterlyGoal(id: number): Promise<QuarterlyGoal | undefined> {
    const [goal] = await db.select().from(quarterlyGoals).where(eq(quarterlyGoals.id, id));
    return goal || undefined;
  }

  async getQuarterlyGoalWithMilestones(id: number): Promise<QuarterlyGoalWithMilestones | undefined> {
    const [goal] = await db.select().from(quarterlyGoals).where(eq(quarterlyGoals.id, id));
    if (!goal) return undefined;

    const milestones = await db.select().from(monthlyMilestones)
      .where(eq(monthlyMilestones.quarterlyGoalId, id));

    return { ...goal, milestones };
  }

  async createQuarterlyGoal(insertGoal: InsertQuarterlyGoal): Promise<QuarterlyGoal> {
    const [goal] = await db
      .insert(quarterlyGoals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateQuarterlyGoal(id: number, updates: Partial<QuarterlyGoal>): Promise<QuarterlyGoal | undefined> {
    const [goal] = await db
      .update(quarterlyGoals)
      .set(updates)
      .where(eq(quarterlyGoals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteQuarterlyGoal(id: number): Promise<boolean> {
    const result = await db.delete(quarterlyGoals).where(eq(quarterlyGoals.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Monthly Milestones
  async getMonthlyMilestones(): Promise<MonthlyMilestone[]> {
    return await db.select().from(monthlyMilestones);
  }

  async getMilestonesByGoal(goalId: number): Promise<MonthlyMilestone[]> {
    return await db.select().from(monthlyMilestones)
      .where(eq(monthlyMilestones.quarterlyGoalId, goalId));
  }

  async getMonthlyMilestone(id: number): Promise<MonthlyMilestone | undefined> {
    const [milestone] = await db.select().from(monthlyMilestones).where(eq(monthlyMilestones.id, id));
    return milestone || undefined;
  }

  async getMonthlyMilestoneWithTasks(id: number): Promise<MonthlyMilestoneWithTasks | undefined> {
    const [milestone] = await db.select().from(monthlyMilestones).where(eq(monthlyMilestones.id, id));
    if (!milestone) return undefined;

    const tasks = await db.select().from(weeklyTasks)
      .where(eq(weeklyTasks.monthlyMilestoneId, id));
    
    const [quarterlyGoal] = await db.select().from(quarterlyGoals)
      .where(eq(quarterlyGoals.id, milestone.quarterlyGoalId));
    if (!quarterlyGoal) return undefined;

    return { ...milestone, tasks, quarterlyGoal };
  }

  async createMonthlyMilestone(insertMilestone: InsertMonthlyMilestone): Promise<MonthlyMilestone> {
    const [milestone] = await db
      .insert(monthlyMilestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }

  async updateMonthlyMilestone(id: number, updates: Partial<MonthlyMilestone>): Promise<MonthlyMilestone | undefined> {
    const [milestone] = await db
      .update(monthlyMilestones)
      .set(updates)
      .where(eq(monthlyMilestones.id, id))
      .returning();
    return milestone || undefined;
  }

  async deleteMonthlyMilestone(id: number): Promise<boolean> {
    const result = await db.delete(monthlyMilestones).where(eq(monthlyMilestones.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Weekly Tasks
  async getWeeklyTasks(): Promise<WeeklyTask[]> {
    return await db.select().from(weeklyTasks);
  }

  async getTasksByMilestone(milestoneId: number): Promise<WeeklyTask[]> {
    return await db.select().from(weeklyTasks)
      .where(eq(weeklyTasks.monthlyMilestoneId, milestoneId));
  }

  async getCurrentWeekTasks(): Promise<WeeklyTask[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return await db.select().from(weeklyTasks)
      .where(and(
        gte(weeklyTasks.weekStart, startOfWeek),
        lte(weeklyTasks.weekStart, endOfWeek)
      ));
  }

  async getWeeklyTask(id: number): Promise<WeeklyTask | undefined> {
    const [task] = await db.select().from(weeklyTasks).where(eq(weeklyTasks.id, id));
    return task || undefined;
  }

  async getWeeklyTaskWithActions(id: number): Promise<WeeklyTaskWithActions | undefined> {
    const [task] = await db.select().from(weeklyTasks).where(eq(weeklyTasks.id, id));
    if (!task) return undefined;

    const actions = await db.select().from(dailyActions)
      .where(eq(dailyActions.weeklyTaskId, id));
    
    const [milestone] = await db.select().from(monthlyMilestones)
      .where(eq(monthlyMilestones.id, task.monthlyMilestoneId));
    if (!milestone) return undefined;

    return { ...task, actions, milestone };
  }

  async createWeeklyTask(insertTask: InsertWeeklyTask): Promise<WeeklyTask> {
    const [task] = await db
      .insert(weeklyTasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateWeeklyTask(id: number, updates: Partial<WeeklyTask>): Promise<WeeklyTask | undefined> {
    const [task] = await db
      .update(weeklyTasks)
      .set(updates)
      .where(eq(weeklyTasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteWeeklyTask(id: number): Promise<boolean> {
    const result = await db.delete(weeklyTasks).where(eq(weeklyTasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Daily Actions
  async getDailyActions(): Promise<DailyAction[]> {
    return await db.select().from(dailyActions);
  }

  async getActionsByTask(taskId: number): Promise<DailyAction[]> {
    return await db.select().from(dailyActions)
      .where(eq(dailyActions.weeklyTaskId, taskId));
  }

  async getTodayActions(): Promise<DailyAction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return await db.select().from(dailyActions)
      .where(and(
        gte(dailyActions.date, today),
        lte(dailyActions.date, tomorrow)
      ));
  }

  async getDailyAction(id: number): Promise<DailyAction | undefined> {
    const [action] = await db.select().from(dailyActions).where(eq(dailyActions.id, id));
    return action || undefined;
  }

  async createDailyAction(insertAction: InsertDailyAction): Promise<DailyAction> {
    const [action] = await db
      .insert(dailyActions)
      .values(insertAction)
      .returning();
    return action;
  }

  async updateDailyAction(id: number, updates: Partial<DailyAction>): Promise<DailyAction | undefined> {
    const [action] = await db
      .update(dailyActions)
      .set(updates)
      .where(eq(dailyActions.id, id))
      .returning();
    return action || undefined;
  }

  async deleteDailyAction(id: number): Promise<boolean> {
    const result = await db.delete(dailyActions).where(eq(dailyActions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Daily Checkins
  async getDailyCheckins(): Promise<DailyCheckin[]> {
    return await db.select().from(dailyCheckins);
  }

  async getTodayCheckin(): Promise<DailyCheckin | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [checkin] = await db.select().from(dailyCheckins)
      .where(and(
        gte(dailyCheckins.date, today),
        lte(dailyCheckins.date, tomorrow)
      ));
    return checkin || undefined;
  }

  async createDailyCheckin(insertCheckin: InsertDailyCheckin): Promise<DailyCheckin> {
    const [checkin] = await db
      .insert(dailyCheckins)
      .values(insertCheckin)
      .returning();
    return checkin;
  }
}

export const storage = new DatabaseStorage();
