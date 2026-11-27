import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/messages";

export default async function CreatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/profile?intent=host`);
}
