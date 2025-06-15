
import { useEffect } from 'react';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: (event?: KeyboardEvent) => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Only allow Escape key when in input fields
        if (event.key !== 'Escape') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatch = !!shortcut.altKey === event.altKey;
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export const getShortcutDescription = (shortcut: ShortcutAction): string => {
  const parts = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
};
