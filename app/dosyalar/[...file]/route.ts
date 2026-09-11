import pdfRoutesJson from "../../generated-runtime/pdf-routes.json";

const pdfRoutes = pdfRoutesJson as Record<string, string>;

async function redirectLegacyPdf(
  request: Request,
  { params }: { params: Promise<{ file: string[] }> },
) {
  const { file } = await params;
  const target = pdfRoutes[file.join("/")];
  if (!target?.startsWith("/assets/") || !target.toLowerCase().endsWith(".pdf")) {
    return new Response("PDF bulunamadı.", { status: 404 });
  }

  return Response.redirect(new URL(target, request.url), 308);
}

export const GET = redirectLegacyPdf;
export const HEAD = redirectLegacyPdf;
