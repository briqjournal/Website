import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("image-width-audit", `${process.pid}-${Date.now()}`);

async function makeWorker() {
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

function imageEnv(observed) {
  return {
    ASSETS: {
      fetch: async (req) => {
        const pathname = new URL(req.url).pathname;
        assert.match(pathname, /^\/assets\/archive\/covers\/cilt-[0-9]+-sayi-[0-9]+-en\.(jpg|png)$/);
        return new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
          status: 200,
          headers: { "content-type": "image/jpeg" },
        });
      },
    },
    IMAGES: {
      input: () => ({
        transform: (options) => {
          observed.push(options);
          return {
            output: () => Promise.resolve({
              response: () => new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
                status: 200,
                headers: { "content-type": "image/jpeg" },
              }),
            }),
          };
        },
      }),
    },
  };
}

function imageUrl(width) {
  const url = new URL("https://briqjournal.com/_vinext/image");
  url.searchParams.set("url", "/assets/archive/covers/cilt-1-sayi-1-en.jpg");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", "75");
  return url;
}

test("historically requested 480px and 720px cover images are accepted", async () => {
  const worker = await makeWorker();
  for (const width of [480, 720, 640]) {
    const observed = [];
    const response = await worker.fetch(
      new Request(imageUrl(width)),
      imageEnv(observed),
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(response.status, 200, `expected image response for ${width}px`);
    assert.deepEqual(observed, [{ width }], `image transform for ${width}px`);
  }
});

test("arbitrary unapproved image widths are still rejected", async () => {
  const worker = await makeWorker();
  const observed = [];
  for (const width of [479, 721]) {
    const response = await worker.fetch(
      new Request(imageUrl(width)),
      imageEnv(observed),
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(response.status, 400, `reject unsupported ${width}px`);
  }
  assert.deepEqual(observed, [], "no image transformation for rejected widths");
});
