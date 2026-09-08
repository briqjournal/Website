import { NextResponse } from "next/server";
import { articleCitation } from "../../article-citation";
import { findArchiveArticle } from "../../archive";
import { splitAuthorNames } from "../../authors";

function escapeBib(value: string) {
  return value.replace(/[{}]/g, "").replace(/&/g, "\\&");
}

export async function GET(request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const match = file.match(/^(.+)\.(ris|bib|enw)$/i);
  if (!match) return new NextResponse("Unsupported citation format", { status: 404 });
  const article = findArchiveArticle(match[1]);
  if (!article) return new NextResponse("Article not found", { status: 404 });
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "tr";
  const title = locale === "tr" ? article.title_tr : (article.title_en || article.title_tr);
  const journal = locale === "tr" ? "BRIQ Kuşak ve Yol Girişimi Dergisi" : "BRIQ Belt & Road Initiative Quarterly";
  const authors = splitAuthorNames(article.author);
  const doiUrl = article.doi ? `https://doi.org/${article.doi}` : "";
  let body = "";
  let contentType = "text/plain; charset=utf-8";

  if (match[2].toLowerCase() === "ris") {
    body = [
      "TY  - JOUR",
      ...authors.map((author) => `AU  - ${author}`),
      `TI  - ${title}`,
      `JO  - ${journal}`,
      `VL  - ${article.volume}`,
      `IS  - ${article.issue}`,
      article.pages ? `SP  - ${article.pages.split(/[-–]/)[0]}` : "",
      article.pages?.match(/[-–](\d+)/)?.[1] ? `EP  - ${article.pages.match(/[-–](\d+)/)?.[1]}` : "",
      `PY  - ${article.year}`,
      article.doi ? `DO  - ${article.doi}` : "",
      doiUrl ? `UR  - ${doiUrl}` : "",
      "ER  - ",
    ].filter(Boolean).join("\r\n");
    contentType = "application/x-research-info-systems; charset=utf-8";
  } else if (match[2].toLowerCase() === "bib") {
    const key = `${authors[0]?.split(/\s+/).pop() || "BRIQ"}${article.year}`.replace(/\W/g, "");
    body = `@article{${key},\n  author = {${authors.map(escapeBib).join(" and ")}},\n  title = {${escapeBib(title)}},\n  journal = {${escapeBib(journal)}},\n  year = {${article.year}},\n  volume = {${article.volume}},\n  number = {${article.issue}}${article.pages ? `,\n  pages = {${article.pages.replace("–", "--")}}` : ""}${article.doi ? `,\n  doi = {${article.doi}},\n  url = {${doiUrl}}` : ""}\n}\n`;
    contentType = "application/x-bibtex; charset=utf-8";
  } else {
    body = [
      "%0 Journal Article",
      ...authors.map((author) => `%A ${author}`),
      `%T ${title}`,
      `%J ${journal}`,
      `%V ${article.volume}`,
      `%N ${article.issue}`,
      article.pages ? `%P ${article.pages}` : "",
      `%D ${article.year}`,
      article.doi ? `%R ${article.doi}` : "",
      doiUrl ? `%U ${doiUrl}` : "",
      `%Z ${articleCitation(article, locale)}`,
    ].filter(Boolean).join("\r\n");
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${article.slug}.${match[2].toLowerCase()}"`,
    },
  });
}

