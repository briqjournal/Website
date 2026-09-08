import {
  annualReports,
  findArchiveArticle,
  findArchiveIssue,
} from "../../archive";

const LEGACY_FILE_ROOT = "https://briqjournal.com/sites/default/files/";

function safeSource(source: string | null | undefined) {
  return source?.startsWith(LEGACY_FILE_ROOT) ? source : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string[] }> },
) {
  const { file } = await params;
  let source: string | null = null;
  let downloadName = "briq.pdf";

  if (file.length === 3 && file[0] === "makale") {
    const article = findArchiveArticle(file[1]);
    const locale = file[2] === "en.pdf" ? "en" : file[2] === "tr.pdf" ? "tr" : null;
    if (article && locale) {
      source = safeSource(
        locale === "tr" ? article.pdf_tr_source : article.pdf_en_source,
      );
      downloadName = `${article.slug}-${locale}.pdf`;
    }
  }

  if (file.length === 3 && file[0] === "sayi") {
    const match = file[1].match(/^cilt-(\d+)-sayi-(\d+)$/);
    const locale = file[2] === "en.pdf" ? "en" : file[2] === "tr.pdf" ? "tr" : null;
    if (match && locale) {
      const issue = findArchiveIssue(Number(match[1]), Number(match[2]));
      if (issue) {
        source = safeSource(
          locale === "tr" ? issue.pdf_tr_source : issue.pdf_en_source,
        );
        downloadName = `briq-cilt-${issue.volume}-sayi-${issue.issue}-${locale}.pdf`;
      }
    }
  }

  if (file.length === 3 && file[0] === "rapor") {
    const report = annualReports.find((item) => item.number === Number(file[1]));
    const locale = file[2] === "en.pdf" ? "en" : file[2] === "tr.pdf" ? "tr" : null;
    if (report && locale) {
      source = safeSource(locale === "tr" ? report.pdfTrSource : report.pdfEnSource);
      downloadName = `briq-${report.number}-yil-raporu-${locale}.pdf`;
    }
  }

  if (!source) return new Response("PDF bulunamadı.", { status: 404 });

  const upstream = await fetch(source, {
    headers: { Accept: "application/pdf" },
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("PDF kaynağına ulaşılamadı.", { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${downloadName}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
