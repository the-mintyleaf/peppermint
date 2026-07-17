/** Pixel crop region reported by react-easy-crop's `onCropComplete` (croppedAreaPixels). */
export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Load an image element from a (same-origin) object URL so its pixels can be drawn to a canvas. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error("Could not load the selected image")),
    );
    img.src = src;
  });
}

/**
 * Draw the chosen crop region to a canvas, downscale it so the width never exceeds `maxWidth`
 * (keeping aspect), and re-encode as PNG. The object URL is same-origin (it comes from the local
 * File), so the canvas is never tainted. Returns a ready-to-upload `File`.
 */
export async function getCroppedPngFile(
  src: string,
  area: PixelArea,
  maxWidth = 800,
): Promise<File> {
  const image = await loadImage(src);

  const scale = area.width > maxWidth ? maxWidth / area.width : 1;
  const outW = Math.max(1, Math.round(area.width * scale));
  const outH = Math.max(1, Math.round(area.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outW,
    outH,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not encode the cropped image");

  return new File([blob], "signature.png", { type: "image/png" });
}

/** Revoke an object URL if present — safe to call with `null`. */
export function revokeUrl(url: string | null): void {
  if (url) URL.revokeObjectURL(url);
}
