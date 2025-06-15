
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TimeBlockColumn } from '../components/TimeBlockColumn';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Circle } from 'lucide-react';

const Index = () => {
  const { tasks, addTask, updateTask, deleteTask, moveTask, stats } = useTasks();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Group tasks by time block
  const tasksByTimeBlock = {
    morning: tasks.filter(task => task.timeBlock === 'morning'),
    afternoon: tasks.filter(task => task.timeBlock === 'afternoon'),
    evening: tasks.filter(task => task.timeBlock === 'evening'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if we're dropping over a time block
    if (['morning', 'afternoon', 'evening'].includes(over.id as string)) {
      const newTimeBlock = over.id as Task['timeBlock'];
      if (activeTask.timeBlock !== newTimeBlock) {
        moveTask(activeTask.id, newTimeBlock);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    
    const { active, over } = event;
    if (!over) return;

    // Handle reordering within the same container
    if (active.id !== over.id) {
      const activeTask = tasks.find(t => t.id === active.id);
      const overTask = tasks.find(t => t.id === over.id);
      
      if (activeTask && overTask && activeTask.timeBlock === overTask.timeBlock) {
        const timeBlockTasks = tasksByTimeBlock[activeTask.timeBlock];
        const oldIndex = timeBlockTasks.findIndex(t => t.id === active.id);
        const newIndex = timeBlockTasks.findIndex(t => t.id === over.id);
        
        if (oldIndex !== newIndex) {
          // This is a simplified reordering - in a full implementation,
          // you'd want to maintain order within localStorage
          console.log('Reordering tasks within time block');
        }
      }
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(taskData);
    toast({
      title: "Task added successfully!",
      description: `"${taskData.title}" has been added to your ${taskData.timeBlock} schedule.`,
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    updateTask(id, updates);
    
    if (updates.completed !== undefined) {
      toast({
        title: updates.completed ? "Task completed!" : "Task marked incomplete",
        description: task ? `"${task.title}" status updated.` : "Task status updated.",
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    deleteTask(id);
    toast({
      title: "Task deleted",
      description: task ? `"${task.title}" has been removed.` : "Task has been removed.",
      variant: "destructive",
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Daily Task Organizer
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Organize your day with strategic time-blocking and priority management
          </p>
          
          <Button 
            onClick={() => setIsFormOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Circle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </motion.div>

        {/* Progress Dashboard */}
        <ProgressDashboard stats={stats} />

        {/* Task Columns */}
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TimeBlockColumn
              timeBlock="morning"
              title="Morning"
              tasks={tasksByTimeBlock.morning}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
            
            <TimeBlockColumn
              timeBlock="afternoon"
              title="Afternoon"
              tasks={tasksByTimeBlock.afternoon}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
            
            <TimeBlockColumn
              timeBlock="evening"
              title="Evening"
              tasks={tasksByTimeBlock.evening}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-5 opacity-90">
                <TaskCard
                  task={activeTask}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onEdit={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Task Form */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleAddTask}
          editingTask={editingTask}
          onUpdate={handleUpdateTask}
        />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 py-8 text-gray-500"
        >
          <p className="text-sm">
            Built with React, TypeScript, and Tailwind CSS. 
            All data is stored locally in your browser.
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
