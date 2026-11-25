import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "store-assets";

/**
 * Compresse et redimensionne une image côté client (idéal pour connexions 3G/4G en Afrique)
 */
async function compressImageFile(
  file: File,
  maxWidth = 1080,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string; ext: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.onload = () => {
      const resultStr = typeof reader.result === "string" ? reader.result : "";
      const img = new Image();
      img.onerror = () => reject(new Error("Format d'image non pris en charge."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            blob: file,
            dataUrl: resultStr,
            ext: file.name.split(".").pop() || "jpg",
          });
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const mimeType = "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        canvas.toBlob(
          (blob) => {
            resolve({
              blob: blob || file,
              dataUrl: compressedDataUrl,
              ext: "jpg",
            });
          },
          mimeType,
          quality
        );
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Téléverse une image vers Supabase Storage (bucket `store-assets`),
 * avec repli automatique sur une image compressée locale si le bucket n'est pas encore créé.
 */
export async function uploadStoreAsset(
  file: File,
  options: {
    storeId: string;
    folder: "products" | "logos" | "banners";
  }
): Promise<{ url: string; source: "supabase" | "local_compressed" }> {
  const maxWidth =
    options.folder === "logos"
      ? 512
      : options.folder === "banners"
        ? 1440
        : 1080;

  const { blob, dataUrl, ext } = await compressImageFile(file, maxWidth, 0.82);

  const supabase = createSupabaseBrowserClient();
  if (supabase) {
    try {
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40);
      const path = `${options.storeId}/${options.folder}/${Date.now()}-${safeName || "image"}.${ext}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!error) {
        const { data } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(path);
        if (data?.publicUrl) {
          return { url: data.publicUrl, source: "supabase" };
        }
      }
    } catch {
      // Fallback transparent vers l'image compressée
    }
  }

  return { url: dataUrl, source: "local_compressed" };
}
