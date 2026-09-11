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

`npm run build`, tam metinleri makale başına ayrı modüllere böler, hafif
arama/PDF yönlendirme verilerini üretir, Sites çıktısını doğrular ve performans
bütçelerini uygular.

## Veri mimarisi

- `app/archive-data.json`: sunucu tarafındaki doğrulanmış yayın kaydı.
- `app/generated-fulltext/`: derleme sırasında üretilen, makale başına tembel
  yüklenen tam metin modülleri; Git'e eklenmez.
- `public/assets/data/article-search-index.json`: kullanıcı arama yaptığında
  tarayıcıya alınan özet dizini; derleme sırasında üretilir ve Git'e eklenmez.
- `ops/pdf-archive-manifest.json`: R2 PDF envanteri; web sitesinde statik
  varlık olarak yayımlanmaz.

Makale ve kurumsal içerik rotaları derleme sırasında önceden oluşturulur.
Böylece normal okuyucu trafiği, ağır arşiv JSON'unu Worker belleğinde her istek
için yeniden işlemek zorunda kalmaz.

## PDF arşivi

PDF'ler Cloudflare R2'de tutulur ve Worker tarafından Range/HEAD desteğiyle
akış halinde sunulur. Git deposuna PDF eklemeyin. Yenileme işlemi
`.github/workflows/refresh-pdf-archive.yml` üzerinden yapılır ve envanter
değişiklikleri için otomatik PR açar.

## Dağıtım

Sites kimliği `.openai/hosting.json` içindedir. GitHub'daki kaynak ile canlı
Sites sürümü aynı commit'e sabitlenmeli; doğrulanmamış bir kaynak arşiviyle
manuel dağıtım yapılmamalıdır.

