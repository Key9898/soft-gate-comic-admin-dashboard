import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit, Trash2, List, Grid } from 'lucide-react';
import { Card, Button, Modal, Input, PageSEO } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';

import type { ScheduledEpisode } from '../../types';

const SchedulePage = () => {
  const { user } = useAuth();
  const { scheduledEpisodes, setScheduledEpisodes, webtoons, setActivityLogs } = useData();
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-27'));
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<ScheduledEpisode | null>(null);
  const [filterWebtoon, setFilterWebtoon] = useState<string>('all');

  const [formData, setFormData] = useState({
    webtoonId: '',
    episodeNumber: 1,
    title: '',
    scheduledDate: '',
    scheduledTime: '10:00',
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getEpisodesForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledEpisodes.filter((ep) => {
      const epDate = ep.scheduledAt.split('T')[0];
      return epDate === dateStr && (filterWebtoon === 'all' || ep.webtoonId === filterWebtoon);
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddSchedule = () => {
    const webtoon = webtoons.find((w) => w.id === formData.webtoonId);
    const newEpisode: ScheduledEpisode = {
      id: `${Date.now()}`,
      webtoonId: formData.webtoonId,
      webtoonTitle: webtoon?.title || { en: '', mm: '' },
      episodeNumber: formData.episodeNumber,
      title: { en: formData.title, mm: formData.title },
      scheduledAt: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
      status: 'scheduled',
    };
    setScheduledEpisodes((prev) => [...prev, newEpisode]);
    appendActivityLog(setActivityLogs, {
      action: 'create',
      targetType: 'schedule',
      targetId: newEpisode.id,
      targetName: newEpisode.title,
      details: `Scheduled ${newEpisode.webtoonTitle.en} episode ${newEpisode.episodeNumber}`,
      admin: user,
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSchedule = () => {
    if (!selectedEpisode) return;
    const updatedTitle = { en: formData.title, mm: formData.title };
    const updatedScheduledAt = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
    setScheduledEpisodes((prev) =>
      prev.map((ep) =>
        ep.id === selectedEpisode.id
          ? {
              ...ep,
              title: updatedTitle,
              scheduledAt: updatedScheduledAt,
            }
          : ep,
      ),
    );
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'schedule',
      targetId: selectedEpisode.id,
      targetName: updatedTitle,
      details: `Rescheduled ${selectedEpisode.webtoonTitle.en} episode ${selectedEpisode.episodeNumber}`,
      admin: user,
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteSchedule = (id: string) => {
    const episode = scheduledEpisodes.find((item) => item.id === id);
    setScheduledEpisodes((prev) => prev.filter((ep) => ep.id !== id));
    if (episode) {
      appendActivityLog(setActivityLogs, {
        action: 'delete',
        targetType: 'schedule',
        targetId: episode.id,
        targetName: episode.title,
        details: `Deleted schedule for ${episode.webtoonTitle.en} episode ${episode.episodeNumber}`,
        admin: user,
      });
    }
  };

  const openEditModal = (episode: ScheduledEpisode) => {
    setSelectedEpisode(episode);
    const [date, time] = episode.scheduledAt.split('T');
    setFormData({
      webtoonId: episode.webtoonId,
      episodeNumber: episode.episodeNumber,
      title: episode.title.en,
      scheduledDate: date,
      scheduledTime: time.slice(0, 5),
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      webtoonId: '',
      episodeNumber: 1,
      title: '',
      scheduledDate: '',
      scheduledTime: '10:00',
    });
    setSelectedEpisode(null);
  };

  const filteredEpisodes = scheduledEpisodes.filter(
    (ep) => filterWebtoon === 'all' || ep.webtoonId === filterWebtoon,
  );

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
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date('2026-04-27');

  return (
    <>
      <PageSEO.Schedule />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">Content Schedule</h1>
            <p className="mt-1 text-fg-muted">Manage scheduled episode releases</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            >
              {viewMode === 'calendar' ? (
                <List className="mr-2 h-4 w-4" />
              ) : (
                <Grid className="mr-2 h-4 w-4" />
              )}
              {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Episode
            </Button>
          </div>
        </div>

        <Card>
          <div className="border-b border-line p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  aria-label="Filter by webtoon"
                  value={filterWebtoon}
                  onChange={(e) => setFilterWebtoon(e.target.value)}
                  className="rounded-lg border border-line-strong px-3 py-2 text-sm"
                >
                  <option value="all">All Webtoons</option>
                  {webtoons.map((w) => (
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
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="min-w-[160px] text-center text-lg font-semibold text-fg">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    type="button"
                    title="Next month"
                    onClick={() => navigateMonth('next')}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="p-4">
              <div className="mb-2 grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-fg-muted">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 rounded-lg bg-gray-50" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const episodes = getEpisodesForDate(day);
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === currentDate.getMonth() &&
                    today.getFullYear() === currentDate.getFullYear();

                  return (
                    <div
                      key={day}
                      className={`h-24 overflow-hidden rounded-lg border p-1 ${
                        isToday ? 'border-primary-500 bg-primary-50' : 'border-line'
                      }`}
                    >
                      <div
                        className={`mb-1 text-sm font-medium ${isToday ? 'text-primary-600' : 'text-fg'}`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {episodes.slice(0, 2).map((ep) => (
                          <div
                            key={ep.id}
                            className={`cursor-pointer truncate rounded px-1 py-0.5 text-xs ${
                              ep.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                            onClick={() => openEditModal(ep)}
                          >
                            {formatTime(ep.scheduledAt)} - {ep.webtoonTitle.en}
                          </div>
                        ))}
                        {episodes.length > 2 && (
                          <div className="px-1 text-xs text-fg-muted">
                            +{episodes.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEpisodes
                .sort(
                  (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
                )
                .map((episode) => (
                  <div key={episode.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            episode.status === 'published' ? 'bg-green-100' : 'bg-blue-100'
                          }`}
                        >
                          <Calendar
                            className={`h-5 w-5 ${
                              episode.status === 'published' ? 'text-green-600' : 'text-blue-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-fg">
                            Ep. {episode.episodeNumber}: {episode.title.en}
                          </h3>
                          <p className="text-sm text-fg-muted">{episode.webtoonTitle.en}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-fg">
                            {new Date(episode.scheduledAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-fg-muted">{formatTime(episode.scheduledAt)}</p>
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
                            className="rounded-lg p-2 text-fg-muted hover:bg-gray-100 hover:text-fg-secondary"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete schedule"
                            onClick={() => handleDeleteSchedule(episode.id)}
                            className="rounded-lg p-2 text-fg-muted hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {filteredEpisodes.length === 0 && (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-fg-muted" />
                  <p className="text-fg-muted">No scheduled episodes</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title="Schedule Episode"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddSchedule();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="schedule-webtoon"
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
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
                {webtoons
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
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
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
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
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
                  setIsAddModalOpen(false);
                  resetForm();
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
            setIsEditModalOpen(false);
            resetForm();
          }}
          title="Edit Schedule"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSchedule();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg-secondary">Webtoon</label>
              <p className="text-fg">{selectedEpisode?.webtoonTitle.en}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg-secondary">Episode</label>
              <p className="text-fg">Episode {selectedEpisode?.episodeNumber}</p>
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
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
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
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
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
                  setIsEditModalOpen(false);
                  resetForm();
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
  );
};

export default SchedulePage;
