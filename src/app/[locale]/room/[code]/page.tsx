import { notFound } from "next/navigation";
import { RoomScreen } from "@/components/game/RoomScreen";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";

export default async function RoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <RoomScreen locale={locale} code={code.toUpperCase()} />
    </AppShell>
  );
}
