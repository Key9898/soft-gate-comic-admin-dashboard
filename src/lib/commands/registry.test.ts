import { describe, expect, it } from 'vitest';
import { COMMANDS, filterCommands } from './registry';

const writer = { canWriteCatalog: true, canInvite: true, canWriteSettings: true };
const viewer = { canWriteCatalog: false, canInvite: false, canWriteSettings: false };

describe('command registry', () => {
  it('filters by slug substring', () => {
    const matches = filterCommands('webtoons', writer);
    expect(matches.map((command) => command.slug)).toContain('webtoons');
    expect(
      matches.every(
        (command) =>
          command.slug.includes('webtoon') || command.title.toLowerCase().includes('webtoons'),
      ),
    ).toBe(true);
  });

  it('hides create and invite commands for a viewer', () => {
    const slugs = filterCommands('', viewer).map((command) => command.slug);
    expect(slugs.some((slug) => slug.endsWith('.new'))).toBe(false);
    expect(slugs).not.toContain('invite.new');
    expect(slugs).toContain('webtoons');
  });

  it('includes webtoon.new for a catalog writer', () => {
    const slugs = filterCommands('', writer).map((command) => command.slug);
    expect(slugs).toContain('webtoon.new');
    expect(slugs).toContain('invite.new');
  });

  it('exposes help as an Admin go to /help', () => {
    const help = COMMANDS.find((command) => command.slug === 'help');
    expect(help).toMatchObject({ kind: 'go', group: 'Admin', path: '/help' });
  });

  it('sends Add Episode to the in-page editor', () => {
    const create = COMMANDS.find((command) => command.slug === 'episode.new');
    expect(create).toMatchObject({ kind: 'create', path: '/episodes/new' });
  });

  it('sends Add Webtoon to the in-page editor', () => {
    const create = COMMANDS.find((command) => command.slug === 'webtoon.new');
    expect(create).toMatchObject({ kind: 'create', path: '/webtoons/new' });
  });

  it('hides history.new for a catalog-only writer', () => {
    const slugs = filterCommands('', {
      canWriteCatalog: true,
      canInvite: false,
      canWriteSettings: false,
    }).map((command) => command.slug);
    expect(slugs).toContain('webtoon.new');
    expect(slugs).not.toContain('history.new');
    expect(slugs).not.toContain('member.new');
    expect(slugs).not.toContain('press.news');
    expect(slugs).not.toContain('faq.new');
  });

  it('includes history.new for a settings writer', () => {
    const slugs = filterCommands('', {
      canWriteCatalog: false,
      canInvite: false,
      canWriteSettings: true,
    }).map((command) => command.slug);
    expect(slugs).toContain('history.new');
    expect(slugs).toContain('member.new');
    expect(slugs).toContain('press.news');
    expect(slugs).toContain('faq.new');
    expect(slugs).not.toContain('webtoon.new');
    expect(slugs).toContain('about');
    expect(slugs).toContain('press');
    expect(slugs).toContain('faq');
    expect(slugs).toContain('cookies');
    expect(slugs).toContain('legal');
  });

  it('sends Add history to the About modal', () => {
    const create = COMMANDS.find((command) => command.slug === 'history.new');
    expect(create).toMatchObject({ kind: 'create', path: '/about?new=1', requires: 'settings' });
  });

  it('sends Add member to the About member modal', () => {
    const create = COMMANDS.find((command) => command.slug === 'member.new');
    expect(create).toMatchObject({
      kind: 'create',
      path: '/about?new=member',
      requires: 'settings',
    });
  });

  it('sends Add press news to the Press modal', () => {
    const create = COMMANDS.find((command) => command.slug === 'press.news');
    expect(create).toMatchObject({ kind: 'create', path: '/press?new=1', requires: 'settings' });
  });

  it('sends Add FAQ to the FAQ modal', () => {
    const create = COMMANDS.find((command) => command.slug === 'faq.new');
    expect(create).toMatchObject({ kind: 'create', path: '/faq?new=1', requires: 'settings' });
  });
});
