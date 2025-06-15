
import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface PomodoroSettings {
  workDuration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export type PomodoroPhase = 'work' | 'break' | 'longBreak' | 'paused';

export function usePomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoro-settings', {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false
  });

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handlePhaseComplete = () => {
    if (phase === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      const isLongBreakTime = newSessionsCompleted % settings.sessionsUntilLongBreak === 0;
      const nextPhase = isLongBreakTime ? 'longBreak' : 'break';
      const nextDuration = isLongBreakTime ? settings.longBreakDuration : settings.breakDuration;
      
      setPhase(nextPhase);
      setTimeLeft(nextDuration * 60);
      setIsActive(settings.autoStartBreaks);
    } else {
      setPhase('work');
      setTimeLeft(settings.workDuration * 60);
      setIsActive(settings.autoStartWork);
    }
  };

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings.workDuration * 60);
    setPhase('work');
  };

  const skipPhase = () => {
    handlePhaseComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    settings,
    setSettings,
    isActive,
    timeLeft,
    phase,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    formatTime: () => formatTime(timeLeft),
    progress: () => {
      const totalTime = phase === 'work' 
        ? settings.workDuration * 60
        : phase === 'longBreak' 
          ? settings.longBreakDuration * 60 
          : settings.breakDuration * 60;
      return ((totalTime - timeLeft) / totalTime) * 100;
    }
  };
}
