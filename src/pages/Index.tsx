import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTasks } from "../hooks/useTasks";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTaskFilters } from "../hooks/useTaskFilters";
import { useAchievements } from "../hooks/useAchievements";
import { useFocusMode } from "../hooks/useFocusMode";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { useNotifications } from "../hooks/useNotifications";
import { Task } from "../types/task";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { TimeBlockColumn } from "../components/TimeBlockColumn";
import { ProgressDashboard } from "../components/ProgressDashboard";
import { SearchBar } from "../components/SearchBar";
import { FilterPanel } from "../components/FilterPanel";
import { FocusModePanel } from "../components/FocusModePanel";
import { PomodoroWidget } from "../components/PomodoroWidget";
import { AchievementNotification } from "../components/AchievementNotification";
import { KeyboardShortcuts } from "../components/KeyboardShortcuts";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import {
  Plus,
  Target,
  Search,
  Filter,
  Sparkles,
  RotateCcw,
  Linkedin,
} from "lucide-react";

const Index = () => {
  const { tasks, addTask, updateTask, deleteTask, moveTask, stats } =
    useTasks();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Advanced features
  const { filters, setFilters, filteredTasks, hasActiveFilters } =
    useTaskFilters(tasks);
  const { achievements, newAchievements } = useAchievements(tasks, stats);
  const { focusSettings, toggleFocusMode } = useFocusMode();
  const pomodoroTimer = usePomodoroTimer();
  const notifications = useNotifications();

  console.log("Rendering Index with tasks:", tasks.length);
  console.log("Focus settings:", focusSettings);
  console.log("Filtered tasks:", filteredTasks.length);

  // Apply focus mode filtering to the already filtered tasks
  const finalFilteredTasks = React.useMemo(() => {
    if (!focusSettings.enabled) return filteredTasks;

    return filteredTasks.filter((task) => {
      if (focusSettings.hideCompleted && task.completed) return false;
      if (focusSettings.hideLowPriority && task.priority === "could-do")
        return false;
      return true;
    });
  }, [filteredTasks, focusSettings]);

  // Group final filtered tasks by time block
  const tasksByTimeBlock = {
    morning: finalFilteredTasks.filter((task) => task.timeBlock === "morning"),
    afternoon: finalFilteredTasks.filter(
      (task) => task.timeBlock === "afternoon"
    ),
    evening: finalFilteredTasks.filter((task) => task.timeBlock === "evening"),
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      ctrlKey: true,
      action: () => {
        console.log("Keyboard shortcut: Creating new task");
        setIsFormOpen(true);
      },
      description: "Create new task",
    },
    {
      key: "f",
      ctrlKey: true,
      action: (e) => {
        e?.preventDefault();
        console.log("Keyboard shortcut: Focusing search");
        const searchInput =
          document.getElementById("search-input") ||
          document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      },
      description: "Focus search",
    },
    {
      key: "Escape",
      action: () => {
        console.log("Keyboard shortcut: Closing modals");
        setIsFormOpen(false);
        setShowShortcuts(false);
      },
      description: "Close modals",
    },
    {
      key: "t",
      ctrlKey: true,
      action: () => {
        console.log("Keyboard shortcut: Toggling focus mode");
        toggleFocusMode();
      },
      description: "Toggle focus mode",
    },
    {
      key: "?",
      shiftKey: true,
      action: () => {
        console.log("Keyboard shortcut: Showing shortcuts");
        setShowShortcuts(true);
      },
      description: "Show keyboard shortcuts",
    },
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag start:", event.active.id);
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    console.log("Drag over:", { activeId: active.id, overId: over.id });

    // Check if we're dropping over a time block
    if (["morning", "afternoon", "evening"].includes(over.id as string)) {
      const newTimeBlock = over.id as Task["timeBlock"];
      if (activeTask.timeBlock !== newTimeBlock) {
        console.log("Moving task to new time block:", newTimeBlock);
        moveTask(activeTask.id, newTimeBlock);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag end:", event);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    // Handle reordering within the same container
    if (active.id !== over.id) {
      const activeTask = tasks.find((t) => t.id === active.id);
      const overTask = tasks.find((t) => t.id === over.id);

      if (
        activeTask &&
        overTask &&
        activeTask.timeBlock === overTask.timeBlock
      ) {
        const timeBlockTasks = tasksByTimeBlock[activeTask.timeBlock];
        const oldIndex = timeBlockTasks.findIndex((t) => t.id === active.id);
        const newIndex = timeBlockTasks.findIndex((t) => t.id === over.id);

        if (oldIndex !== newIndex) {
          console.log("Reordering tasks within time block");
        }
      }
    }
  };

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    console.log("Adding new task:", taskData);
    addTask(taskData);
    toast({
      title: "✨ Task added successfully!",
      description: `"${taskData.title}" has been added to your ${taskData.timeBlock} schedule.`,
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    console.log("Updating task:", id, updates);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      console.error("Task not found:", id);
      return;
    }

    updateTask(id, updates);

    if (updates.completed !== undefined) {
      toast({
        title: updates.completed
          ? "🎉 Task completed!"
          : "📝 Task marked incomplete",
        description: `"${task.title}" status updated.`,
      });

      if (updates.completed && task) {
        notifications.showNotification("🎉 Task Completed!", {
          body: `Great job completing "${task.title}"!`,
          tag: "task-completion",
        });
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    console.log("Deleting task:", id);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      console.error("Task not found for deletion:", id);
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
    console.log("Editing task:", task);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    console.log("Closing form");
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleResetLocalStorage = () => {
    console.log("Resetting local storage");

    // Clear all localStorage keys used by the app
    const keysToRemove = [
      "daily-tasks",
      "focus-mode",
      "unlocked-achievements",
      "pomodoro-settings",
      "task-filters",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Reload the page to reset all state
    window.location.reload();

    toast({
      title: "🔄 Local storage cleared",
      description:
        "All data has been reset. The page will refresh automatically.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden font-sans">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Enhanced Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6 sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/30 shadow-glass mb-4 sm:mb-8"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 font-display">
              Strategic Task Management
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-6 leading-tight px-2">
            Daily Task Organizer
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light px-4">
            Transform your productivity with strategic time-blocking, priority
            management, and intelligent focus tools designed for modern
            professionals.
          </p>

          {/* Action buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-8 px-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                onClick={() => {
                  console.log("Add task button clicked");
                  setIsFormOpen(true);
                }}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl font-display relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add New Task
              </Button>
            </motion.div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant={focusSettings.enabled ? "default" : "outline"}
                size="lg"
                onClick={() => {
                  console.log("Focus mode button clicked");
                  toggleFocusMode();
                }}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-display ${
                  focusSettings.enabled
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white/80 backdrop-blur-md border-white/30 hover:bg-white/90"
                }`}
              >
                <Target className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">
                  {focusSettings.enabled ? "Exit Focus" : "Focus Mode"}
                </span>
                <span className="sm:hidden">
                  {focusSettings.enabled ? "Exit" : "Focus"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleResetLocalStorage}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-display bg-white/80 backdrop-blur-md border-white/30 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Reset Data</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-4 sm:mb-8"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-glass p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4 items-center">
              <div className="w-full">
                <SearchBar
                  value={filters.search}
                  onChange={(search) => {
                    console.log("Search changed:", search);
                    setFilters((prev) => ({ ...prev, search }));
                  }}
                  placeholder="Search tasks..."
                />
              </div>
              <div className="w-full sm:w-auto">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    console.log("Filters changed:", newFilters);
                    setFilters(newFilters);
                  }}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Widgets Row - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8"
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
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 sm:mb-8"
            >
              <FocusModePanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Columns - Mobile Optimized */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
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

              <div className="md:col-span-2 lg:col-span-1">
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
            console.log("Closing shortcuts modal");
            setShowShortcuts(false);
          }}
        />

        {/* Enhanced Footer - Mobile Optimized */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-12 sm:mt-20 py-8 sm:py-12"
        >
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/30 shadow-glass max-w-2xl mx-auto">
            <p className="text-sm text-gray-600 leading-relaxed mb-4 font-light">
              All rights reserved for{" "}
              <a
                href="https://www.linkedin.com/in/contact-hachami/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EL MEHDI HACHAMI LinkedIn (opens in new tab)"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Linkedin
                  className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:text-blue-700 group-focus:scale-110 group-focus:text-blue-700"
                  aria-hidden="true"
                />
                <span className="underline underline-offset-2 group-hover:decoration-2 group-hover:text-blue-700 group-focus:text-blue-700">
                  EL MEHDI HACHAMI
                </span>
              </a>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-xs text-gray-500">
              <span>Press ? for keyboard shortcuts</span>
              <span className="hidden sm:inline">•</span>
              <span>Ctrl+N for new task</span>
              <span className="hidden sm:inline">•</span>
              <span>Ctrl+F to search</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
