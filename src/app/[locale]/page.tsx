import { notFound } from "next/navigation";
import { HomeScreen } from "@/components/home/HomeScreen";
import { getMessages, isLocale } from "@/lib/messages";
import { homePreviewPhoto } from "@/server/home-preview";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const preview = homePreviewPhoto();
  return <HomeScreen locale={locale} messages={getMessages(locale)} previewSrc={preview ? `/api/v1/assets/${preview.id}` : undefined} />;
}
