import { permanentRedirect } from "next/navigation";

/**
 * English is the site's fixed default locale.
 * Cloudflare handles GET/HEAD at "/" as a single 308 hop in production.
 * Keep the framework route as a matching permanent redirect fallback.
 */
export default function Home() {
  permanentRedirect("/en/");
}
