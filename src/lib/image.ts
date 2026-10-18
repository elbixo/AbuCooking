import { IMAGE_MAX_BYTES } from "./admin";

// Reduce la imagen en el navegador antes de subirla: máx. 800 px de lado, WebP al 80 %.
// Una foto de móvil de 4 MB suele quedar en 40-100 KB. Si aun así supera el límite,
// baja la calidad progresivamente.
export async function resizeImage(file: File, maxSide = 800): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("No se puede leer la imagen. Usa JPG, PNG o WebP.");
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let blob: Blob | null = null;
  for (const quality of [0.8, 0.65, 0.5, 0.35]) {
    blob = await toBlob("image/webp", quality);
    // Algunos navegadores no generan WebP: en ese caso, JPEG
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", quality);
    if (blob && blob.size <= IMAGE_MAX_BYTES) break;
  }
  if (!blob) throw new Error("No se pudo procesar la imagen");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `imagen.${ext}`, { type: blob.type });
}
