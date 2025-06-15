
import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { FocusSettings } from '../hooks/useFocusMode';

interface TimeBlockColumnProps {
  timeBlock: Task['timeBlock'];
  title: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  focusSettings?: FocusSettings;
}

const timeBlockColors = {
  morning: 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50',
  afternoon: 'border-blue-300 bg-gradient-to-br from-blue-50 to-sky-50',
  evening: 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50',
};

const timeBlockHoverColors = {
  morning: 'border-amber-400 shadow-amber-200',
  afternoon: 'border-blue-400 shadow-blue-200',
  evening: 'border-purple-400 shadow-purple-200',
};

const timeBlockIcons = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙',
};

export function TimeBlockColumn({ 
  timeBlock, 
  title, 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  onEditTask,
  focusSettings 
}: TimeBlockColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: timeBlock,
  });

  console.log(`TimeBlockColumn ${timeBlock} - Tasks:`, tasks.length, 'Focus settings:', focusSettings);

  // The tasks are already filtered in the parent component (Index.tsx)
  // So we just use them directly here
  const displayedTasks = tasks;

  const shouldDimColumn = focusSettings?.enabled && focusSettings.dimNonFocus && 
    focusSettings.focusPriority && 
    !displayedTasks.some(t => t.priority === focusSettings.focusPriority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex-1 min-w-0 rounded-xl border-2 border-dashed p-6 transition-all duration-300 ${
        timeBlockColors[timeBlock]
      } ${isOver ? `border-solid shadow-lg ${timeBlockHoverColors[timeBlock]}` : ''} ${
        shouldDimColumn ? 'opacity-40' : ''
      }`}
      ref={setNodeRef}
    >
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-3xl drop-shadow-sm">{timeBlockIcons[timeBlock]}</span>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
              {displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'}
            </span>
            <span className="text-xs text-gray-500">
              {displayedTasks.filter(t => t.completed).length} completed
            </span>
          </div>
        </div>
      </motion.div>
      
      <SortableContext items={displayedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {displayedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={focusSettings?.enabled && focusSettings.dimNonFocus && 
                focusSettings.focusPriority && 
                task.priority !== focusSettings.focusPriority ? 'opacity-50' : ''}
            >
              <TaskCard
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            </motion.div>
          ))}
          
          {displayedTasks.length === 0 && (
            <motion.div 
              className="text-center py-12 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                <p className="text-sm font-medium mb-2">
                  {focusSettings?.enabled ? 'No tasks match focus criteria' : 'No tasks scheduled'}
                </p>
                <p className="text-xs">
                  {focusSettings?.enabled ? 'Adjust focus settings or add new tasks' : 'Drag tasks here or add new ones'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
}
