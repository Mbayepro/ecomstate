"use client";

import React, { useRef, useState } from "react";
import { Film, Image as ImageIcon, Link2, Sparkles, Trash2, Upload } from "lucide-react";
import type { ProductDescriptionMedia } from "@/types/domain";

interface ProductDescriptionMediaFieldProps {
  items: ProductDescriptionMedia[];
  onChange: (next: ProductDescriptionMedia[]) => void;
}

export function ProductDescriptionMediaField({
  items,
  onChange,
}: ProductDescriptionMediaFieldProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const detectMediaType = (url: string, mime?: string): "image" | "gif" | "video" => {
    const lower = url.toLowerCase();
    if (
      mime?.startsWith("video/") ||
      /\.(mp4|webm|mov)(\?|$)/i.test(lower) ||
      lower.includes("youtube.com") ||
      lower.includes("youtu.be")
    ) {
      return "video";
    }
    if (mime === "image/gif" || /\.gif(\?|$)/i.test(lower)) {
      return "gif";
    }
    return "image";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setErrorMsg(null);

    for (const file of files) {
      // Limite souple : 4 Mo max pour GIF / courte vidéo MP4 ou photo HD
      if (file.size > 4 * 1024 * 1024) {
        setErrorMsg(
          `« ${file.name} » dépasse 4 Mo. Pour une vidéo longue, collez plutôt un lien vidéo ou YouTube ci-dessous.`
        );
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const res = typeof reader.result === "string" ? reader.result : "";
        if (!res) return;
        const mType = detectMediaType(file.name, file.type);
        const created: ProductDescriptionMedia = {
          id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: mType,
          url: res,
          caption: "",
        };
        onChange([...items, created]);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setErrorMsg(null);
    const mType = detectMediaType(trimmed);
    const created: ProductDescriptionMedia = {
      id: `dm-${Date.now()}`,
      type: mType,
      url: trimmed,
      caption: captionInput.trim() || undefined,
    };
    onChange([...items, created]);
    setUrlInput("");
    setCaptionInput("");
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    onChange(items.map((it) => (it.id === id ? { ...it, caption } : it)));
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[#00A884]/30 bg-[#F8FAFC] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#073B35]">
            <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
            Photos, GIFs animés & Vidéos dans la description
          </p>
          <p className="text-[11px] text-slate-500">
            Montrez le produit en action sous votre texte pour convaincre vos acheteurs COD.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,.gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#073B35] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#0a4f47] cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5 text-[#7CE3C8]" />
          Importer Photo / GIF / Vidéo
        </button>
      </div>

      {/* Ajout par lien URL (MP4, GIF, YouTube ou image externe) */}
      <div className="grid gap-2 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Link2 className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Lien image, .gif, .mp4 ou YouTube..."
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-8 pr-3 text-xs focus:border-[#00A884] focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <input
            type="text"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="Légende (optionnel)"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs focus:border-[#00A884] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="h-9 rounded-xl border border-[#00A884] bg-white px-3 text-xs font-extrabold text-[#073B35] hover:bg-[#E7F7F2] sm:col-span-2 cursor-pointer"
        >
          + Ajouter
        </button>
      </div>

      {errorMsg && (
        <p className="text-[11px] font-semibold text-rose-600">{errorMsg}</p>
      )}

      {/* Liste visuelle des médias de description */}
      {items.length > 0 && (
        <div className="grid gap-2.5 pt-1 sm:grid-cols-2">
          {items.map((media) => (
            <div
              key={media.id}
              className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-2.5"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 text-white">
                {media.type === "video" ? (
                  media.url.includes("youtube") || media.url.includes("youtu.be") ? (
                    <Film className="h-6 w-6 text-[#00A884]" />
                  ) : (
                    <video
                      src={media.url}
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <img
                    src={media.url}
                    alt={media.caption || "Média description"}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 py-0.2 text-[8px] font-black uppercase text-white">
                  {media.type === "video"
                    ? "VIDÉO"
                    : media.type === "gif"
                      ? "GIF"
                      : "PHOTO"}
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  {media.type === "video" ? (
                    <Film className="h-3 w-3 text-[#00A884]" />
                  ) : (
                    <ImageIcon className="h-3 w-3 text-[#00A884]" />
                  )}
                  <span className="uppercase">{media.type}</span>
                </div>
                <input
                  type="text"
                  value={media.caption ?? ""}
                  onChange={(e) => handleUpdateCaption(media.id, e.target.value)}
                  placeholder="Ajouter une légende rassurante..."
                  className="h-7 w-full rounded-md border border-slate-200 px-2 text-[11px] focus:border-[#00A884] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemove(media.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                title="Retirer ce média"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
