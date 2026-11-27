import { statSync } from "node:fs";
import path from "node:path";
import { fishById } from "@/server/fish";

// ponytail: one public species for the home frame. Round photos stay behind their token. Upgrade: swap the id if this file grows past ~500 KB.
const HOME_PREVIEW_ID = "rainbow-trout";

export function homePreviewPhoto(id?: string): { id: string; file: string } | undefined {
  if (id != null && id !== HOME_PREVIEW_ID) return undefined;
  const fish = fishById(HOME_PREVIEW_ID);
  const file = fish?.photoFile;
  if (!fish || !file || file !== path.basename(file)) return undefined;
  try {
    if (!statSync(path.join(process.cwd(), "src", "content", "photos", file)).isFile()) return undefined;
  } catch {
    return undefined;
  }
  return { id: fish.id, file };
}
