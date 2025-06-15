
import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, TaskStats } from '../types/task';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export function useAchievements(tasks: Task[], stats: TaskStats) {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<string[]>('achievements', []);

  const achievements = useMemo(() => {
    const completedTasksToday = tasks.filter(t => 
      t.completed && 
      new Date(t.completedAt || t.createdAt).toDateString() === new Date().toDateString()
    ).length;

    const streak = calculateStreak(tasks);
    const totalCompleted = stats.completed;

    const achievementList: Achievement[] = [
      {
        id: 'first-task',
        title: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        unlocked: totalCompleted >= 1,
        progress: Math.min(totalCompleted, 1),
        maxProgress: 1
      },
      {
        id: 'daily-warrior',
        title: 'Daily Warrior',
        description: 'Complete 5 tasks in one day',
        icon: '⚡',
        unlocked: completedTasksToday >= 5,
        progress: Math.min(completedTasksToday, 5),
        maxProgress: 5
      },
      {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Maintain a 7-day completion streak',
        icon: '🔥',
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7
      },
      {
        id: 'priority-pro',
        title: 'Priority Pro',
        description: 'Complete 10 must-do tasks',
        icon: '🏆',
        unlocked: stats.byPriority['must-do'].completed >= 10,
        progress: Math.min(stats.byPriority['must-do'].completed, 10),
        maxProgress: 10
      },
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Complete 20 morning tasks',
        icon: '🌅',
        unlocked: stats.byTimeBlock.morning.completed >= 20,
        progress: Math.min(stats.byTimeBlock.morning.completed, 20),
        maxProgress: 20
      },
      {
        id: 'century',
        title: 'Century Club',
        description: 'Complete 100 tasks total',
        icon: '💯',
        unlocked: totalCompleted >= 100,
        progress: Math.min(totalCompleted, 100),
        maxProgress: 100
      }
    ];

    return achievementList.map(achievement => ({
      ...achievement,
      unlockedAt: unlockedAchievements.includes(achievement.id) ? new Date() : undefined
    }));
  }, [tasks, stats, unlockedAchievements]);

  const newAchievements = achievements.filter(a => 
    a.unlocked && !unlockedAchievements.includes(a.id)
  );

  // Update unlocked achievements
  if (newAchievements.length > 0) {
    const newIds = newAchievements.map(a => a.id);
    setUnlockedAchievements(prev => [...prev, ...newIds]);
  }

  return {
    achievements,
    newAchievements,
    unlockedCount: achievements.filter(a => a.unlocked).length,
    totalCount: achievements.length
  };
}

function calculateStreak(tasks: Task[]): number {
  const completedTasks = tasks
    .filter(t => t.completed && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) { // Check last 30 days
    const dayTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.completedAt!);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === currentDate.getTime();
    });

    if (dayTasks.length > 0) {
      streak++;
    } else if (streak > 0) {
      break; // Streak broken
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}
