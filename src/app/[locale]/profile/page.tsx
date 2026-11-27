import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProfileScreen } from "@/components/game/ProfileScreen";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <Suspense>
        <ProfileScreen locale={locale} />
      </Suspense>
    </AppShell>
  );
}
