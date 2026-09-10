import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button, Input, Modal, EmptyState } from '../../components';
import { apiMessage, isMockApi } from '@/lib/api/http';
import {
  listReaderBroadcasts,
  previewReaderBroadcast,
  searchBroadcastReaders,
  sendReaderBroadcast,
  type BroadcastPreview,
  type ReaderBroadcast,
  type ReaderBroadcastType,
  type ReaderHit,
} from '@/lib/api/readerBroadcasts';

type AudienceMode = 'all' | 'selected';

function composeReady(input: {
  titleEn: string;
  titleMm: string;
  messageEn: string;
  messageMm: string;
  audience: AudienceMode;
  selected: ReaderHit[];
}): boolean {
  if (!input.titleEn.trim() || !input.titleMm.trim()) return false;
  if (!input.messageEn.trim() || !input.messageMm.trim()) return false;
  if (input.audience === 'selected' && input.selected.length < 1) return false;
  return true;
}

const ReaderBroadcastPanel = ({ canWrite }: { canWrite: boolean }) => {
  const mock = isMockApi();
  const [campaigns, setCampaigns] = useState<ReaderBroadcast[]>([]);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [type, setType] = useState<ReaderBroadcastType>('system');
  const [titleEn, setTitleEn] = useState('');
  const [titleMm, setTitleMm] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [messageMm, setMessageMm] = useState('');
  const [href, setHref] = useState('');
  const [audience, setAudience] = useState<AudienceMode>('all');
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<ReaderHit[]>([]);
  const [selected, setSelected] = useState<ReaderHit[]>([]);
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadCampaigns = useCallback(async () => {
    if (mock) return;
    try {
      const listed = await listReaderBroadcasts();
      setCampaigns(listed.broadcasts);
      setListError('');
    } catch (err) {
      setListError(apiMessage(err, 'Could not load broadcasts'));
    }
  }, [mock]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const ready = useMemo(
    () => composeReady({ titleEn, titleMm, messageEn, messageMm, audience, selected }),
    [titleEn, titleMm, messageEn, messageMm, audience, selected],
  );

  const audienceBody = () =>
    audience === 'all' ? { all: true as const } : { userIds: selected.map((row) => row.id) };

  const runSearch = async () => {
    if (mock) {
      setFormError('This mock desk cannot reach readers.');
      return;
    }
    setBusy(true);
    try {
      const result = await searchBroadcastReaders(query);
      setHits(result.readers);
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not search readers'));
    } finally {
      setBusy(false);
    }
  };

  const hrefResult = () => {
    const value = href.trim();
    if (!value) return { ok: true as const };
    if (!value.startsWith('/') || value.startsWith('//')) {
      return { ok: false as const, error: 'Link must be a portal path starting with /' };
    }
    return { ok: true as const, href: value };
  };

  const openConfirm = async () => {
    if (!canWrite || !ready) return;
    if (mock) {
      setFormError('This mock desk cannot reach readers.');
      return;
    }
    const parsedHref = hrefResult();
    if (!parsedHref.ok) {
      setFormError(parsedHref.error);
      return;
    }
    setBusy(true);
    try {
      const next = await previewReaderBroadcast(audienceBody());
      if (next.readers < 1) {
        setFormError('This audience has no readers');
        setBusy(false);
        return;
      }
      setPreview(next);
      setConfirmOpen(true);
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not preview audience'));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!canWrite || !preview || busy) return;
    setBusy(true);
    try {
      const hrefTrim = href.trim();
      await sendReaderBroadcast({
        type,
        title: { en: titleEn.trim(), mm: titleMm.trim() },
        message: { en: messageEn.trim(), mm: messageMm.trim() },
        href: hrefTrim || undefined,
        audience: audienceBody(),
      });
      setConfirmOpen(false);
      setPreview(null);
      setTitleEn('');
      setTitleMm('');
      setMessageEn('');
      setMessageMm('');
      setHref('');
      setSelected([]);
      setHits([]);
      setFormError('');
      await loadCampaigns();
    } catch (err) {
      setFormError(apiMessage(err, 'Could not send broadcast'));
    } finally {
      setBusy(false);
    }
  };

  const toggleReader = (hit: ReaderHit) => {
    setSelected((prev) =>
      prev.some((row) => row.id === hit.id)
        ? prev.filter((row) => row.id !== hit.id)
        : [...prev, hit],
    );
  };

  return (
    <div className="space-y-6">
      {canWrite ? (
        <Card>
          <h2 className="text-lg font-semibold text-fg">Send to readers</h2>
          <p className="mt-1 text-sm text-fg-muted">
            English and Myanmar are both required. This cannot be recalled after send.
          </p>
          {mock ? (
            <p className="mt-3 text-sm text-fg-secondary">
              This mock desk cannot reach readers. Send stays on this desk and does not invent
              deliveries into the staff inbox.
            </p>
          ) : null}
          {formError ? <p className="mt-3 text-sm text-red-600">{formError}</p> : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="broadcast-type"
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Type
              </label>
              <select
                id="broadcast-type"
                value={type}
                onChange={(e) => setType(e.target.value as ReaderBroadcastType)}
                className="input-base"
              >
                <option value="system">System</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <Input
              label="Link (optional)"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/coins"
            />
            <Input
              label="Title (EN)"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
            <Input
              label="Title (MM)"
              value={titleMm}
              onChange={(e) => setTitleMm(e.target.value)}
              required
            />
            <div>
              <label
                htmlFor="broadcast-message-en"
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Message (EN)
              </label>
              <textarea
                id="broadcast-message-en"
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                rows={3}
                className="input-base"
                required
              />
            </div>
            <div>
              <label
                htmlFor="broadcast-message-mm"
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Message (MM)
              </label>
              <textarea
                id="broadcast-message-mm"
                value={messageMm}
                onChange={(e) => setMessageMm(e.target.value)}
                rows={3}
                className="input-base"
                required
              />
            </div>
          </div>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium text-fg-secondary">Audience</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name="broadcast-audience"
                  checked={audience === 'all'}
                  onChange={() => setAudience('all')}
                />
                All readers
              </label>
              <label className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name="broadcast-audience"
                  checked={audience === 'selected'}
                  onChange={() => setAudience('selected')}
                />
                Selected readers
              </label>
            </div>
          </fieldset>
          {audience === 'selected' ? (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  label="Search readers"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-7 shrink-0"
                  disabled={busy}
                  onClick={() => void runSearch()}
                >
                  Search
                </Button>
              </div>
              {selected.length > 0 ? (
                <p className="text-sm text-fg-secondary">{selected.length} selected</p>
              ) : null}
              <ul className="divide-y divide-gray-100 rounded-lg border border-line">
                {hits.map((hit) => (
                  <li key={hit.id}>
                    <label className="flex cursor-pointer items-center gap-3 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selected.some((row) => row.id === hit.id)}
                        onChange={() => toggleReader(hit)}
                      />
                      <span className="font-medium text-fg">{hit.displayName || hit.email}</span>
                      <span className="text-fg-muted">{hit.email}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4">
            <Button type="button" disabled={!ready || busy} onClick={() => void openConfirm()}>
              Preview and send
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-fg">Reader broadcasts</h2>
        {listError ? <p className="mt-2 text-sm text-red-600">{listError}</p> : null}
        {mock ? (
          <EmptyState
            title="Broadcasts need the catalog API"
            description="This mock desk cannot send to readers."
          />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No broadcasts yet"
            description="Sent reader messages will appear here."
          />
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {campaigns.map((row) => (
              <li key={row.id} className="py-3">
                <p className="font-medium text-fg">{row.title.en}</p>
                <p className="text-sm text-fg-secondary">{row.message.en}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {row.type} · {row.status} · {row.audience}
                  {row.status === 'sent'
                    ? ` · inbox ${row.inboxCount}, email ${row.emailed}, push ${row.pushed}`
                    : ''}
                  {row.failureReason ? ` · ${row.failureReason}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          if (!busy) setConfirmOpen(false);
        }}
        title="Send this broadcast?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-fg-secondary">
            This cannot be recalled. It will reach {preview?.readers ?? 0} readers
            {preview ? ` (${preview.withEmail} email, ${preview.withPush} push)` : ''}.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={busy} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={() => void send()}>
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReaderBroadcastPanel;
