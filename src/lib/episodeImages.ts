import type { Episode } from '@softgate/shared';

export type ImageSize = { width: number; height: number };

const isPositiveInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

export const isMeasuredSize = (
  slot: { width?: number; height?: number } | null,
): slot is ImageSize => slot != null && isPositiveInt(slot.width) && isPositiveInt(slot.height);

export const measureImageSize = (src: string): Promise<ImageSize | null> =>
  new Promise((resolve) => {
    const img = new Image();
    const finish = (size: ImageSize | null) => resolve(size);
    img.onload = () => {
      finish(
        isMeasuredSize({ width: img.naturalWidth, height: img.naturalHeight })
          ? { width: img.naturalWidth, height: img.naturalHeight }
          : null,
      );
    };
    img.onerror = () => finish(null);
    img.src = src;
    if (typeof img.decode === 'function') {
      void img.decode().catch(() => undefined);
    }
  });

export const toImageSizes = (
  slots: Array<{ width?: number; height?: number } | null>,
): Episode['imageSizes'] => {
  const sizes: Array<ImageSize | null> = slots.map((slot) =>
    isMeasuredSize(slot) ? { width: slot.width, height: slot.height } : null,
  );
  if (sizes.every((size) => size === null)) return undefined;
  return sizes;
};

export const isValidImageSizes = (images: string[], sizes: unknown): boolean => {
  if (!Array.isArray(sizes) || sizes.length !== images.length) return false;
  return sizes.every(
    (slot) =>
      slot === null ||
      (typeof slot === 'object' &&
        slot !== null &&
        isPositiveInt((slot as ImageSize).width) &&
        isPositiveInt((slot as ImageSize).height)),
  );
};
