import {
  archiveArticles,
  archiveIssues,
  publicationType,
} from "./archive";
import { issueTheme } from "./issue-themes";

export type ArchiveArticleListing = {
  slug: string;
  volume: number;
  issue: number;
  year: string;
  author: string;
  titleTr: string;
  titleEn: string;
  doi: string;
  typeTr: string;
  typeEn: string;
};

export type ArchiveIssueListing = {
  volume: number;
  issue: number;
  seasonTr: string;
  seasonEn: string;
  year: string;
  coverTr: string;
  coverEn: string;
  themeTr: string;
  themeEn: string;
};

export const archiveArticleListings: ArchiveArticleListing[] = archiveArticles.map((article) => ({
  slug: article.slug,
  volume: article.volume,
  issue: article.issue,
  year: article.year,
  author: article.author,
  titleTr: article.title_tr,
  titleEn: article.title_en || article.title_tr,
  doi: article.doi || "",
  typeTr: publicationType(article, "tr"),
  typeEn: publicationType(article, "en"),
}));

export const archiveIssueListings: ArchiveIssueListing[] = archiveIssues.map((issue) => ({
  volume: issue.volume,
  issue: issue.issue,
  seasonTr: issue.season_tr,
  seasonEn: issue.season_en,
  year: issue.year,
  coverTr: issue.cover_tr,
  coverEn: issue.cover_en,
  themeTr: issueTheme(issue.volume, issue.issue, "tr"),
  themeEn: issueTheme(issue.volume, issue.issue, "en"),
}));

