import { notFound } from "next/navigation";
import { SoonScreen } from "@/components/home/SoonScreen";
import { getMessages, isLocale } from "@/lib/messages";

export async function renderSoon(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SoonScreen locale={locale} messages={getMessages(locale)} />;
}
