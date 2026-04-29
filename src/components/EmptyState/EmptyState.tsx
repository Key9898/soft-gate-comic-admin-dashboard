import { FileQuestion, Search, FolderOpen, MessageSquare, Users, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../Button/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState = ({ icon, title, description, action, className = '' }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
    >
      {icon || <FileQuestion className="w-8 h-8 text-gray-400" />}
    </motion.div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>
    )}
    {action && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <Button onClick={action.onClick}>{action.label}</Button>
      </motion.div>
    )}
  </motion.div>
)

export const NoWebtoons = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<BookOpen className="w-8 h-8 text-gray-400" />}
    title="No webtoons yet"
    description="Get started by creating your first webtoon."
    action={onAdd ? { label: 'Add Webtoon', onClick: onAdd } : undefined}
  />
)

export const NoEpisodes = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<FolderOpen className="w-8 h-8 text-gray-400" />}
    title="No episodes yet"
    description="Add your first episode to this webtoon."
    action={onAdd ? { label: 'Add Episode', onClick: onAdd } : undefined}
  />
)

export const NoUsers = ({ onClear }: { onClear?: () => void }) => (
  <EmptyState
    icon={<Users className="w-8 h-8 text-gray-400" />}
    title="No users found"
    description="Try adjusting your search or filter criteria."
    action={onClear ? { label: 'Clear Filters', onClick: onClear } : undefined}
  />
)

export const NoComments = () => (
  <EmptyState
    icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
    title="No comments found"
    description="There are no comments matching your criteria."
  />
)

export const NoSearchResults = ({ query, onClear }: { query?: string; onClear?: () => void }) => (
  <EmptyState
    icon={<Search className="w-8 h-8 text-gray-400" />}
    title="No results found"
    description={
      query
        ? `No results for "${query}". Try a different search term.`
        : 'Try a different search term.'
    }
    action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
  />
)

export const NoMedia = ({ onUpload }: { onUpload?: () => void }) => (
  <EmptyState
    icon={<FolderOpen className="w-8 h-8 text-gray-400" />}
    title="No media files"
    description="Upload your first image or PDF to get started."
    action={onUpload ? { label: 'Upload Files', onClick: onUpload } : undefined}
  />
)

export default EmptyState
