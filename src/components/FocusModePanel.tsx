
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, EyeOff, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useFocusMode } from '../hooks/useFocusMode';

export function FocusModePanel() {
  const { focusSettings, updateFocusSettings } = useFocusMode();

  console.log('FocusModePanel - Current settings:', focusSettings);

  const handleHideCompletedChange = (checked: boolean) => {
    console.log('Hide completed changed:', checked);
    updateFocusSettings({ hideCompleted: checked });
  };

  const handleHideLowPriorityChange = (checked: boolean) => {
    console.log('Hide low priority changed:', checked);
    updateFocusSettings({ hideLowPriority: checked });
  };

  const handleDimNonFocusChange = (checked: boolean) => {
    console.log('Dim non-focus changed:', checked);
    updateFocusSettings({ dimNonFocus: checked });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-orange-50/80 backdrop-blur-md border border-orange-200/50 rounded-2xl p-6 shadow-glass"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Target className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-900">Focus Mode Active</h3>
          <p className="text-sm text-orange-700">Customize your focus settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Hide Completed</span>
          </div>
          <Switch
            checked={focusSettings.hideCompleted}
            onCheckedChange={handleHideCompletedChange}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Hide Low Priority</span>
          </div>
          <Switch
            checked={focusSettings.hideLowPriority}
            onCheckedChange={handleHideLowPriorityChange}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Dim Non-Focus</span>
          </div>
          <Switch
            checked={focusSettings.dimNonFocus}
            onCheckedChange={handleDimNonFocusChange}
          />
        </div>
      </div>
    </motion.div>
  );
}
