
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
import { Plus, Sparkles } from 'lucide-react';

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
          console.log('Reordering tasks within time block');
        }
      }
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(taskData);
    toast({
      title: "✨ Task added successfully!",
      description: `"${taskData.title}" has been added to your ${taskData.timeBlock} schedule.`,
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    updateTask(id, updates);
    
    if (updates.completed !== undefined) {
      toast({
        title: updates.completed ? "🎉 Task completed!" : "📝 Task marked incomplete",
        description: task ? `"${task.title}" status updated.` : "Task status updated.",
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    deleteTask(id);
    toast({
      title: "🗑️ Task deleted",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-lg mb-6"
          >
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Strategic Task Management</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Daily Task Organizer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your productivity with strategic time-blocking and priority management. 
            Organize, prioritize, and conquer your day with style.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Task
            </Button>
          </motion.div>
        </motion.div>

        {/* Progress Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <ProgressDashboard stats={stats} />
        </motion.div>

        {/* Task Columns */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
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
                <motion.div 
                  className="rotate-6 opacity-90"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCard
                    task={activeTask}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </motion.div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </motion.div>

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
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16 py-8"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg max-w-md mx-auto">
            <p className="text-sm text-gray-600 leading-relaxed">
              Built with React, TypeScript, and Tailwind CSS. 
              <br />
              All data is stored locally in your browser.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
