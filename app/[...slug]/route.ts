import { archiveArticles } from "../archive";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const target = new URL(request.url);
  const key = slug.join("/");
  const directArticle = archiveArticles.find((article) => article.slug === key);
  if (directArticle) {
    target.pathname = `/tr/makaleler/${directArticle.slug}`;
    return Response.redirect(target, 308);
  }
  target.pathname = `/tr/${slug.map(encodeURIComponent).join("/")}`;
  return Response.redirect(target, 308);
}
