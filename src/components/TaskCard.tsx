
import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/task';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Trash2, Edit } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  'must-do': 'bg-red-100 text-red-800 border-red-200',
  'should-do': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'could-do': 'bg-green-100 text-green-800 border-green-200',
};

const priorityLabels = {
  'must-do': 'Must Do',
  'should-do': 'Should Do',
  'could-do': 'Could Do',
};

export function TaskCard({ task, onUpdate, onDelete, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCheckboxChange = (checked: boolean) => {
    console.log('Checkbox changed:', task.id, checked);
    onUpdate(task.id, { completed: checked });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit button clicked:', task.id);
    onEdit(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked:', task.id);
    onDelete(task.id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-sm border p-4 ${
        isDragging ? 'shadow-lg z-10' : ''
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      {/* Drag handle area */}
      <div 
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start gap-3">
          {/* Checkbox - prevent drag when interacting */}
          <div 
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleCheckboxChange}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
            </div>
            
            <h3 className={`font-medium text-gray-900 mb-1 ${
              task.completed ? 'line-through' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm text-gray-600 mb-2 ${
                task.completed ? 'line-through' : ''
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Created {new Date(task.createdAt).toLocaleDateString()}
              </span>
              
              {/* Action buttons - prevent drag when interacting */}
              <div 
                className="flex gap-1"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
