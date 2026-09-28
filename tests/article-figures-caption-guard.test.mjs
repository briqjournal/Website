import assert from "node:assert/strict";
import test from "node:test";
import { articleFigureDisplayCaption, articleFigureKind, articleFigureLabel } from "../app/components/ArticleFigures.tsx";

test("article figure helpers tolerate empty and missing captions", () => {
  const missing = { id: "figure-missing", src: "/figure.jpg" };
  const empty = { id: "figure-empty", src: "/figure-2.jpg", caption: "" };
  assert.equal(articleFigureKind(missing), "visual");
  assert.equal(articleFigureDisplayCaption(missing), "");
  assert.equal(articleFigureLabel(missing, [missing, empty], "en"), "Visual 1");
  assert.equal(articleFigureKind(empty), "visual");
  assert.equal(articleFigureDisplayCaption(empty), "");
});
