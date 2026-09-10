import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { inspectUpload } from './inspectUpload.js';
import { prepareStoredUpload } from './transcodeUpload.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

const PDF = Buffer.from('%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<>\n%%EOF\n');

function inspected(mimetype: string, size: number) {
  const result = inspectUpload({ mimetype, size });
  if ('error' in result) throw new Error(result.error);
  return result;
}

describe('prepareStoredUpload', () => {
  it('converts a still PNG to WebP at the same pixel size', async () => {
    const prepared = await prepareStoredUpload(inspected('image/png', PNG.length), PNG);
    if ('error' in prepared) throw new Error(prepared.error);

    expect(prepared.contentType).toBe('image/webp');
    expect(prepared.extension).toBe('.webp');
    expect(prepared.body.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(prepared.body.subarray(8, 12).toString('ascii')).toBe('WEBP');

    const input = await sharp(PNG).metadata();
    const output = await sharp(prepared.body).metadata();
    expect(output.width).toBe(input.width);
    expect(output.height).toBe(input.height);
    expect(output.format).toBe('webp');
  });

  it('passes GIF and PDF through unchanged', async () => {
    const gif = await prepareStoredUpload(inspected('image/gif', GIF.length), GIF);
    if ('error' in gif) throw new Error(gif.error);
    expect(gif.contentType).toBe('image/gif');
    expect(gif.extension).toBe('.gif');
    expect(gif.body).toEqual(GIF);
    expect(gif.size).toBe(GIF.length);

    const pdf = await prepareStoredUpload(inspected('application/pdf', PDF.length), PDF);
    if ('error' in pdf) throw new Error(pdf.error);
    expect(pdf.contentType).toBe('application/pdf');
    expect(pdf.extension).toBe('.pdf');
    expect(pdf.body).toEqual(PDF);
  });

  it('passes animated WebP through without flattening', async () => {
    const gif = Buffer.from(
      '47494638396101000100800000000000ffffff21f90401000000002c00000000010001000002024c010021f90401000001002c00000000010001000002024401003b',
      'hex',
    );
    const animated = await sharp(gif, { animated: true }).webp({ loop: 0, delay: 100 }).toBuffer();

    const meta = await sharp(animated, { animated: true }).metadata();
    expect(meta.pages).toBeGreaterThan(1);

    const prepared = await prepareStoredUpload(inspected('image/webp', animated.length), animated);
    if ('error' in prepared) throw new Error(prepared.error);
    expect(prepared.contentType).toBe('image/webp');
    expect(prepared.extension).toBe('.webp');
    expect(prepared.body).toEqual(animated);
  });

  it('returns an error for a corrupt buffer and does not emit original-as-webp', async () => {
    const junk = Buffer.from('not-an-image');
    const prepared = await prepareStoredUpload(inspected('image/jpeg', junk.length), junk);
    expect(prepared).toEqual({ error: 'Could not convert image to WebP' });
  });
});
