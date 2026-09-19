import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const targets = [
  ["carbon", "content/articles/turk-devletleri-teskilati-ve-kusak-yol-birlikteliginde-yeni-bir-karbon-piyasasinin-olusturulmasinin/metadata.json"],
  ["tatar", "content/articles/kuzey-kibris-turk-cumhuriyetinin-turk-devletleri-teskilatina-katiliminin-islevi/metadata.json"],
  ["newasia", "content/articles/yeni-asya-jeopolitigi-baglaminda-turk-devletleri-teskilati/metadata.json"],
];

test("probe v05-i04 official PDF image inventories", () => {
  const work = mkdtempSync(join(tmpdir(), "v05-i04-probe-"));
  for (const [key, metaPath] of targets) {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    const pdf = join(work, key + ".pdf");
    execFileSync("curl", ["-L", "--fail", "--retry", "3", meta.urls.pdfEn, "-o", pdf], { stdio: ["ignore", "ignore", "inherit"] });
    const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
    const images = execFileSync("pdfimages", ["-list", pdf], { encoding: "utf8" });
    console.log("\n=== V05I04_PROBE " + key + " ===\n" + info.match(/^Pages:.*$/m)?.[0] + "\n" + images);
    assert.match(info, /^Pages:\s+\d+/m);
  }
});
