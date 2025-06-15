
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Button } from './ui/button';
import { Achievement } from '../hooks/useAchievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  delay?: number;
}

export function AchievementNotification({ achievement, delay = 0 }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    const hideTimer = setTimeout(() => setIsVisible(false), delay + 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-xl border border-yellow-300">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Achievement Unlocked!</h3>
                <p className="font-semibold mb-1">{achievement.icon} {achievement.title}</p>
                <p className="text-sm opacity-90">{achievement.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
