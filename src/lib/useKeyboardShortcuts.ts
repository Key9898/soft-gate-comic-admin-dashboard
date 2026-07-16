import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions) => {
  const { enabled = true, shortcuts } = options;
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (event.key !== 'Escape') return;
      }

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
  };
};

export const globalShortcuts: KeyboardShortcut[] = [
  { key: '/', ctrl: true, action: () => {}, description: 'Focus search' },
  { key: 'k', ctrl: true, action: () => {}, description: 'Open command palette' },
  {
    key: 'd',
    ctrl: true,
    action: () => (window.location.href = '/dashboard'),
    description: 'Go to Dashboard',
  },
  {
    key: 'w',
    ctrl: true,
    action: () => (window.location.href = '/webtoons'),
    description: 'Go to Webtoons',
  },
  {
    key: 'e',
    ctrl: true,
    action: () => (window.location.href = '/episodes'),
    description: 'Go to Episodes',
  },
  {
    key: 'u',
    ctrl: true,
    action: () => (window.location.href = '/users'),
    description: 'Go to Users',
  },
  {
    key: 'a',
    ctrl: true,
    action: () => (window.location.href = '/analytics'),
    description: 'Go to Analytics',
  },
  {
    key: 's',
    ctrl: true,
    action: () => (window.location.href = '/settings'),
    description: 'Go to Settings',
  },
  { key: 'Escape', action: () => {}, description: 'Close modal / Cancel' },
];

export const getShortcutLabel = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
};

export default useKeyboardShortcuts;
export type { KeyboardShortcut };
