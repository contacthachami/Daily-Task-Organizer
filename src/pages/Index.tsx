import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTasks } from '../hooks/useTasks';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useAchievements } from '../hooks/useAchievements';
import { useFocusMode } from '../hooks/useFocusMode';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useNotifications } from '../hooks/useNotifications';
import { Task } from '../types/task';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TimeBlockColumn } from '../components/TimeBlockColumn';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { FocusModePanel } from '../components/FocusModePanel';
import { PomodoroWidget } from '../components/PomodoroWidget';
import { AchievementNotification } from '../components/AchievementNotification';
import { KeyboardShortcuts } from '../components/KeyboardShortcuts';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Plus, Target, Search, Filter, Sparkles } from 'lucide-react';

const Index = () => {
  const { tasks, addTask, updateTask, deleteTask, moveTask, stats } = useTasks();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Advanced features
  const { filters, setFilters, filteredTasks, hasActiveFilters } = useTaskFilters(tasks);
  const { achievements, newAchievements } = useAchievements(tasks, stats);
  const { focusSettings, toggleFocusMode } = useFocusMode();
  const pomodoroTimer = usePomodoroTimer();
  const notifications = useNotifications();

  console.log('Rendering Index with tasks:', tasks.length);
  console.log('Focus settings:', focusSettings);
  console.log('Filtered tasks:', filteredTasks.length);

  // Apply focus mode filtering to the already filtered tasks
  const finalFilteredTasks = React.useMemo(() => {
    if (!focusSettings.enabled) return filteredTasks;
    
    return filteredTasks.filter(task => {
      if (focusSettings.hideCompleted && task.completed) return false;
      if (focusSettings.hideLowPriority && task.priority === 'could-do') return false;
      return true;
    });
  }, [filteredTasks, focusSettings]);

  // Group final filtered tasks by time block
  const tasksByTimeBlock = {
    morning: finalFilteredTasks.filter(task => task.timeBlock === 'morning'),
    afternoon: finalFilteredTasks.filter(task => task.timeBlock === 'afternoon'),
    evening: finalFilteredTasks.filter(task => task.timeBlock === 'evening'),
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        console.log('Keyboard shortcut: Creating new task');
        setIsFormOpen(true);
      },
      description: 'Create new task'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        console.log('Keyboard shortcut: Focusing search');
        document.getElementById('search-input')?.focus();
      },
      description: 'Focus search'
    },
    {
      key: 'Escape',
      action: () => {
        console.log('Keyboard shortcut: Closing modals');
        setIsFormOpen(false);
        setShowShortcuts(false);
      },
      description: 'Close modals'
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => {
        console.log('Keyboard shortcut: Toggling focus mode');
        toggleFocusMode();
      },
      description: 'Toggle focus mode'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => {
        console.log('Keyboard shortcut: Showing shortcuts');
        setShowShortcuts(true);
      },
      description: 'Show keyboard shortcuts'
    }
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event.active.id);
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    console.log('Drag over:', { activeId: active.id, overId: over.id });

    // Check if we're dropping over a time block
    if (['morning', 'afternoon', 'evening'].includes(over.id as string)) {
      const newTimeBlock = over.id as Task['timeBlock'];
      if (activeTask.timeBlock !== newTimeBlock) {
        console.log('Moving task to new time block:', newTimeBlock);
        moveTask(activeTask.id, newTimeBlock);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag end:', event);
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
    console.log('Adding new task:', taskData);
    addTask(taskData);
    toast({
      title: "✨ Task added successfully!",
      description: `"${taskData.title}" has been added to your ${taskData.timeBlock} schedule.`,
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    console.log('Updating task:', id, updates);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      console.error('Task not found:', id);
      return;
    }

    updateTask(id, updates);
    
    if (updates.completed !== undefined) {
      toast({
        title: updates.completed ? "🎉 Task completed!" : "📝 Task marked incomplete",
        description: `"${task.title}" status updated.`,
      });

      if (updates.completed && task) {
        notifications.showNotification('🎉 Task Completed!', {
          body: `Great job completing "${task.title}"!`,
          tag: 'task-completion'
        });
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    console.log('Deleting task:', id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      console.error('Task not found for deletion:', id);
      return;
    }

    deleteTask(id);
    toast({
      title: "🗑️ Task deleted",
      description: `"${task.title}" has been removed.`,
      variant: "destructive",
    });
  };

  const handleEditTask = (task: Task) => {
    console.log('Editing task:', task);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    console.log('Closing form');
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden font-sans">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
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
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 shadow-glass mb-8"
          >
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 font-display">Strategic Task Management</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-bold font-display bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            Daily Task Organizer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Transform your productivity with strategic time-blocking, priority management, 
            and intelligent focus tools designed for modern professionals.
          </p>
          
          {/* Action buttons - removed settings button */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => {
                  console.log('Add task button clicked');
                  setIsFormOpen(true);
                }}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl font-display relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                <Plus className="mr-2 h-5 w-5" />
                Add New Task
              </Button>
            </motion.div>
            
            <Button
              variant={focusSettings.enabled ? "default" : "outline"}
              size="lg"
              onClick={() => {
                console.log('Focus mode button clicked');
                toggleFocusMode();
              }}
              className={`px-6 py-4 rounded-xl font-display ${
                focusSettings.enabled 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "bg-white/80 backdrop-blur-md border-white/30 hover:bg-white/90"
              }`}
            >
              <Target className="mr-2 h-5 w-5" />
              {focusSettings.enabled ? 'Exit Focus' : 'Focus Mode'}
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-glass p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full md:w-auto">
                <SearchBar
                  value={filters.search}
                  onChange={(search) => {
                    console.log('Search changed:', search);
                    setFilters(prev => ({ ...prev, search }));
                  }}
                  placeholder="Search tasks..."
                />
              </div>
              <FilterPanel
                filters={filters}
                onFiltersChange={(newFilters) => {
                  console.log('Filters changed:', newFilters);
                  setFilters(newFilters);
                }}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>
        </motion.div>

        {/* Widgets Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Progress Dashboard */}
          <div className="lg:col-span-2">
            <ProgressDashboard stats={stats} achievements={achievements} />
          </div>
          
          {/* Pomodoro Timer */}
          <div>
            <PomodoroWidget timer={pomodoroTimer} />
          </div>
        </motion.div>

        {/* Focus Mode Panel */}
        <AnimatePresence>
          {focusSettings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <FocusModePanel />
            </motion.div>
          )}
        </AnimatePresence>

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
                focusSettings={focusSettings}
              />
              
              <TimeBlockColumn
                timeBlock="afternoon"
                title="Afternoon"
                tasks={tasksByTimeBlock.afternoon}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                focusSettings={focusSettings}
              />
              
              <TimeBlockColumn
                timeBlock="evening"
                title="Evening"
                tasks={tasksByTimeBlock.evening}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                focusSettings={focusSettings}
              />
            </div>

            <DragOverlay>
              {activeTask ? (
                <motion.div 
                  className="rotate-6 opacity-90 scale-105"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1.05 }}
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

        {/* Achievement Notifications */}
        <AnimatePresence>
          {newAchievements.map((achievement, index) => (
            <AchievementNotification
              key={achievement.id}
              achievement={achievement}
              delay={index * 1000}
            />
          ))}
        </AnimatePresence>

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcuts
          isOpen={showShortcuts}
          onClose={() => {
            console.log('Closing shortcuts modal');
            setShowShortcuts(false);
          }}
        />

        {/* Enhanced Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-20 py-12"
        >
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-glass max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 leading-relaxed mb-4 font-light">
              Built with React, TypeScript, and Tailwind CSS featuring advanced productivity tools.
              <br />
              All data is stored locally in your browser with optional cloud sync.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>Press ? for keyboard shortcuts</span>
              <span>•</span>
              <span>Ctrl+N for new task</span>
              <span>•</span>
              <span>Ctrl+F to search</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
