
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Habit {
  id: string;
  text: string;
  completed: boolean;
  streak: number;
}

export interface JournalEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  content: string;
  mood: string;
  aiReflection?: string;
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  journals: Record<string, JournalEntry>;
  history: Record<string, number>; // date -> completion percentage
  dailyPriority?: {
    text: string;
    completed: boolean;
  };
}

export type Tab = 'dashboard' | 'habits' | 'tasks' | 'journal' | 'system';
