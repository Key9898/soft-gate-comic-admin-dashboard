import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, PageSEO } from '../../components';
import { formatAdminRole } from '@/lib/format';
import { isMockApi } from '@/lib/api/http';
import { STAFF_ROLE_GUIDE, useStaffAccess } from '@/lib/auth/staffAccess';
import { filterCommands, groupCommands } from '@/lib/commands';
import {
  ADMIN_INVITE,
  ADMIN_PROFILE,
  ADMIN_SETTINGS,
  ADMIN_SIGNIN,
  BUSINESS_NOTE,
  CATALOG_NOTES,
  COMMANDS_INTRO,
  COMMUNITY_NOTE,
  DESK_OWNER_EMAIL,
  HELP_TABS,
  OVERVIEW_BROKEN,
  OVERVIEW_DATA_API,
  OVERVIEW_DATA_MOCK,
  OVERVIEW_DESK,
  OVERVIEW_JUMP,
  parseHelpTab,
  type HelpTabId,
} from './handbook';

const HelpPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = parseHelpTab(params.get('tab'));
  const { role, canWriteCatalog, canManageTeam, inviteRoles } = useStaffAccess();
  const canInvite = canManageTeam && inviteRoles.length > 0;
  const grouped = useMemo(
    () => groupCommands(filterCommands('', { canWriteCatalog, canInvite })),
    [canWriteCatalog, canInvite],
  );

  const selectTab = (id: HelpTabId) => {
    const next = new URLSearchParams(params);
    if (id === 'overview') next.delete('tab');
    else next.set('tab', id);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageSEO.Help />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-fg">Help</h1>
          <p className="mt-1 text-fg-secondary">This is the staff desk.</p>
        </div>

        <div
          role="tablist"
          aria-label="Help sections"
          className="flex gap-2 overflow-x-auto border-b border-line"
        >
          {HELP_TABS.map((entry) => {
            const selected = tab === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`help-tab-${entry.id}`}
                aria-selected={selected}
                aria-controls={`help-panel-${entry.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(entry.id)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-fg-muted hover:text-fg-secondary'
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`help-panel-${tab}`}
          aria-labelledby={`help-tab-${tab}`}
          className="space-y-4"
        >
          {tab === 'overview' ? (
            <>
              <Card>
                <h2 className="text-lg font-semibold text-fg">This desk</h2>
                <p className="mt-2 text-sm text-fg-secondary">{OVERVIEW_DESK}</p>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Data</h2>
                <p className="mt-2 text-sm text-fg-secondary">
                  {isMockApi() ? OVERVIEW_DATA_MOCK : OVERVIEW_DATA_API}
                </p>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Jump</h2>
                <p className="mt-2 text-sm text-fg-secondary">{OVERVIEW_JUMP}</p>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">If something is broken</h2>
                <p className="mt-2 text-sm text-fg-secondary">{OVERVIEW_BROKEN}</p>
                <p className="mt-3 text-sm text-fg-secondary">
                  Email:{' '}
                  <a
                    className="text-primary-600 hover:underline dark:text-primary-400"
                    href={`mailto:${DESK_OWNER_EMAIL}`}
                  >
                    {DESK_OWNER_EMAIL}
                  </a>
                </p>
              </Card>
            </>
          ) : null}

          {tab === 'catalog' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {CATALOG_NOTES.map((note) => (
                <Card key={note.title}>
                  <h2 className="text-lg font-semibold text-fg">{note.title}</h2>
                  <p className="mt-2 text-sm text-fg-secondary">{note.body}</p>
                </Card>
              ))}
            </div>
          ) : null}

          {tab === 'community' ? (
            <Card>
              <h2 className="text-lg font-semibold text-fg">{COMMUNITY_NOTE.title}</h2>
              <p className="mt-2 text-sm text-fg-secondary">{COMMUNITY_NOTE.body}</p>
            </Card>
          ) : null}

          {tab === 'business' ? (
            <Card>
              <h2 className="text-lg font-semibold text-fg">{BUSINESS_NOTE.title}</h2>
              <p className="mt-2 text-sm text-fg-secondary">{BUSINESS_NOTE.body}</p>
            </Card>
          ) : null}

          {tab === 'admin' ? (
            <>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Roles</h2>
                <ul className="mt-4 space-y-3">
                  {STAFF_ROLE_GUIDE.map((entry) => {
                    const current = entry.role === role;
                    return (
                      <li
                        key={entry.role}
                        className={
                          current
                            ? 'rounded-lg border border-primary-500/40 bg-primary-500/5 p-3'
                            : undefined
                        }
                      >
                        <p className="text-sm font-medium text-fg">{formatAdminRole(entry.role)}</p>
                        <p className="mt-0.5 text-sm text-fg-muted">{entry.blurb}</p>
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Sign in</h2>
                <p className="mt-2 text-sm text-fg-secondary">{ADMIN_SIGNIN}</p>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Invite</h2>
                <p className="mt-2 text-sm text-fg-secondary">{ADMIN_INVITE}</p>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Settings</h2>
                <p className="mt-2 text-sm text-fg-secondary">{ADMIN_SETTINGS}</p>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold text-fg">Profile</h2>
                <p className="mt-2 text-sm text-fg-secondary">{ADMIN_PROFILE}</p>
              </Card>
            </>
          ) : null}

          {tab === 'commands' ? (
            <Card>
              <h2 className="text-lg font-semibold text-fg">Commands</h2>
              <p className="mt-2 text-sm text-fg-secondary">{COMMANDS_INTRO}</p>
              <div className="mt-4 space-y-4">
                {grouped.map(({ group, items }) => (
                  <div key={group}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                      {group}
                    </p>
                    <ul className="mt-1 divide-y divide-line">
                      {items.map((command) => {
                        const clickable = command.kind === 'go' || command.kind === 'create';
                        return (
                          <li key={command.slug}>
                            {clickable && command.path ? (
                              <button
                                type="button"
                                onClick={() => navigate(command.path!)}
                                className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm text-fg-secondary hover:text-primary-600"
                              >
                                <span className="min-w-0">{command.title}</span>
                                <span className="shrink-0 font-mono text-xs text-fg-muted">
                                  {command.slug}
                                </span>
                              </button>
                            ) : (
                              <div className="flex w-full items-center justify-between gap-3 py-2 text-sm text-fg-secondary">
                                <span className="min-w-0">{command.title}</span>
                                <span className="shrink-0 font-mono text-xs text-fg-muted">
                                  {command.slug}
                                </span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default HelpPage;
