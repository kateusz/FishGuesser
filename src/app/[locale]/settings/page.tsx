import { notFound } from "next/navigation";
import { SettingsScreen } from "@/components/game/SettingsScreen";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell locale={locale} settingsLabel={getMessages(locale).header.settings}>
      <SettingsScreen locale={locale} />
    </AppShell>
  );
}
