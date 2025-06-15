
import React from 'react';
import { motion } from 'framer-motion';
import { TaskStats } from '../types/task';
import { Achievement } from '../hooks/useAchievements';
import { TrendingUp, Target, Clock, Award, Trophy } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface ProgressDashboardProps {
  stats: TaskStats;
  achievements?: Achievement[];
}

export function ProgressDashboard({ stats, achievements = [] }: ProgressDashboardProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentAchievements = unlockedAchievements.slice(-3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-glass p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 font-display">Progress Dashboard</h2>
          <p className="text-sm text-gray-600">Track your productivity and achievements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.completionRate.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-600 mb-3">Overall Completion</p>
            <Progress value={stats.completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-green-700">Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{stats.total - stats.completed}</div>
              <div className="text-xs text-orange-700">Remaining</div>
            </div>
          </div>
        </div>

        {/* Time Block Progress */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Blocks
          </h3>
          
          {Object.entries(stats.byTimeBlock).map(([block, data]) => {
            const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
            const icons = { morning: '🌅', afternoon: '☀️', evening: '🌙' };
            
            return (
              <div key={block} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize flex items-center gap-2">
                    <span>{icons[block as keyof typeof icons]}</span>
                    {block}
                  </span>
                  <span className="text-xs text-gray-600">
                    {data.completed}/{data.total}
                  </span>
                </div>
                <Progress value={rate} className="h-1.5" />
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Recent Achievements
          </h3>
          
          {recentAchievements.length > 0 ? (
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <span className="text-lg">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {achievement.description}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center pt-2">
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {unlockedAchievements.length} / {achievements.length} Unlocked
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Complete tasks to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
