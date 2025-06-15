
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type PomodoroPhase = 'work' | 'break' | 'longBreak';

interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4
};

export function usePomodoroTimer() {
  const [settings] = useLocalStorage<PomodoroSettings>('pomodoro-settings', DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Phase completed
      setIsActive(false);
      handlePhaseComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handlePhaseComplete = () => {
    if (phase === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
        setPhase('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setPhase('break');
        setTimeLeft(settings.breakDuration * 60);
      }
    } else {
      setPhase('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const startTimer = useCallback(() => setIsActive(true), []);
  const pauseTimer = useCallback(() => setIsActive(false), []);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(settings.workDuration * 60);
  }, [settings.workDuration]);

  const skipPhase = useCallback(() => {
    setIsActive(false);
    handlePhaseComplete();
  }, [phase, sessionsCompleted, settings]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const progress = useCallback(() => {
    const totalTime = phase === 'work' 
      ? settings.workDuration * 60
      : phase === 'longBreak'
      ? settings.longBreakDuration * 60
      : settings.breakDuration * 60;
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  }, [phase, timeLeft, settings]);

  return {
    timeLeft,
    isActive,
    phase,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    formatTime,
    progress
  };
}
