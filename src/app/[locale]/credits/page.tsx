import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getMessages, isLocale } from "@/lib/messages";
import { fishes } from "@/server/fish";

export default async function CreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <div className="narrow-content stack">
        <h1 className="display title">{messages.credits.title}</h1>
        {fishes().map((fish) => (
          <p key={fish.id}>
            {fish.namePl}: {fish.author}, {fish.license}
          </p>
        ))}
        <p>{messages.credits.fonts}</p>
        <p>{messages.credits.approximate}</p>
        <Link className="btn block" href={`/${locale}`}>
          {messages.common.back}
        </Link>
      </div>
    </AppShell>
  );
}
