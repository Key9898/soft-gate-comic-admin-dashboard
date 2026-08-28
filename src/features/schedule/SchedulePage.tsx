import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit, Trash2, List, Grid } from 'lucide-react';
import { Card, Button, Modal, PageSEO, EmptyState } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Episode } from '../../types';
import SchedulePageSkeleton from './components/SchedulePageSkeleton';
import {
  isoToYangonCalendarDay,
  isoToYangonDateTimeLocal,
  isoToYangonTimeHm,
  nowIso,
  yangonDateAndTimeToIso,
} from '@/lib/yangonDate';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { updateEpisode } from '@/lib/api/catalog';

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

const yangonPartsNow = () => {
  const local = isoToYangonDateTimeLocal(nowIso());
  const [y, m, d] = local.slice(0, 10).split('-').map(Number);
  return { year: y, month: m, day: d };
};

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const startingWeekday = (year: number, month: number) =>
  new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

const formatYangonClock = (iso: string) => {
  const hm = isoToYangonTimeHm(iso);
  if (!hm) return '';
  const [h, m] = hm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const SchedulePage = () => {
  const { user } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const { episodes, setEpisodes, webtoons, setActivityLogs, isLoading, reloadCatalog } = useData();
  const initialYangon = yangonPartsNow();
  const [viewYear, setViewYear] = useState(initialYangon.year);
  const [viewMonth, setViewMonth] = useState(initialYangon.month);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [filterWebtoon, setFilterWebtoon] = useState<string>('all');

  const [formData, setFormData] = useState({
    webtoonId: '',
    episodeId: '',
    scheduledDate: '',
    scheduledTime: '10:00',
  });
  const [formError, setFormError] = useState('');

  const scheduledCatalog = useMemo(
    () =>
      episodes.filter((episode) => episode.status === 'scheduled' && Boolean(episode.scheduledAt)),
    [episodes],
  );

  const eligibleEpisodes = episodes.filter(
    (episode) =>
      episode.webtoonId === formData.webtoonId &&
      (episode.status === 'draft' || episode.status === 'scheduled'),
  );

  const monthDayCount = daysInMonth(viewYear, viewMonth);
  const monthStart = startingWeekday(viewYear, viewMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const delta = direction === 'next' ? 1 : -1;
    const next = new Date(Date.UTC(viewYear, viewMonth - 1 + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth() + 1);
  };

  const getEpisodesForDate = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledCatalog.filter((episode) => {
      const epDate = isoToYangonCalendarDay(episode.scheduledAt!);
      return epDate === dateStr && (filterWebtoon === 'all' || episode.webtoonId === filterWebtoon);
    });
  };

  const applySchedule = async (episodeId: string, scheduledAt: string) => {
    if (!canWriteCatalog) return false;
    const episode = episodes.find((item) => item.id === episodeId);
    if (!episode) return false;
    if (!isMockApi()) {
      try {
        await updateEpisode(episodeId, {
          title: episode.title,
          description: episode.description,
          images: episode.images,
          imageSizes: episode.imageSizes,
          isPremium: episode.isPremium,
          coinPrice: episode.coinPrice,
          status: 'scheduled',
          scheduledAt,
          freeAt: episode.freeAt,
        });
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'schedule',
          targetId: episode.id,
          targetName: episode.title,
          details: `Scheduled ${episode.webtoonTitle.en} episode ${episode.episodeNumber}`,
          admin: user,
        });
        setFormError('');
        return true;
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save schedule'));
        return false;
      }
    }
    setEpisodes((prev) =>
      prev.map((item) =>
        item.id === episodeId
          ? { ...item, status: 'scheduled', scheduledAt, updatedAt: nowIso() }
          : item,
      ),
    );
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'schedule',
      targetId: episode.id,
      targetName: episode.title,
      details: `Scheduled ${episode.webtoonTitle.en} episode ${episode.episodeNumber}`,
      admin: user,
    });
    return true;
  };

  const handleAddSchedule = async () => {
    const scheduledAt = yangonDateAndTimeToIso(formData.scheduledDate, formData.scheduledTime);
    if (!formData.episodeId || !scheduledAt) return;
    if (await applySchedule(formData.episodeId, scheduledAt)) {
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleEditSchedule = async () => {
    if (!selectedEpisode) return;
    const scheduledAt = yangonDateAndTimeToIso(formData.scheduledDate, formData.scheduledTime);
    if (!scheduledAt) return;
    if (await applySchedule(selectedEpisode.id, scheduledAt)) {
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  const handleUnschedule = async (id: string) => {
    if (!canWriteCatalog) return;
    const episode = episodes.find((item) => item.id === id);
    if (!isMockApi()) {
      if (!episode) return;
      try {
        await updateEpisode(id, {
          title: episode.title,
          description: episode.description,
          images: episode.images,
          imageSizes: episode.imageSizes,
          isPremium: episode.isPremium,
          coinPrice: episode.coinPrice,
          status: 'draft',
        });
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'schedule',
          targetId: episode.id,
          targetName: episode.title,
          details: `Unscheduled ${episode.webtoonTitle.en} episode ${episode.episodeNumber}`,
          admin: user,
        });
        setFormError('');
      } catch (err) {
        setFormError(apiMessage(err, 'Could not unschedule episode'));
      }
      return;
    }
    setEpisodes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'draft', scheduledAt: undefined, updatedAt: nowIso() }
          : item,
      ),
    );
    if (episode) {
      appendActivityLog(setActivityLogs, {
        action: 'delete',
        targetType: 'schedule',
        targetId: episode.id,
        targetName: episode.title,
        details: `Unscheduled ${episode.webtoonTitle.en} episode ${episode.episodeNumber}`,
        admin: user,
      });
    }
  };

  const openEditModal = (episode: Episode) => {
    setSelectedEpisode(episode);
    const local = episode.scheduledAt ? isoToYangonDateTimeLocal(episode.scheduledAt) : '';
    setFormData({
      webtoonId: episode.webtoonId,
      episodeId: episode.id,
      scheduledDate: local.slice(0, 10),
      scheduledTime: local.slice(11, 16) || '10:00',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      webtoonId: '',
      episodeId: '',
      scheduledDate: '',
      scheduledTime: '10:00',
    });
    setSelectedEpisode(null);
    setFormError('');
  };

  const filteredEpisodes = scheduledCatalog.filter(
    (episode) => filterWebtoon === 'all' || episode.webtoonId === filterWebtoon,
  );

  const today = yangonPartsNow();

  return (
    <>
      <PageSEO.Schedule />
      {isLoading ? (
        <SchedulePageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Content Schedule</h1>
              <p className="mt-1 text-fg-muted">Manage scheduled episode releases (Asia/Yangon)</p>
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
              {canWriteCatalog ? (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Episode
                </Button>
              ) : null}
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
                      {monthNames[viewMonth - 1]} {viewYear}
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
                  {Array.from({ length: monthStart }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 rounded-lg bg-gray-50" />
                  ))}
                  {Array.from({ length: monthDayCount }).map((_, i) => {
                    const day = i + 1;
                    const dayEpisodes = getEpisodesForDate(day);
                    const isToday =
                      today.day === day && today.month === viewMonth && today.year === viewYear;

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
                          {dayEpisodes.slice(0, 2).map((ep) => (
                            <div
                              key={ep.id}
                              className={`${canWriteCatalog ? 'cursor-pointer' : ''} truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800`}
                              onClick={canWriteCatalog ? () => openEditModal(ep) : undefined}
                            >
                              {formatYangonClock(ep.scheduledAt!)} - {ep.webtoonTitle.en}
                            </div>
                          ))}
                          {dayEpisodes.length > 2 && (
                            <div className="px-1 text-xs text-fg-muted">
                              +{dayEpisodes.length - 2} more
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
                  .slice()
                  .sort((a, b) => Date.parse(a.scheduledAt || '') - Date.parse(b.scheduledAt || ''))
                  .map((episode) => (
                    <div key={episode.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600" />
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
                              {isoToYangonCalendarDay(episode.scheduledAt!)}
                            </p>
                            <p className="text-sm text-fg-muted">
                              {formatYangonClock(episode.scheduledAt!)}
                            </p>
                          </div>
                          <span className="badge badge-info">{episode.status}</span>
                          {canWriteCatalog ? (
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
                                title="Unschedule episode"
                                onClick={() => void handleUnschedule(episode.id)}
                                className="rounded-lg p-2 text-fg-muted hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                {filteredEpisodes.length === 0 && (
                  <EmptyState
                    title="No scheduled episodes"
                    description="Try a different webtoon filter or schedule an existing episode."
                    action={{
                      label: 'Clear Filter',
                      onClick: () => setFilterWebtoon('all'),
                    }}
                  />
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
                void handleAddSchedule();
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
                  onChange={(e) =>
                    setFormData({ ...formData, webtoonId: e.target.value, episodeId: '' })
                  }
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
              <div>
                <label
                  htmlFor="schedule-episode"
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
                >
                  Existing episode
                </label>
                <select
                  id="schedule-episode"
                  value={formData.episodeId}
                  onChange={(e) => setFormData({ ...formData, episodeId: e.target.value })}
                  className="input-base"
                  required
                  disabled={!formData.webtoonId}
                >
                  <option value="">Select episode</option>
                  {eligibleEpisodes.map((episode) => (
                    <option key={episode.id} value={episode.id}>
                      Ep. {episode.episodeNumber}: {episode.title.en}
                    </option>
                  ))}
                </select>
                {formData.webtoonId && eligibleEpisodes.length === 0 && (
                  <p className="mt-1 text-xs text-fg-muted">
                    No draft or scheduled episodes for this title. Create one on the Episodes page.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="schedule-date"
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Date (Yangon)
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
                    Time (Yangon)
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
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
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
                  disabled={
                    !formData.episodeId || !formData.scheduledDate || !formData.scheduledTime
                  }
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
                void handleEditSchedule();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                  Webtoon
                </label>
                <p className="text-fg">{selectedEpisode?.webtoonTitle.en}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                  Episode
                </label>
                <p className="text-fg">
                  Episode {selectedEpisode?.episodeNumber}: {selectedEpisode?.title.en}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-schedule-date"
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Date (Yangon)
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
                    Time (Yangon)
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
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
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
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    void (async () => {
                      if (selectedEpisode) await handleUnschedule(selectedEpisode.id);
                      setIsEditModalOpen(false);
                      resetForm();
                    })();
                  }}
                >
                  Unschedule
                </Button>
                <Button type="submit" disabled={!formData.scheduledDate || !formData.scheduledTime}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default SchedulePage;
