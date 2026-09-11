export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://briqjournal.com").replace(/\/$/, "");

export function absoluteSiteUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).toString();
}
