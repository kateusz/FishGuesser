import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <div className="narrow-content stack">
        <h1 className="display title">{messages.privacy.title}</h1>
        <p>{messages.privacy.body}</p>
        <Link className="btn block" href={`/${locale}`}>
          {messages.common.back}
        </Link>
      </div>
    </AppShell>
  );
}
