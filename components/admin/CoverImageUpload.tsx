'use client'

import { ChangeEvent } from 'react'

export interface CoverImageValue {
  filename: string
  dataUrl: string
}

export interface CoverImageUploadProps {
  value: CoverImageValue | null
  onChange: (value: CoverImageValue | null) => void
  initialPreviewUrl?: string
}

export default function CoverImageUpload({
  value,
  onChange,
  initialPreviewUrl,
}: CoverImageUploadProps) {
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      onChange(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange({ filename: file.name, dataUrl: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        data-testid="entry-cover-image-input"
        onChange={handleFileChange}
        className="w-full border border-neon-cyan/30 bg-black/60 px-3 py-2 font-space-mono text-xs text-gray-400 file:mr-3 file:border-0 file:bg-neon-cyan/10 file:px-3 file:py-1 file:font-space-mono file:text-xs file:text-neon-cyan"
      />
      {(value || initialPreviewUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value ? value.dataUrl : initialPreviewUrl}
          alt="Cover preview"
          className="mt-3 h-32 w-auto border border-neon-cyan/20 object-cover"
        />
      )}
    </div>
  )
}
