
import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, TaskStats } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('daily-tasks', []);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, completedAt: updates.completed ? new Date() : undefined }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const moveTask = (id: string, timeBlock: Task['timeBlock']) => {
    updateTask(id, { timeBlock });
  };

  const stats: TaskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    
    const byPriority = {
      'must-do': {
        total: tasks.filter(t => t.priority === 'must-do').length,
        completed: tasks.filter(t => t.priority === 'must-do' && t.completed).length,
      },
      'should-do': {
        total: tasks.filter(t => t.priority === 'should-do').length,
        completed: tasks.filter(t => t.priority === 'should-do' && t.completed).length,
      },
      'could-do': {
        total: tasks.filter(t => t.priority === 'could-do').length,
        completed: tasks.filter(t => t.priority === 'could-do' && t.completed).length,
      },
    };

    const byTimeBlock = {
      morning: {
        total: tasks.filter(t => t.timeBlock === 'morning').length,
        completed: tasks.filter(t => t.timeBlock === 'morning' && t.completed).length,
      },
      afternoon: {
        total: tasks.filter(t => t.timeBlock === 'afternoon').length,
        completed: tasks.filter(t => t.timeBlock === 'afternoon' && t.completed).length,
      },
      evening: {
        total: tasks.filter(t => t.timeBlock === 'evening').length,
        completed: tasks.filter(t => t.timeBlock === 'evening' && t.completed).length,
      },
    };

    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      byPriority,
      byTimeBlock,
    };
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    stats,
  };
}
