
import { useMemo, useState } from 'react';
import { Task } from '../types/task';

export interface TaskFilters {
  search: string;
  priority: Task['priority'] | 'all';
  timeBlock: Task['timeBlock'] | 'all';
  completed: 'all' | 'completed' | 'pending';
}

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    priority: 'all',
    timeBlock: 'all',
    completed: 'all',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Time block filter
      if (filters.timeBlock !== 'all' && task.timeBlock !== filters.timeBlock) {
        return false;
      }

      // Completion status filter
      if (filters.completed === 'completed' && !task.completed) {
        return false;
      }
      if (filters.completed === 'pending' && task.completed) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return {
    filters,
    setFilters,
    filteredTasks,
    hasActiveFilters: filters.search !== '' || 
                    filters.priority !== 'all' || 
                    filters.timeBlock !== 'all' || 
                    filters.completed !== 'all'
  };
}
