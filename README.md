# BRIQ Academic Journal

BRIQ'in Türkçe ve İngilizce yayın sitesi. Uygulama Next.js uyumlu Vinext
üzerinde derlenir ve Cloudflare Worker + statik varlıklar olarak çalışır.

## Geliştirme

Gereksinimler: Node.js 22.13 veya üzeri, Linux, GNU `timeout`.

```bash
npm ci
npm run dev
npm run build
```

`npm run build`, modüler içerik kaynaklarını doğrular; arşiv, arama ve PDF
yönlendirme verilerini üretir; tam metinleri makale başına tembel yüklenen
modüllere dönüştürür; statik sayfaları oluşturur ve performans bütçelerini
uygular.

## Kanonik içerik mimarisi

- `content/catalog.json`: sayı, makale ve tam metin sıralarını tanımlar.
- `content/issues/vNN-iNN.json`: tek bir sayının künyesi ve makale sırası.
- `content/articles/<slug>/metadata.json`: tek bir makalenin iki dilli yayın kaydı.
- `content/articles/<slug>/fulltext/current.json`: güncel dönem iki dilli tam metni.
- `content/articles/<slug>/fulltext/en-archive.json`: arşiv İngilizce tam metni.
- `content/articles/<slug>/fulltext/saudi-en.json`: ayrı işlenen Suudi Arabistan İngilizce tam metni.

`app/archive-data.json` ve `app/article-fulltext-*.json` derleme sırasında
uyumluluk amacıyla üretilir, Git'e eklenmez ve elle düzenlenmez. Eski içe
aktarım araçları bu dosyaları güncellerse değişiklikler hemen
`npm run import:content -- --archive` veya `--fulltext` ile kanonik
`content/` kaynaklarına aktarılmalıdır.

Makale ve kurumsal içerik rotaları derleme sırasında önceden oluşturulur.
Normal okuyucu trafiği ağır arşiv verilerini Worker belleğinde her istek için
yeniden işlemez.

## PDF arşivi

PDF'ler Cloudflare R2'de tutulur ve Worker tarafından Range/HEAD desteğiyle
akış halinde sunulur. Git deposuna PDF eklemeyin. Yenileme işlemi
`.github/workflows/refresh-pdf-archive.yml` üzerinden yapılır ve envanter
değişiklikleri için otomatik PR açar.

## Dağıtım

Sites kimliği `.openai/hosting.json` içindedir. GitHub'daki kaynak ile canlı
Sites sürümü aynı commit'e sabitlenmeli; doğrulanmamış bir kaynak arşiviyle
manuel dağıtım yapılmamalıdır.
