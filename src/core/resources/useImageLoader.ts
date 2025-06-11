import { useLoader, LoaderState } from './useLoader';

// load bitmap images from provided URLs
export function useImageLoader(
  imageUrls: string[]
): LoaderState<ImageBitmap[]> {
  return useLoader(async () => {
    const bitmaps = await Promise.all(
      imageUrls.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch image: ${res.status} ${res.statusText}`
          );
        }
        const blob = await res.blob();
        return createImageBitmap(blob);
      })
    );
    return bitmaps;
  }, [JSON.stringify(imageUrls)]);
}
