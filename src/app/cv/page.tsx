import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cvPublicUrl, getContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();
  return { title: `${settings.cv_label} — ${settings.brand}` };
}

export default async function CvPage() {
  const { settings } = await getContent();
  if (!settings.cv_path) notFound();
  const url = cvPublicUrl(settings.cv_path);

  return (
    <>
      <header className="nb-nav">
        <Link className="nb-logo" href="/">
          <span className="nb-logo__mark"></span>
          {settings.brand}
        </Link>
        <a className="nb-btn nb-btn--sm" href={url} download>
          Unduh PDF
        </a>
      </header>
      <main className="cv-view">
        <object data={url} type="application/pdf" aria-label={settings.cv_label}>
          <div className="wrap sec">
            <p className="lead">Peramban ini tidak bisa menampilkan PDF langsung.</p>
            <a className="nb-btn" href={url}>
              Buka {settings.cv_label}
            </a>
          </div>
        </object>
      </main>
    </>
  );
}
