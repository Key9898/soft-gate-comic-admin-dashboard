import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit, Trash2, List, Grid } from 'lucide-react'
import { Card, Button, Modal, Input, PageSEO } from '../../components'
import { mockWebtoons } from '../../demo'

import type { ScheduledEpisode } from '../../types'

const mockScheduledEpisodes: ScheduledEpisode[] = [
  {
    id: '1',
    webtoonId: 'w1',
    webtoonTitle: { en: 'Fantasy World', mm: 'စိတ်ကူးယဉ်ကမ္ဘာ' },
    episodeNumber: 25,
    title: { en: 'The Final Battle', mm: 'နောက်ဆုံးတိုက်ပွဲ' },
    scheduledAt: '2026-04-28T10:00:00',
    status: 'scheduled',
  },
  {
    id: '2',
    webtoonId: 'w2',
    webtoonTitle: { en: 'Romance Story', mm: 'အချစ်ဇာတ်လမ်း' },
    episodeNumber: 18,
    title: { en: 'Confession', mm: 'ဝန်ခံချက်' },
    scheduledAt: '2026-04-28T14:00:00',
    status: 'scheduled',
  },
  {
    id: '3',
    webtoonId: 'w1',
    webtoonTitle: { en: 'Fantasy World', mm: 'စိတ်ကူးယဉ်ကမ္ဘာ' },
    episodeNumber: 26,
    title: { en: 'Aftermath', mm: 'နောက်ဆက်တွဲ' },
    scheduledAt: '2026-04-30T10:00:00',
    status: 'scheduled',
  },
  {
    id: '4',
    webtoonId: 'w3',
    webtoonTitle: { en: 'Mystery Tales', mm: 'လျှို့ဝှက်ဆန်းကြယ်ပုံပြင်များ' },
    episodeNumber: 10,
    title: { en: 'The Clue', mm: 'သဲလွန်စ' },
    scheduledAt: '2026-05-01T12:00:00',
    status: 'scheduled',
  },
  {
    id: '5',
    webtoonId: 'w2',
    webtoonTitle: { en: 'Romance Story', mm: 'အချစ်ဇာတ်လမ်း' },
    episodeNumber: 19,
    title: { en: 'New Beginnings', mm: 'အစပျိုးခြင်းအသစ်' },
    scheduledAt: '2026-05-02T14:00:00',
    status: 'scheduled',
  },
  {
    id: '6',
    webtoonId: 'w4',
    webtoonTitle: { en: 'Adventure Quest', mm: 'စွန့်စားခန်းခရီး' },
    episodeNumber: 30,
    title: { en: 'The Journey Ends', mm: 'ခရီးစဉ်အဆုံးသတ်' },
    scheduledAt: '2026-04-27T10:00:00',
    status: 'published',
  },
]

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-27'))
  const [scheduledEpisodes, setScheduledEpisodes] =
    useState<ScheduledEpisode[]>(mockScheduledEpisodes)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<ScheduledEpisode | null>(null)
  const [filterWebtoon, setFilterWebtoon] = useState<string>('all')

  const [formData, setFormData] = useState({
    webtoonId: '',
    episodeNumber: 1,
    title: '',
    scheduledDate: '',
    scheduledTime: '10:00',
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const getEpisodesForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return scheduledEpisodes.filter((ep) => {
      const epDate = ep.scheduledAt.split('T')[0]
      return epDate === dateStr && (filterWebtoon === 'all' || ep.webtoonId === filterWebtoon)
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleAddSchedule = () => {
    const webtoon = mockWebtoons.find((w) => w.id === formData.webtoonId)
    const newEpisode: ScheduledEpisode = {
      id: `${Date.now()}`,
      webtoonId: formData.webtoonId,
      webtoonTitle: webtoon?.title || { en: '', mm: '' },
      episodeNumber: formData.episodeNumber,
      title: { en: formData.title, mm: formData.title },
      scheduledAt: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
      status: 'scheduled',
    }
    setScheduledEpisodes([...scheduledEpisodes, newEpisode])
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleEditSchedule = () => {
    if (!selectedEpisode) return
    setScheduledEpisodes((prev) =>
      prev.map((ep) =>
        ep.id === selectedEpisode.id
          ? {
              ...ep,
              title: { en: formData.title, mm: formData.title },
              scheduledAt: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
            }
          : ep
      )
    )
    setIsEditModalOpen(false)
    resetForm()
  }

  const handleDeleteSchedule = (id: string) => {
    setScheduledEpisodes((prev) => prev.filter((ep) => ep.id !== id))
  }

  const openEditModal = (episode: ScheduledEpisode) => {
    setSelectedEpisode(episode)
    const [date, time] = episode.scheduledAt.split('T')
    setFormData({
      webtoonId: episode.webtoonId,
      episodeNumber: episode.episodeNumber,
      title: episode.title.en,
      scheduledDate: date,
      scheduledTime: time.slice(0, 5),
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      webtoonId: '',
      episodeNumber: 1,
      title: '',
      scheduledDate: '',
      scheduledTime: '10:00',
    })
    setSelectedEpisode(null)
  }

  const filteredEpisodes = scheduledEpisodes.filter(
    (ep) => filterWebtoon === 'all' || ep.webtoonId === filterWebtoon
  )

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const today = new Date('2026-04-27')

  return (
    <>
      <PageSEO.Schedule />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Schedule</h1>
            <p className="text-gray-500 mt-1">Manage scheduled episode releases</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            >
              {viewMode === 'calendar' ? (
                <List className="w-4 h-4 mr-2" />
              ) : (
                <Grid className="w-4 h-4 mr-2" />
              )}
              {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Episode
            </Button>
          </div>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  aria-label="Filter by webtoon"
                  value={filterWebtoon}
                  onChange={(e) => setFilterWebtoon(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  <option value="all">All Webtoons</option>
                  {mockWebtoons.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title.en}
                    </option>
                  ))}
                </select>
              </div>
              {viewMode === 'calendar' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Previous month"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    type="button"
                    title="Next month"
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const episodes = getEpisodesForDate(day)
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === currentDate.getMonth() &&
                    today.getFullYear() === currentDate.getFullYear()

                  return (
                    <div
                      key={day}
                      className={`h-24 border rounded-lg p-1 overflow-hidden ${
                        isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-900'}`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {episodes.slice(0, 2).map((ep) => (
                          <div
                            key={ep.id}
                            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${
                              ep.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                            onClick={() => openEditModal(ep)}
                          >
                            {formatTime(ep.scheduledAt)} - {ep.webtoonTitle.en}
                          </div>
                        ))}
                        {episodes.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{episodes.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEpisodes
                .sort(
                  (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
                )
                .map((episode) => (
                  <div key={episode.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            episode.status === 'published' ? 'bg-green-100' : 'bg-blue-100'
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              episode.status === 'published' ? 'text-green-600' : 'text-blue-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Ep. {episode.episodeNumber}: {episode.title.en}
                          </h3>
                          <p className="text-sm text-gray-500">{episode.webtoonTitle.en}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(episode.scheduledAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">{formatTime(episode.scheduledAt)}</p>
                        </div>
                        <span
                          className={`badge ${
                            episode.status === 'published' ? 'badge-success' : 'badge-info'
                          }`}
                        >
                          {episode.status}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit schedule"
                            onClick={() => openEditModal(episode)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete schedule"
                            onClick={() => handleDeleteSchedule(episode.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {filteredEpisodes.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No scheduled episodes</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            resetForm()
          }}
          title="Schedule Episode"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddSchedule()
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="schedule-webtoon"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Webtoon
              </label>
              <select
                id="schedule-webtoon"
                value={formData.webtoonId}
                onChange={(e) => setFormData({ ...formData, webtoonId: e.target.value })}
                className="input-base"
                required
              >
                <option value="">Select webtoon</option>
                {mockWebtoons
                  .filter((w) => w.status !== 'draft')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title.en}
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="Episode Number"
              type="number"
              min={1}
              value={formData.episodeNumber}
              onChange={(e) =>
                setFormData({ ...formData, episodeNumber: parseInt(e.target.value) || 1 })
              }
              required
            />
            <Input
              label="Episode Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="schedule-date"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Date
                </label>
                <input
                  id="schedule-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="schedule-time"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Time
                </label>
                <input
                  id="schedule-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.webtoonId || !formData.title || !formData.scheduledDate}
              >
                Schedule
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            resetForm()
          }}
          title="Edit Schedule"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEditSchedule()
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Webtoon</label>
              <p className="text-gray-900">{selectedEpisode?.webtoonTitle.en}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Episode</label>
              <p className="text-gray-900">Episode {selectedEpisode?.episodeNumber}</p>
            </div>
            <Input
              label="Episode Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-schedule-date"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Date
                </label>
                <input
                  id="edit-schedule-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-schedule-time"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Time
                </label>
                <input
                  id="edit-schedule-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.title || !formData.scheduledDate}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  )
}

export default SchedulePage
