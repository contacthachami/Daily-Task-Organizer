
import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, TaskStats, Achievement } from '../types/task';

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first-task',
    title: 'Getting Started',
    description: 'Create your first task',
    icon: '🎯',
    maxProgress: 1
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '🏆',
    maxProgress: 10
  },
  {
    id: 'morning-person',
    title: 'Morning Person',
    description: 'Complete 5 morning tasks',
    icon: '🌅',
    maxProgress: 5
  },
  {
    id: 'streak-keeper',
    title: 'Streak Keeper',
    description: 'Complete tasks for 3 days in a row',
    icon: '🔥',
    maxProgress: 3
  }
];

export function useAchievements(tasks: Task[], stats: TaskStats) {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<string[]>('unlocked-achievements', []);

  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      const isUnlocked = unlockedAchievements.includes(achievement.id);

      switch (achievement.id) {
        case 'first-task':
          progress = Math.min(tasks.length, 1);
          break;
        case 'task-master':
          progress = Math.min(stats.completed, 10);
          break;
        case 'morning-person':
          progress = Math.min(stats.byTimeBlock.morning.completed, 5);
          break;
        case 'streak-keeper':
          // Simplified streak calculation
          progress = Math.min(Math.floor(stats.completed / 3), 3);
          break;
      }

      return {
        ...achievement,
        progress,
        unlockedAt: isUnlocked ? new Date() : undefined
      };
    });
  }, [tasks, stats, unlockedAchievements]);

  const newAchievements = useMemo(() => {
    const newlyUnlocked = achievements.filter(achievement => 
      achievement.progress >= achievement.maxProgress && 
      !unlockedAchievements.includes(achievement.id)
    );

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(a => a.id);
      setUnlockedAchievements(prev => [...prev, ...newIds]);
    }

    return newlyUnlocked;
  }, [achievements, unlockedAchievements, setUnlockedAchievements]);

  return {
    achievements,
    newAchievements
  };
}
