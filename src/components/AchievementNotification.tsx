
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';
import { Achievement } from '../types/task';
import { Button } from './ui/button';

interface AchievementNotificationProps {
  achievement: Achievement;
  delay?: number;
}

export function AchievementNotification({ achievement, delay = 0 }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4" />
                <span className="font-semibold">Achievement Unlocked!</span>
              </div>
              <h4 className="font-bold">{achievement.title}</h4>
              <p className="text-sm opacity-90">{achievement.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
