import {
  BRAND_ASSET_SLOTS,
  BrandAssetImages,
  BrandAssetKey,
} from '../config/brandAssets';

async function loadSingleBrandImage(
  src: string
): Promise<{ img: HTMLImageElement; objectUrl: string } | null> {
  try {
    const response = await fetch(src, { cache: 'no-cache' });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return null;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image();
      image.onload = () =>
        image.naturalWidth > 0 && image.naturalHeight > 0
          ? resolve(image)
          : resolve(null);
      image.onerror = () => resolve(null);
      image.src = objectUrl;
    });

    if (!img) {
      URL.revokeObjectURL(objectUrl);
      return null;
    }

    return { img, objectUrl };
  } catch {
    return null;
  }
}

export interface LoadedBrandBundle {
  images: BrandAssetImages;
  loadedKeys: BrandAssetKey[];
  cleanup: () => void;
}

export async function loadBrandAssets(): Promise<LoadedBrandBundle> {
  const objectUrls: string[] = [];
  const images: BrandAssetImages = {};
  const loadedKeys: BrandAssetKey[] = [];

  const results = await Promise.all(
    BRAND_ASSET_SLOTS.map(async (slot) => {
      const loaded = await loadSingleBrandImage(slot.src);
      return { key: slot.key, loaded };
    })
  );

  for (const result of results) {
    if (result.loaded) {
      images[result.key] = result.loaded.img;
      loadedKeys.push(result.key);
      objectUrls.push(result.loaded.objectUrl);
    }
  }

  return {
    images,
    loadedKeys,
    cleanup: () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    },
  };
}
