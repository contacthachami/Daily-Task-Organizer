
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { Progress } from './ui/progress';
import { TaskStats, Achievement } from '../types/task';

interface ProgressDashboardProps {
  stats: TaskStats;
  achievements: Achievement[];
}

export function ProgressDashboard({ stats, achievements }: ProgressDashboardProps) {
  const recentAchievements = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-glass p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Progress Dashboard</h3>
          <p className="text-sm text-gray-600">Track your productivity metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats.completionRate.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
          <Progress value={stats.completionRate} className="mt-2 h-2" />
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
          <div className="text-xs text-gray-500 mt-1">
            out of {stats.total} total
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {recentAchievements.length}
          </div>
          <div className="text-sm text-gray-600">Recent Achievements</div>
          <div className="flex justify-center mt-2">
            {recentAchievements.slice(0, 3).map((achievement, index) => (
              <span key={achievement.id} className="text-lg mr-1">
                {achievement.icon}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            {stats.byTimeBlock.morning.completed}/{stats.byTimeBlock.morning.total}
          </div>
          <div className="text-xs text-gray-600">Morning</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            {stats.byTimeBlock.afternoon.completed}/{stats.byTimeBlock.afternoon.total}
          </div>
          <div className="text-xs text-gray-600">Afternoon</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            {stats.byTimeBlock.evening.completed}/{stats.byTimeBlock.evening.total}
          </div>
          <div className="text-xs text-gray-600">Evening</div>
        </div>
      </div>
    </motion.div>
  );
}
