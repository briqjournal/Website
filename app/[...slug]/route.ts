export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const target = new URL(request.url);
  target.pathname = `/tr/${slug.map(encodeURIComponent).join("/")}`;
  return Response.redirect(target, 308);
}
