
import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface FocusSettings {
  enabled: boolean;
  hideLowPriority: boolean;
  hideCompleted: boolean;
  dimNonFocus: boolean;
  focusPriority: 'must-do' | 'should-do' | 'could-do' | null;
}

export function useFocusMode() {
  const [focusSettings, setFocusSettings] = useLocalStorage<FocusSettings>('focus-mode', {
    enabled: false,
    hideLowPriority: false,
    hideCompleted: true,
    dimNonFocus: true,
    focusPriority: null
  });

  const toggleFocusMode = () => {
    setFocusSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateFocusSettings = (updates: Partial<FocusSettings>) => {
    setFocusSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    focusSettings,
    toggleFocusMode,
    updateFocusSettings
  };
}
