
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface SubTask {
  id: number;
  text: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  estimatedTime: number; // in minutes
  actualTime: number; // in seconds
  status: 'todo' | 'done';
  subTasks?: SubTask[];
}

export interface Session {
  id: number;
  taskId: number;
  taskTitle: string;
  durationSeconds: number;
  completedAt: Date;
}

export interface DailySummary {
  id: number;
  date: Date;
  completedTasks: Task[];
  totalProductiveTimeSeconds: number;
  energyLevel: number;
  satisfactionLevel: number;
  blockerNote: string;
}

export type View = 'today' | 'analysis' | 'history' | 'settings';