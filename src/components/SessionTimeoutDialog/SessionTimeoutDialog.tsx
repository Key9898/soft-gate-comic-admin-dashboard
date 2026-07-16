import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button';

export interface SessionTimeoutDialogProps {
  isOpen: boolean;
  timeRemaining: string;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionTimeoutDialog = ({
  isOpen,
  timeRemaining,
  onExtend,
  onLogout,
}: SessionTimeoutDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Session Timeout Warning</h2>
                <p className="text-sm text-gray-500">Your session is about to expire</p>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-orange-50 p-4">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{timeRemaining}</span>
              </div>
              <p className="mt-2 text-center text-sm text-orange-700">
                You will be automatically logged out for security
              </p>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              Would you like to extend your session? For security, you'll be logged out
              automatically if no action is taken.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout Now
              </Button>
              <Button className="flex-1" onClick={onExtend}>
                Extend Session
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutDialog;
