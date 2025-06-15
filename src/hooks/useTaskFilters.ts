
import { useMemo, useState } from 'react';
import { Task, TaskFilters } from '../types/task';

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    priority: 'all',
    timeBlock: 'all',
    completed: 'all'
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Time block filter
      if (filters.timeBlock !== 'all' && task.timeBlock !== filters.timeBlock) {
        return false;
      }

      // Completed filter
      if (filters.completed === 'completed' && !task.completed) {
        return false;
      }
      if (filters.completed === 'pending' && task.completed) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const hasActiveFilters = filters.search !== '' || 
                          filters.priority !== 'all' || 
                          filters.timeBlock !== 'all' || 
                          filters.completed !== 'all';

  return {
    filters,
    setFilters,
    filteredTasks,
    hasActiveFilters
  };
}
