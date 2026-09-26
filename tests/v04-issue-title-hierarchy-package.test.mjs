import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 4 issue title hierarchy is shared across Turkish and English", async () => {
  const copy = await readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8");

  assert.match(
    copy,
    /"4-3": \{[\s\S]*tr: \{ title: "Çok Kutuplu Dünyada NATO’nun Genişlemesi Ve Güvenlik İşbirliğinin Geleceği", subtitle: "" \},[\s\S]*en: \{ title: "NATO’s Enlargement and the Future of Security Cooperation in a Multipolar World", subtitle: "" \}/,
  );
  assert.match(
    copy,
    /"4-2": \{[\s\S]*tr: \{ title: "Kuşak Ve Yol Girişimi Fırsatı", subtitle: "Akdeniz’i Barış Ve Kalkınma Denizi Yapmak İçin" \},[\s\S]*en: \{ title: "The Belt & Road Alternative", subtitle: "Transforming the Mediterranean into a Sea of Peace and Development" \}/,
  );
  assert.match(
    copy,
    /"4-1": \{[\s\S]*tr: \{ title: "Doğu Akdeniz", subtitle: "NATO’nun Yeni Savaş Cephesi" \},[\s\S]*en: \{ title: "The Eastern Mediterranean", subtitle: "NATO’s New Frontline" \}/,
  );

  const layoutBlock = copy.match(/const subtitleFirstIssues = new Set\(\[([\s\S]*?)\]\);/)?.[1] ?? "";
  assert.match(layoutBlock, /"4-2"/);
  assert.match(layoutBlock, /"4-1"/);
  assert.doesNotMatch(layoutBlock, /"4-3"/);
});
