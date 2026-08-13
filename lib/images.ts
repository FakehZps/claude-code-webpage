export function extensionForDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,/)
  const type = match?.[1] ?? 'jpg'
  return type === 'jpeg' ? 'jpg' : type
}
