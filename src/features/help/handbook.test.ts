import { describe, expect, it } from 'vitest';
import {
  ADMIN_ABOUT,
  ADMIN_COOKIES,
  ADMIN_FAQ,
  ADMIN_LEGAL,
  ADMIN_PRESS,
  ADMIN_SETTINGS,
  BUSINESS_NOTE,
  CATALOG_NOTES,
  COMMUNITY_NOTE,
  OVERVIEW_DATA_API,
} from './handbook';

describe('handbook honesty', () => {
  it('says the four settings can reach the reader when persist is on', () => {
    expect(OVERVIEW_DATA_API).toMatch(/can reach the reader site when the portal persist is on/);
    expect(ADMIN_SETTINGS).toMatch(/can reach the reader site when the portal persist is on/);
    expect(OVERVIEW_DATA_API).not.toMatch(/settings API; they do not change the reader site/);
    expect(ADMIN_SETTINGS).not.toMatch(/they do not change the reader site/);
  });

  it('says live Analytics and Revenue stay empty, not portal money', () => {
    expect(BUSINESS_NOTE.body).toMatch(/Analytics charts and Revenue lists are empty/);
    expect(BUSINESS_NOTE.body).toMatch(/not portal money/);
    expect(BUSINESS_NOTE.body).toMatch(/Mock desk still shows demo series/);
    expect(BUSINESS_NOTE.body).toMatch(
      /On the catalog API, Activity Log starts empty and only records this browser’s trail/,
    );
  });

  it('says live comments and users are portal rows and keeps inbox mock', () => {
    expect(OVERVIEW_DATA_API).toMatch(/ReaderComment/);
    expect(OVERVIEW_DATA_API).toMatch(/delete removes the reader thread/);
    expect(OVERVIEW_DATA_API).toMatch(/ReaderUser/);
    expect(OVERVIEW_DATA_API).toMatch(/Delete removes the reader/);
    expect(OVERVIEW_DATA_API).toMatch(/wallet coins are read-only/);
    expect(OVERVIEW_DATA_API).toMatch(/they are not the reader inbox/);
    expect(OVERVIEW_DATA_API).toMatch(/Analytics charts and Revenue transactions stay empty/);
    expect(OVERVIEW_DATA_API).toMatch(/The Reports list stays empty \(no reports API\)/);
    expect(OVERVIEW_DATA_API).toMatch(
      /Activity Log starts empty and only records this browser’s trail/,
    );
    expect(OVERVIEW_DATA_API).not.toMatch(/Reports stay mock/);
    expect(OVERVIEW_DATA_API).not.toMatch(/users, revenue, and reports stay mock/);
    expect(OVERVIEW_DATA_API).not.toMatch(/do not change reader-site comments/);
  });

  it('says live media ingest stores WebP at the same pixels', () => {
    const media = CATALOG_NOTES.find((note) => note.title === 'Media size');
    const episode = CATALOG_NOTES.find((note) => note.title === 'Episode files');
    expect(media?.body).toMatch(/image 2MB/);
    expect(media?.body).toMatch(/PDF 10MB/);
    expect(media?.body).toMatch(/same pixel width and height \(not the same byte size\)/);
    expect(media?.body).toMatch(/Mock desk stores the original data URL/);
    expect(episode?.body).toMatch(
      /live Media stores them as WebP at the same pixel width and height/,
    );
    expect(episode?.body).toMatch(/mock keeps the original data URL/);
  });

  it('says series add/edit is in-page and authors/genres stay on list pages', () => {
    const order = CATALOG_NOTES.find((note) => note.title === 'Order');
    expect(order?.body).toMatch(/\/webtoons\/new/);
    expect(order?.body).toMatch(/\/webtoons\/:id\/edit/);
    expect(order?.body).toMatch(/Authors and genres stay on their list pages/);
  });

  it('says live smoke titles must not stay ongoing or published', () => {
    const smoke = CATALOG_NOTES.find((note) => note.title === 'Live smoke');
    expect(smoke?.body).toMatch(/Do not leave ops smoke titles ongoing or published/);
    expect(smoke?.body).toMatch(/delete the series \(episodes first\)/);
  });

  it('keeps Schedule as Catalog index 2 and says comments load off the catalog lane', () => {
    expect(CATALOG_NOTES[2].title).toBe('Schedule');
    expect(COMMUNITY_NOTE.body).toMatch(
      /The Reports list stays empty when the catalog API is on \(no reports API\)/,
    );
    expect(COMMUNITY_NOTE.body).toMatch(/Mock desk still shows demo reports/);
    expect(COMMUNITY_NOTE.body).toMatch(/load separately from the catalog/);
    expect(COMMUNITY_NOTE.body).toMatch(/does not empty Webtoons/);
  });

  it('says About history and team do not change reader /about until website 205–207', () => {
    expect(OVERVIEW_DATA_API).toMatch(/does not change reader \/about until website 205–207/);
    expect(ADMIN_ABOUT).toMatch(/first published entry of that year/);
    expect(ADMIN_ABOUT).toMatch(/optional photo on every member/);
    expect(ADMIN_ABOUT).toMatch(/does not change reader \/about until website 205–207/);
  });

  it('says FAQ and Cookie Policy can reach reader /faq and /cookies when persist is on', () => {
    expect(OVERVIEW_DATA_API).toMatch(
      /FAQ and Cookie Policy save on this desk’s FAQ and Cookies APIs/,
    );
    expect(OVERVIEW_DATA_API).toMatch(
      /can reach reader \/faq and \/cookies when the portal persist is on/,
    );
    expect(ADMIN_FAQ).toMatch(/FAQ saves on this desk’s FAQ API/);
    expect(ADMIN_FAQ).toMatch(/can reach reader \/faq when the portal persist is on/);
    expect(ADMIN_COOKIES).toMatch(/Cookie Policy saves on this desk’s Cookies API/);
    expect(ADMIN_COOKIES).toMatch(/can reach reader \/cookies when the portal persist is on/);
  });

  it('says Press can reach reader /press when persist is on', () => {
    expect(OVERVIEW_DATA_API).toMatch(/Press saves on this desk’s Press API/);
    expect(OVERVIEW_DATA_API).toMatch(/can reach reader \/press when the portal persist is on/);
    expect(ADMIN_PRESS).toMatch(/Press saves on this desk’s Press API/);
    expect(ADMIN_PRESS).toMatch(/can reach reader \/press when the portal persist is on/);
  });

  it('says Privacy and Terms can reach reader /privacy and /terms when persist is on', () => {
    expect(OVERVIEW_DATA_API).toMatch(/Privacy and Terms save on this desk’s Legal API/);
    expect(OVERVIEW_DATA_API).toMatch(
      /can reach reader \/privacy and \/terms when the portal persist is on/,
    );
    expect(ADMIN_LEGAL).toMatch(/Privacy and Terms save on this desk’s Legal API/);
    expect(ADMIN_LEGAL).toMatch(
      /can reach reader \/privacy and \/terms when the portal persist is on/,
    );
  });
});
