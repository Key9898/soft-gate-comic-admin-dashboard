export const isAppleKeyboard = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
};

export const paletteShortcutLabel = (): string => (isAppleKeyboard() ? '⌘K' : 'Ctrl+K');
