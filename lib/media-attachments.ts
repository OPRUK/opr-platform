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
  return type.split(";", 1)[0].trim().toLowerCase();
}

const canonicalMimeTypes: Record<AttachmentKind, Record<string, string>> = {
  dish: { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" },
  portrait: { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" },
  original: {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  },
  audio: {
    aac: "audio/aac",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
    wav: "audio/wav",
    webm: "audio/webm",
  },
  video: { mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm" },
};

export function attachmentMetadata(kind: AttachmentKind, type: string, fileName = "") {
  const normalisedType = normaliseMimeType(type);
  const typeExtension = attachmentLimits[kind].types[normalisedType];
  if (typeExtension) {
    return { extension: typeExtension, contentType: normalisedType };
  }

  // iOS Safari sometimes supplies an empty type (or application/octet-stream)
  // for recordings selected from Files/Voice Memos. The filename remains
  // reliable, so fall back to the allowlisted extension rather than rejecting
  // a valid recording solely because WebKit omitted its MIME metadata.
  const nameExtension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
  const inferredType = canonicalMimeTypes[kind][nameExtension];
  if (!inferredType) return null;

  return { extension: attachmentLimits[kind].types[inferredType], contentType: inferredType };
}

export function extensionFor(kind: AttachmentKind, type: string, fileName = ""): string | null {
  return attachmentMetadata(kind, type, fileName)?.extension ?? null;
}
