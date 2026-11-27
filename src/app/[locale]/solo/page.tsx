import { notFound } from "next/navigation";
import { SoloSetup } from "@/components/game/SoloSetup";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";

export default async function SoloPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <SoloSetup locale={locale} />
    </AppShell>
  );
}
