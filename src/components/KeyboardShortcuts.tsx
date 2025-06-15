
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', 'N'], description: 'Create new task' },
  { keys: ['Ctrl', 'F'], description: 'Focus search' },
  { keys: ['Ctrl', 'T'], description: 'Toggle focus mode' },
  { keys: ['Escape'], description: 'Close modals' },
  { keys: ['Shift', '?'], description: 'Show keyboard shortcuts' },
  { keys: ['Space'], description: 'Complete/uncomplete task (when focused)' },
  { keys: ['Enter'], description: 'Edit task (when focused)' },
  { keys: ['Delete'], description: 'Delete task (when focused)' },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm text-gray-700">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
