import sharp from 'sharp';
import type { InspectedUpload } from './inspectUpload.js';

export const WEBP_QUALITY = 80;

export type PreparedUpload = {
  body: Buffer;
  contentType: string;
  extension: string;
  size: number;
};

function passthrough(inspected: InspectedUpload, buffer: Buffer): PreparedUpload {
  return {
    body: buffer,
    contentType: inspected.contentType,
    extension: inspected.extension,
    size: buffer.length,
  };
}

export async function prepareStoredUpload(
  inspected: InspectedUpload,
  buffer: Buffer,
): Promise<PreparedUpload | { error: string }> {
  if (inspected.kind === 'pdf' || inspected.contentType === 'image/gif') {
    return passthrough(inspected, buffer);
  }

  try {
    const meta = await sharp(buffer, { animated: true }).metadata();
    if ((meta.pages ?? 1) > 1) {
      return passthrough(inspected, buffer);
    }

    const width = meta.width;
    const height = meta.height;
    if (!width || !height) {
      return { error: 'Could not read image dimensions' };
    }

    const body = await sharp(buffer).webp({ quality: WEBP_QUALITY }).toBuffer();
    const out = await sharp(body).metadata();
    if (out.width !== width || out.height !== height) {
      return { error: 'WebP conversion changed image dimensions' };
    }

    return {
      body,
      contentType: 'image/webp',
      extension: '.webp',
      size: body.length,
    };
  } catch {
    return { error: 'Could not convert image to WebP' };
  }
}
