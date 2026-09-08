import { NextResponse } from "next/server";
import { findArchiveArticle } from "../../../archive";

type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
};
type D1DatabaseLike = { prepare: (query: string) => D1Statement };

async function viewCount(slug: string, increment: boolean) {
  let database: D1DatabaseLike | undefined;
  try {
    const workers = await import("cloudflare:workers");
    database = (workers.env as unknown as { DB?: D1DatabaseLike }).DB;
  } catch {
    return null;
  }
  if (!database) return null;
  try {
    if (increment) {
      await database.prepare(
        "INSERT INTO article_views (slug, views, updated_at) VALUES (?, 1, ?) ON CONFLICT(slug) DO UPDATE SET views = views + 1, updated_at = excluded.updated_at",
      ).bind(slug, Date.now()).run();
    }
    const row = await database.prepare("SELECT views FROM article_views WHERE slug = ?").bind(slug).first<{ views: number }>();
    return row?.views ?? 0;
  } catch {
    return null;
  }
}

async function crossrefCitationCount(doi?: string | null) {
  if (!doi) return null;
  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=briq@briqjournal.com`, {
      headers: { "User-Agent": "BRIQ-Journal/1.0 (mailto:briq@briqjournal.com)" },
    });
    if (!response.ok) return null;
    const payload = await response.json() as { message?: { "is-referenced-by-count"?: number } };
    return typeof payload.message?.["is-referenced-by-count"] === "number"
      ? payload.message["is-referenced-by-count"]
      : null;
  } catch {
    return null;
  }
}

async function payload(slug: string, increment: boolean, requestedDoi?: string | null) {
  const article = findArchiveArticle(slug);
  const doi = article?.doi || requestedDoi;
  const [views, citations] = await Promise.all([viewCount(slug, increment), crossrefCitationCount(doi)]);
  return { views, citations, citedBy: [] as { title: string; year?: number; url?: string }[] };
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const doi = new URL(request.url).searchParams.get("doi");
  return NextResponse.json(await payload(slug, false, doi));
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const doi = new URL(request.url).searchParams.get("doi");
  return NextResponse.json(await payload(slug, true, doi));
}
