import { describe, expect, it } from 'vitest';
import { ADMIN_SETTINGS, OVERVIEW_DATA_API } from './handbook';

describe('handbook honesty', () => {
  it('says the four settings can reach the reader when persist is on', () => {
    expect(OVERVIEW_DATA_API).toMatch(/can reach the reader site when the portal persist is on/);
    expect(ADMIN_SETTINGS).toMatch(/can reach the reader site when the portal persist is on/);
    expect(OVERVIEW_DATA_API).not.toMatch(/settings API; they do not change the reader site/);
    expect(ADMIN_SETTINGS).not.toMatch(/they do not change the reader site/);
  });

  it('says live comments are portal ReaderComment and keeps inbox and users mock', () => {
    expect(OVERVIEW_DATA_API).toMatch(/ReaderComment/);
    expect(OVERVIEW_DATA_API).toMatch(/delete removes the reader thread/);
    expect(OVERVIEW_DATA_API).toMatch(/they are not the reader inbox/);
    expect(OVERVIEW_DATA_API).toMatch(/users, revenue, and reports stay mock/);
    expect(OVERVIEW_DATA_API).not.toMatch(/do not change reader-site comments/);
  });
});
