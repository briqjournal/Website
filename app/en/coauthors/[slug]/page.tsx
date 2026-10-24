import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { historicalAuthorGroups, findHistoricalAuthorGroup } from "../../../historical-author-groups";
import { HistoricalAuthorGroupPage } from "../../../components/HistoricalAuthorGroupPage";
import { alignPageSeoAlternates } from "../../../seo-metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return historicalAuthorGroups.map((group) => ({ slug: group.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const group = findHistoricalAuthorGroup(slug);
  if (!group) return { title: "BRIQ" };
  const title = group.members.map((m) => m.name).join(" & ");
  return alignPageSeoAlternates({
    title: `${title} | BRIQ`,
    description: `${title}: historical BRIQ joint-author profile. ${group.articles.length} shared publications.`,
    alternates: {
      canonical: `/en/coauthors/${slug}/`,
      languages: {
        "tr-TR": `/tr/ortak-yazarlar/${slug}/`,
        "en-US": `/en/coauthors/${slug}/`,
      },
    },
  });
}

export default async function HistoricalCoauthorPage({ params }: Props) {
  const { slug } = await params;
  const group = findHistoricalAuthorGroup(slug);
  if (!group) notFound();
  return <HistoricalAuthorGroupPage group={group} locale="en" />;
}
