"use client";

import { useRef, useState } from "react";
import { uploadRecipeImage } from "@/app/admin/actions";
import { resizeImage } from "@/lib/image";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function ImageField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const small = await resizeImage(file);
      const data = new FormData();
      data.append("file", small);
      const res = await uploadRecipeImage(data);
      if (!res.ok) throw new Error(res.error);
      onChange(res.data);
      setInfo(`${Math.round(file.size / 1024)} KB → ${Math.round(small.size / 1024)} KB`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-28 w-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Imagen de la receta" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-stone-400">Sin imagen</span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-secondary">
            {busy ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
          </button>
          {value && !busy && (
            <button type="button" onClick={() => onChange("")} className="text-sm text-red-600 hover:underline">
              Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-stone-500">Se reduce automáticamente a 800 px en formato WebP.</p>
        {info && <p className="text-xs text-green-700">Optimizada: {info}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
