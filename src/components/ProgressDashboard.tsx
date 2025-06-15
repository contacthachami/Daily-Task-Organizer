
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TaskStats } from '../types/task';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface ProgressDashboardProps {
  stats: TaskStats;
}

const PRIORITY_COLORS = {
  'must-do': '#EF4444',
  'should-do': '#F59E0B',
  'could-do': '#10B981',
};

const TIME_BLOCK_COLORS = {
  morning: '#3B82F6',
  afternoon: '#F97316',
  evening: '#8B5CF6',
};

export function ProgressDashboard({ stats }: ProgressDashboardProps) {
  const priorityData = Object.entries(stats.byPriority).map(([priority, data]) => ({
    name: priority.replace('-', ' ').toUpperCase(),
    completed: data.completed,
    total: data.total,
    remaining: data.total - data.completed,
    fill: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
  }));

  const timeBlockData = Object.entries(stats.byTimeBlock).map(([timeBlock, data]) => ({
    name: timeBlock.charAt(0).toUpperCase() + timeBlock.slice(1),
    completed: data.completed,
    total: data.total,
    completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    fill: TIME_BLOCK_COLORS[timeBlock as keyof typeof TIME_BLOCK_COLORS],
  }));

  const overallCompletionData = [
    { name: 'Completed', value: stats.completed, fill: '#10B981' },
    { name: 'Remaining', value: stats.total - stats.completed, fill: '#E5E7EB' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(stats.completionRate)}%
            </div>
            <div className="text-sm text-gray-600">
              {stats.completed} of {stats.total} tasks completed
            </div>
          </div>
          
          <Progress value={stats.completionRate} className="mb-4" />
          
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {overallCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">By Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorityData.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.completed}/{item.total}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="h-32 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" />
                <Bar dataKey="remaining" fill="#E5E7EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Time Block Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">By Time Block</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeBlockData.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {item.completed}/{item.total}
                  </span>
                </div>
                <Progress 
                  value={item.completionRate}
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
