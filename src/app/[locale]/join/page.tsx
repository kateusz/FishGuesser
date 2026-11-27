import { notFound } from "next/navigation";
import { JoinScreen } from "@/components/game/JoinScreen";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";

export default async function JoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <JoinScreen locale={locale} />
    </AppShell>
  );
}
