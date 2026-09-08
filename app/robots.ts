import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://briq-academic-journal.iakfiratt.chatgpt.site/sitemap.xml",
  };
}
