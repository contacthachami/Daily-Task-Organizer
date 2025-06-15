
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'must-do' | 'should-do' | 'could-do';
  timeBlock: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskStats {
  total: number;
  completed: number;
  completionRate: number;
  byPriority: {
    'must-do': { total: number; completed: number };
    'should-do': { total: number; completed: number };
    'could-do': { total: number; completed: number };
  };
  byTimeBlock: {
    morning: { total: number; completed: number };
    afternoon: { total: number; completed: number };
    evening: { total: number; completed: number };
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface TaskFilters {
  search: string;
  priority: Task['priority'] | 'all';
  timeBlock: Task['timeBlock'] | 'all';
  completed: 'all' | 'completed' | 'pending';
}
