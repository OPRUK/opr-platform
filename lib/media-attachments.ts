// Shared between the desktop submission route (server-side upload) and the
// signed-upload-url route (mobile client-side upload) so both enforce the
// same size/type allowlist against the same `recipe-uploads` bucket.
export type AttachmentKind = "dish" | "original" | "audio" | "portrait" | "video";

export const attachmentLimits: Record<AttachmentKind, { maxSize: number; types: Record<string, string> }> = {
  dish: {
    maxSize: 5 * 1024 * 1024,
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  },
  portrait: {
    maxSize: 5 * 1024 * 1024,
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  },
  original: {
    maxSize: 10 * 1024 * 1024,
    types: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
    },
  },
  audio: {
    maxSize: 10 * 1024 * 1024,
    types: {
      "audio/aac": "aac",
      "audio/m4a": "m4a",
      "audio/mp4": "m4a",
      "audio/mpeg": "mp3",
      "audio/ogg": "ogg",
      "audio/wav": "wav",
      "audio/webm": "webm",
      "audio/x-m4a": "m4a",
    },
  },
  video: {
    maxSize: 20 * 1024 * 1024,
    types: { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" },
  },
};

export function normaliseMimeType(type: string) {
  return type.split(";", 1)[0].toLowerCase();
}

export function extensionFor(kind: AttachmentKind, type: string): string | null {
  return attachmentLimits[kind].types[normaliseMimeType(type)] ?? null;
}
