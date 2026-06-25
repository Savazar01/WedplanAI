import { createHash } from "crypto";

const PREVIEW_SALT = process.env.PREVIEW_SALT || "wpa-internal-preview-salt-92d4";

export function getPreviewCode(weddingId: string): string {
  return createHash("sha256")
    .update(weddingId + PREVIEW_SALT)
    .digest("hex")
    .substring(0, 12);
}
