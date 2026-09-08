import { describe, expect, it } from 'vitest';
import { COMMANDS, filterCommands } from './registry';

const writer = { canWriteCatalog: true, canInvite: true };
const viewer = { canWriteCatalog: false, canInvite: false };

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
});
