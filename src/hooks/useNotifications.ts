
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface NotificationSettings {
  enabled: boolean;
  reminders: boolean;
  achievements: boolean;
  pomodoroBreaks: boolean;
}

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>('notification-settings', {
    enabled: false,
    reminders: true,
    achievements: true,
    pomodoroBreaks: true
  });

  const [permission, setPermission] = useLocalStorage<NotificationPermission>('notification-permission', 'default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [setPermission]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (settings.enabled && permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  const showAchievementNotification = (title: string, description: string) => {
    if (settings.achievements) {
      showNotification(`🏆 Achievement Unlocked: ${title}`, {
        body: description,
        tag: 'achievement'
      });
    }
  };

  const showReminderNotification = (taskTitle: string) => {
    if (settings.reminders) {
      showNotification('📋 Task Reminder', {
        body: `Don't forget: ${taskTitle}`,
        tag: 'reminder'
      });
    }
  };

  const showPomodoroNotification = (phase: string) => {
    if (settings.pomodoroBreaks) {
      const messages = {
        work: '🍅 Time to work! Stay focused.',
        break: '☕ Take a short break!',
        longBreak: '🌟 Time for a longer break!'
      };
      showNotification('Pomodoro Timer', {
        body: messages[phase as keyof typeof messages] || 'Timer finished!',
        tag: 'pomodoro'
      });
    }
  };

  return {
    settings,
    setSettings,
    permission,
    requestPermission,
    showNotification,
    showAchievementNotification,
    showReminderNotification,
    showPomodoroNotification
  };
}
