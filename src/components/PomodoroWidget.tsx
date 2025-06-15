
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';

interface PomodoroWidgetProps {
  timer: ReturnType<typeof usePomodoroTimer>;
}

export function PomodoroWidget({ timer }: PomodoroWidgetProps) {
  const {
    isActive,
    phase,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    formatTime,
    progress
  } = timer;

  const getPhaseInfo = () => {
    switch (phase) {
      case 'work':
        return { label: 'Work', color: 'bg-red-500', emoji: '🍅' };
      case 'break':
        return { label: 'Break', color: 'bg-green-500', emoji: '☕' };
      case 'longBreak':
        return { label: 'Long Break', color: 'bg-blue-500', emoji: '🌟' };
      default:
        return { label: 'Paused', color: 'bg-gray-500', emoji: '⏸️' };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-glass p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${phaseInfo.color} rounded-lg`}>
          <Timer className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pomodoro Timer</h3>
          <p className="text-sm text-gray-600">{phaseInfo.label} Session</p>
        </div>
        <span className="text-2xl ml-auto">{phaseInfo.emoji}</span>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl font-bold font-mono text-gray-900 mb-2">
          {formatTime()}
        </div>
        <Progress value={progress()} className="h-2 mb-2" />
        <p className="text-sm text-gray-600">
          Sessions completed: {sessionsCompleted}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={isActive ? pauseTimer : startTimer}
          className="flex-1"
          variant={isActive ? "outline" : "default"}
        >
          {isActive ? (
            <><Pause className="h-4 w-4 mr-2" /> Pause</>
          ) : (
            <><Play className="h-4 w-4 mr-2" /> Start</>
          )}
        </Button>
        
        <Button variant="outline" onClick={resetTimer} size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" onClick={skipPhase} size="icon">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
