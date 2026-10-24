import { authorProfiles, type AuthorProfile } from "./authors";
import type { ArchiveArticle } from "./archive";

/**
 * Reviewed legacy Drupal combined-author identities from GSC's 2026-10-16
 * canonical report. These are historic profile slugs, NOT new individual authors.
 * Member slugs were checked against the live bilingual author catalogue; each
 * group has at least one published work attributed to every listed member.
 * No archival biography is transcribed or synthesized here.
 */
export const historicalAuthorGroups = [
  {
    "slug": "amit-kumar-ve-dr-veena-ramachandran",
    "members": [
      "amit-kumar",
      "veena-ramachandran"
    ]
  },
  {
    "slug": "cheng-enfu-ve-li-jing",
    "members": [
      "cheng-enfu",
      "li-jing"
    ]
  },
  {
    "slug": "cheng-enfu-ve-lu-chunyi",
    "members": [
      "cheng-enfu",
      "lu-chunyi"
    ]
  },
  {
    "slug": "dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache",
    "members": [
      "bassam-abu-abdullah",
      "ziad-ayoub-arbache"
    ]
  },
  {
    "slug": "dr-mohamad-zreik-prof-dr-zhao-changfeng",
    "members": [
      "mohamad-zreik",
      "zhao-changfeng"
    ]
  },
  {
    "slug": "dr-ogr-uyesi-assadollah-athari-ve-dr-ehsan-ejazi",
    "members": [
      "assadollah-athari",
      "ehsan-ejazi"
    ]
  },
  {
    "slug": "efe-can-gurcan-ve-omer-ersin-kahraman",
    "members": [
      "efe-can-gurcan",
      "omer-ersin-kahraman"
    ]
  },
  {
    "slug": "fahri-erenel-ahmet-gedik",
    "members": [
      "fahri-erenel",
      "ahmet-gedik"
    ]
  },
  {
    "slug": "fang-chenyu-ve-wang-weibin",
    "members": [
      "fang-chenyu",
      "wang-weibin"
    ]
  },
  {
    "slug": "liu-ningning-cheng-enfu",
    "members": [
      "liu-ningning",
      "cheng-enfu"
    ]
  },
  {
    "slug": "luis-kato-maldonado-ve-guadalupe-huerta-moreno",
    "members": [
      "luis-kato-maldonado",
      "guadalupe-huerta-moreno"
    ]
  },
  {
    "slug": "necati-demircan-ye-zhangxu",
    "members": [
      "necati-demircan",
      "ye-zhangxu"
    ]
  },
  {
    "slug": "prof-dr-song-shuli-prof-dr-cheng-enfu",
    "members": [
      "song-shuli",
      "cheng-enfu"
    ]
  },
  {
    "slug": "prof-dr-sun-degang-dr-aml-ali-abdrabou",
    "members": [
      "sun-degang",
      "aml-ali-abdrabou"
    ]
  },
  {
    "slug": "prof-dr-sun-degang-zhang-jieying",
    "members": [
      "sun-degang",
      "zhang-jieying"
    ]
  },
  {
    "slug": "semih-guneri-ayca-avci-ahmet-z-bayburt",
    "members": [
      "semih-guneri",
      "ayca-avci",
      "ahmet-z-bayburt"
    ]
  },
  {
    "slug": "shangtao-gao-jessica-durdu",
    "members": [
      "shangtao-gao",
      "jessica-durdu"
    ]
  },
  {
    "slug": "wenbo-zhang-quan-heng",
    "members": [
      "wenbo-zhang",
      "quan-heng"
    ]
  },
  {
    "slug": "yang-chen-ma-jinting",
    "members": [
      "yang-chen",
      "ma-jinting"
    ]
  },
  {
    "slug": "zhang-qingyi-du-donghui",
    "members": [
      "zhang-qingyi",
      "du-donghui"
    ]
  },
  {
    "slug": "zhang-yan-jun-liu-yu-jun",
    "members": [
      "zhang-yan-jun",
      "liu-yu-jun"
    ]
  }
] as const;

export type HistoricalAuthorGroup = {
  slug: string;
  members: AuthorProfile[];
  articles: ArchiveArticle[];
};

export function findHistoricalAuthorGroup(slug: string): HistoricalAuthorGroup | undefined {
  const record = historicalAuthorGroups.find((group) => group.slug === slug);
  if (!record) return undefined;
  const members = record.members
    .map((id) => authorProfiles.find((profile) => profile.id === id))
    .filter((profile): profile is AuthorProfile => Boolean(profile));
  if (members.length !== record.members.length) return undefined;
  const articles = members[0].articles.filter((article) =>
    members.every((member) => member.articles.some((work) => work.slug === article.slug)),
  );
  if (!articles.length) return undefined;
  return { slug, members, articles };
}
