import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    metadataBase: url ? new URL(url) : undefined,
    title: settings.site_title,
    description: settings.site_description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      title: settings.site_title,
      description: settings.site_description,
      siteName: settings.brand,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.site_description,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Sama dengan design/index.html agar render fon identik. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
