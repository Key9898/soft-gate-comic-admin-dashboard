import { AlertTriangle, Clock, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../Button/Button'

export interface SessionTimeoutDialogProps {
  isOpen: boolean
  timeRemaining: string
  onExtend: () => void
  onLogout: () => void
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
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Session Timeout Warning</h2>
                <p className="text-sm text-gray-500">Your session is about to expire</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{timeRemaining}</span>
              </div>
              <p className="text-center text-sm text-orange-700 mt-2">
                You will be automatically logged out for security
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Would you like to extend your session? For security, you'll be logged out
              automatically if no action is taken.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
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
  )
}

export default SessionTimeoutDialog
