import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
  onExtend?: () => void;
}

interface SessionState {
  isActive: boolean;
  lastActivity: Date;
  timeRemaining: number;
  showWarning: boolean;
}

const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const { timeoutMinutes = 30, warningMinutes = 5, onTimeout, onWarning, onExtend } = options;

  const [state, setState] = useState<SessionState>({
    isActive: true,
    lastActivity: new Date(),
    timeRemaining: timeoutMinutes * 60 * 1000,
    showWarning: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);
  const onExtendRef = useRef(onExtend);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    onWarningRef.current = onWarning;
    onExtendRef.current = onExtend;
  }, [onTimeout, onWarning, onExtend]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();

    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;

    warningRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, showWarning: true }));
      onWarningRef.current?.();
    }, warningTime);

    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isActive: false, showWarning: false }));
      clearTimers();
      onTimeoutRef.current?.();
    }, timeoutTime);

    intervalRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, timeoutTime - (Date.now() - prev.lastActivity.getTime())),
      }));
    }, 1000);
  }, [timeoutMinutes, warningMinutes, clearTimers]);

  const resetActivity = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastActivity: new Date(),
      isActive: true,
      showWarning: false,
      timeRemaining: timeoutMinutes * 60 * 1000,
    }));
    startTimers();
  }, [timeoutMinutes, startTimers]);

  const extendSession = useCallback(() => {
    resetActivity();
    onExtendRef.current?.();
  }, [resetActivity]);

  const endSession = useCallback(() => {
    clearTimers();
    setState((prev) => ({
      ...prev,
      isActive: false,
      showWarning: false,
      timeRemaining: 0,
    }));
    onTimeoutRef.current?.();
  }, [clearTimers]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      setState((prev) => {
        if (!prev.showWarning) {
          return prev;
        }
        return prev;
      });
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    startTimers();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [startTimers, clearTimers]);

  const formatTimeRemaining = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    formattedTimeRemaining: formatTimeRemaining(state.timeRemaining),
    extendSession,
    endSession,
    resetActivity,
  };
};

export default useSessionTimeout;
