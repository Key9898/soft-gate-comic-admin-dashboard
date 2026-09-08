import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type CommandPaletteContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  focusNonce: number;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
};

export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusNonce, setFocusNonce] = useState(0);

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusNonce((nonce) => nonce + 1);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey) || event.altKey) {
        return;
      }
      event.preventDefault();
      open();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const value = useMemo(
    () => ({ isOpen, open, close, focusNonce }),
    [isOpen, open, close, focusNonce],
  );

  return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>;
};
