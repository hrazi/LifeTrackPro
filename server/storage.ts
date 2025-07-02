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
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private quarterlyGoals: Map<number, QuarterlyGoal>;
  private monthlyMilestones: Map<number, MonthlyMilestone>;
  private weeklyTasks: Map<number, WeeklyTask>;
  private dailyActions: Map<number, DailyAction>;
  private dailyCheckins: Map<number, DailyCheckin>;
  
  private currentGoalId: number = 1;
  private currentMilestoneId: number = 1;
  private currentTaskId: number = 1;
  private currentActionId: number = 1;
  private currentCheckinId: number = 1;

  constructor() {
    this.quarterlyGoals = new Map();
    this.monthlyMilestones = new Map();
    this.weeklyTasks = new Map();
    this.dailyActions = new Map();
    this.dailyCheckins = new Map();
  }

  // Quarterly Goals
  async getQuarterlyGoals(): Promise<QuarterlyGoal[]> {
    return Array.from(this.quarterlyGoals.values());
  }

  async getQuarterlyGoal(id: number): Promise<QuarterlyGoal | undefined> {
    return this.quarterlyGoals.get(id);
  }

  async getQuarterlyGoalWithMilestones(id: number): Promise<QuarterlyGoalWithMilestones | undefined> {
    const goal = this.quarterlyGoals.get(id);
    if (!goal) return undefined;

    const milestones = Array.from(this.monthlyMilestones.values())
      .filter(m => m.quarterlyGoalId === id);

    return { ...goal, milestones };
  }

  async createQuarterlyGoal(insertGoal: InsertQuarterlyGoal): Promise<QuarterlyGoal> {
    const goal: QuarterlyGoal = {
      ...insertGoal,
      id: this.currentGoalId++,
      createdAt: new Date(),
    };
    this.quarterlyGoals.set(goal.id, goal);
    return goal;
  }

  async updateQuarterlyGoal(id: number, updates: Partial<QuarterlyGoal>): Promise<QuarterlyGoal | undefined> {
    const goal = this.quarterlyGoals.get(id);
    if (!goal) return undefined;

    const updatedGoal = { ...goal, ...updates };
    this.quarterlyGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteQuarterlyGoal(id: number): Promise<boolean> {
    return this.quarterlyGoals.delete(id);
  }

  // Monthly Milestones
  async getMonthlyMilestones(): Promise<MonthlyMilestone[]> {
    return Array.from(this.monthlyMilestones.values());
  }

  async getMilestonesByGoal(goalId: number): Promise<MonthlyMilestone[]> {
    return Array.from(this.monthlyMilestones.values())
      .filter(m => m.quarterlyGoalId === goalId);
  }

  async getMonthlyMilestone(id: number): Promise<MonthlyMilestone | undefined> {
    return this.monthlyMilestones.get(id);
  }

  async getMonthlyMilestoneWithTasks(id: number): Promise<MonthlyMilestoneWithTasks | undefined> {
    const milestone = this.monthlyMilestones.get(id);
    if (!milestone) return undefined;

    const tasks = Array.from(this.weeklyTasks.values())
      .filter(t => t.monthlyMilestoneId === id);
    
    const quarterlyGoal = this.quarterlyGoals.get(milestone.quarterlyGoalId);
    if (!quarterlyGoal) return undefined;

    return { ...milestone, tasks, quarterlyGoal };
  }

  async createMonthlyMilestone(insertMilestone: InsertMonthlyMilestone): Promise<MonthlyMilestone> {
    const milestone: MonthlyMilestone = {
      ...insertMilestone,
      id: this.currentMilestoneId++,
      createdAt: new Date(),
    };
    this.monthlyMilestones.set(milestone.id, milestone);
    return milestone;
  }

  async updateMonthlyMilestone(id: number, updates: Partial<MonthlyMilestone>): Promise<MonthlyMilestone | undefined> {
    const milestone = this.monthlyMilestones.get(id);
    if (!milestone) return undefined;

    const updatedMilestone = { ...milestone, ...updates };
    this.monthlyMilestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMonthlyMilestone(id: number): Promise<boolean> {
    return this.monthlyMilestones.delete(id);
  }

  // Weekly Tasks
  async getWeeklyTasks(): Promise<WeeklyTask[]> {
    return Array.from(this.weeklyTasks.values());
  }

  async getTasksByMilestone(milestoneId: number): Promise<WeeklyTask[]> {
    return Array.from(this.weeklyTasks.values())
      .filter(t => t.monthlyMilestoneId === milestoneId);
  }

  async getCurrentWeekTasks(): Promise<WeeklyTask[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return Array.from(this.weeklyTasks.values()).filter(task => {
      const weekStart = new Date(task.weekStart);
      return weekStart >= startOfWeek && weekStart <= endOfWeek;
    });
  }

  async getWeeklyTask(id: number): Promise<WeeklyTask | undefined> {
    return this.weeklyTasks.get(id);
  }

  async getWeeklyTaskWithActions(id: number): Promise<WeeklyTaskWithActions | undefined> {
    const task = this.weeklyTasks.get(id);
    if (!task) return undefined;

    const actions = Array.from(this.dailyActions.values())
      .filter(a => a.weeklyTaskId === id);
    
    const milestone = this.monthlyMilestones.get(task.monthlyMilestoneId);
    if (!milestone) return undefined;

    return { ...task, actions, milestone };
  }

  async createWeeklyTask(insertTask: InsertWeeklyTask): Promise<WeeklyTask> {
    const task: WeeklyTask = {
      ...insertTask,
      id: this.currentTaskId++,
      createdAt: new Date(),
    };
    this.weeklyTasks.set(task.id, task);
    return task;
  }

  async updateWeeklyTask(id: number, updates: Partial<WeeklyTask>): Promise<WeeklyTask | undefined> {
    const task = this.weeklyTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.weeklyTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteWeeklyTask(id: number): Promise<boolean> {
    return this.weeklyTasks.delete(id);
  }

  // Daily Actions
  async getDailyActions(): Promise<DailyAction[]> {
    return Array.from(this.dailyActions.values());
  }

  async getActionsByTask(taskId: number): Promise<DailyAction[]> {
    return Array.from(this.dailyActions.values())
      .filter(a => a.weeklyTaskId === taskId);
  }

  async getTodayActions(): Promise<DailyAction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return Array.from(this.dailyActions.values()).filter(action => {
      const actionDate = new Date(action.date);
      actionDate.setHours(0, 0, 0, 0);
      return actionDate.getTime() === today.getTime();
    });
  }

  async getDailyAction(id: number): Promise<DailyAction | undefined> {
    return this.dailyActions.get(id);
  }

  async createDailyAction(insertAction: InsertDailyAction): Promise<DailyAction> {
    const action: DailyAction = {
      ...insertAction,
      id: this.currentActionId++,
      createdAt: new Date(),
    };
    this.dailyActions.set(action.id, action);
    return action;
  }

  async updateDailyAction(id: number, updates: Partial<DailyAction>): Promise<DailyAction | undefined> {
    const action = this.dailyActions.get(id);
    if (!action) return undefined;

    const updatedAction = { ...action, ...updates };
    this.dailyActions.set(id, updatedAction);
    return updatedAction;
  }

  async deleteDailyAction(id: number): Promise<boolean> {
    return this.dailyActions.delete(id);
  }

  // Daily Checkins
  async getDailyCheckins(): Promise<DailyCheckin[]> {
    return Array.from(this.dailyCheckins.values());
  }

  async getTodayCheckin(): Promise<DailyCheckin | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return Array.from(this.dailyCheckins.values()).find(checkin => {
      const checkinDate = new Date(checkin.date);
      checkinDate.setHours(0, 0, 0, 0);
      return checkinDate.getTime() === today.getTime();
    });
  }

  async createDailyCheckin(insertCheckin: InsertDailyCheckin): Promise<DailyCheckin> {
    const checkin: DailyCheckin = {
      ...insertCheckin,
      id: this.currentCheckinId++,
      createdAt: new Date(),
    };
    this.dailyCheckins.set(checkin.id, checkin);
    return checkin;
  }
}

export const storage = new MemStorage();
