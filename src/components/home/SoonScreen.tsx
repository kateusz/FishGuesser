"use client";

import { AppShell } from "@/components/layout/AppShell";
import type { Locale, Messages } from "@/lib/messages";

export function SoonScreen({ locale, messages }: { locale: Locale; messages: Messages }) {
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <p className="subtitle">{messages.home.soon}</p>
    </AppShell>
  );
}
