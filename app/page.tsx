import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LocaleGateway() {
  const country = (await headers()).get("cf-ipcountry")?.toUpperCase();
  redirect(country === "TR" ? "/tr" : "/en");
}
