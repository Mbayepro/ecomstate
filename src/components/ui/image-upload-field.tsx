"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { uploadStoreAsset } from "@/lib/supabase/storage";

interface SingleImageUploadFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (nextUrl: string) => void;
  storeId: string;
  folder: "logos" | "banners" | "products";
  aspectClassName?: string;
}

export function SingleImageUploadField({
  label,
  hint,
  value,
  onChange,
  storeId,
  folder,
  aspectClassName = "h-24 w-24",
}: SingleImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadStoreAsset(file, { storeId, folder });
      onChange(res.url);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#102A43]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput((s) => !s)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#102A43] cursor-pointer"
        >
          <Link2 className="h-3 w-3" />
          {showUrlInput ? "Masquer le lien URL" : "Ou coller un lien URL"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3">
        {value ? (
          <div
            className={`relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white ${aspectClassName}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 rounded-md bg-rose-600/90 p-1 text-white shadow-xs hover:bg-rose-700 cursor-pointer"
              title="Supprimer l'image"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-slate-400 ${aspectClassName}`}
          >
            <ImageIcon className="h-6 w-6" />
          </div>
        )}

        <div className="flex-1 min-w-[180px] space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#102A43]/20 bg-white px-3.5 py-2 text-xs font-bold text-[#102A43] shadow-2xs transition hover:border-[#102A43] hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#10B981]" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5 text-[#10B981]" />
            )}
            <span>
              {uploading
                ? "Compression & envoi..."
                : value
                  ? "Remplacer la photo (Téléphone / PC)"
                  : "Choisir une photo (Téléphone / PC)"}
            </span>
          </button>
          <p className="text-[11px] text-slate-500">
            {hint ||
              "Optimisation automatique pour chargement ultra-rapide sur mobile (3G/4G)."}
          </p>
        </div>
      </div>

      {showUrlInput && (
        <input
          type="text"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://.../image.jpg"
          className="h-9.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 font-mono text-xs text-[#102A43] focus:border-[#102A43] focus:outline-none"
        />
      )}
    </div>
  );
}

interface MultiImageUploadFieldProps {
  label: string;
  images: string[];
  onChange: (nextImages: string[]) => void;
  storeId: string;
}

export function MultiImageUploadField({
  label,
  images,
  onChange,
  storeId,
}: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const files = Array.from(fileList);
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await uploadStoreAsset(file, {
          storeId,
          folder: "products",
        });
        uploadedUrls.push(res.url);
      }
      onChange([...images, ...uploadedUrls]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  const addUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlDraft("");
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#102A43]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlBox((s) => !s)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#102A43] cursor-pointer"
        >
          <Link2 className="h-3 w-3" />
          {showUrlBox ? "Masquer l'ajout par lien" : "Ajouter par lien URL"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {images.map((imgUrl, idx) => (
          <div
            key={`${idx}-${imgUrl.slice(0, 24)}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={`Photo ${idx + 1}`}
              className="h-full w-full object-cover"
            />
            {idx === 0 && (
              <span className="absolute bottom-1 left-1 rounded-md bg-[#102A43]/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Principale
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute right-1 top-1 rounded-md bg-rose-600/90 p-1 text-white shadow-xs hover:bg-rose-700 cursor-pointer"
              title="Retirer cette photo"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-2 text-center text-xs font-bold text-[#102A43] transition hover:border-[#10B981] hover:bg-[#10B981]/5 disabled:opacity-60 cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#10B981]" />
          ) : (
            <Camera className="h-5 w-5 text-[#10B981]" />
          )}
          <span className="text-[11px] leading-tight">
            {uploading ? "Envoi..." : "+ Photo appareil"}
          </span>
        </button>
      </div>

      {showUrlBox && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://.../photo-produit.jpg"
            className="h-9.5 flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 font-mono text-xs text-[#102A43] focus:border-[#102A43] focus:outline-none"
          />
          <button
            type="button"
            onClick={addUrl}
            className="inline-flex items-center gap-1 rounded-lg bg-[#102A43] px-3 text-xs font-semibold text-white hover:bg-[#1B3B5A] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
      )}
    </div>
  );
}
