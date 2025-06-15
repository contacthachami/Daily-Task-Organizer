
import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TimeBlockColumnProps {
  timeBlock: Task['timeBlock'];
  title: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const timeBlockColors = {
  morning: 'border-blue-200 bg-blue-50',
  afternoon: 'border-orange-200 bg-orange-50',
  evening: 'border-purple-200 bg-purple-50',
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
  onEditTask 
}: TimeBlockColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: timeBlock,
  });

  return (
    <motion.div
      layout
      className={`flex-1 min-w-0 rounded-lg border-2 border-dashed p-4 transition-colors ${
        timeBlockColors[timeBlock]
      } ${isOver ? 'border-solid shadow-md' : ''}`}
      ref={setNodeRef}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{timeBlockIcons[timeBlock]}</span>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No tasks scheduled</p>
              <p className="text-xs mt-1">Drag tasks here or add new ones</p>
            </div>
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
}
