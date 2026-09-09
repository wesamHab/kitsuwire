import "server-only";
import { db } from "@/lib/db";

export const SITE_SETTING_KEYS = {
  foxCursorEnabled: "fox_cursor_enabled",
} as const;

export async function getFoxCursorEnabled(): Promise<boolean> {
  const setting = await db.siteSetting.findUnique({ where: { key: SITE_SETTING_KEYS.foxCursorEnabled } });
  return setting?.value === false ? false : true;
}

export async function setFoxCursorEnabled(enabled: boolean) {
  return db.siteSetting.upsert({
    where: { key: SITE_SETTING_KEYS.foxCursorEnabled },
    update: { value: enabled },
    create: { key: SITE_SETTING_KEYS.foxCursorEnabled, value: enabled },
  });
}
