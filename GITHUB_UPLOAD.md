# GitHub repository kullanımı

Bu depo BRIQ sitesinin kaynak kodunu, görsellerini ve hafif arşiv envanterini
içerir. PDF dosyaları Git'e veya Sites derleme çıktısına eklenmez; Cloudflare
R2 üzerinden sunulur.

## Yerel çalışma

```bash
git clone https://github.com/briqjournal/Website.git
cd Website
npm ci
npm run build
```

Git LFS gerekmez. Değişiklikler bir özellik dalında hazırlanmalı, doğrulama
tamamlandıktan sonra pull request ile `main` dalına alınmalıdır.

## PDF arşivi

PDF envanteri `ops/pdf-archive-manifest.json` dosyasındadır. Her kayıt kaynak
adresi, R2 nesne yolu, dosya boyutu ve SHA-256 özetini taşır.

Arşivi yenilemek için GitHub Actions ekranındaki
`Refresh PDF archive in Cloudflare R2` iş akışı elle çalıştırılır. İş akışı:

1. kaynak PDF'leri geçici çalışma alanına indirir ve doğrular;
2. dosyaları R2'ye yükler;
3. R2'deki her nesnenin boyutunu envanterle karşılaştırır;
4. Git'e hiçbir PDF eklemeden yalnızca envanter değişiklikleri için PR açar.

