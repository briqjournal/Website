import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildArchiveData } from "./content-store.mjs";

const root = process.cwd();
const archive = await buildArchiveData(root);
const output = join(root, "app/archive-data.json");
await mkdir(join(root, "app"), { recursive: true });
await writeFile(output, `${JSON.stringify(archive, null, 2)}\n`, "utf8");
console.log(`Generated ${archive.issues.length} issues and ${archive.articles.length} article records in app/archive-data.json.`);
