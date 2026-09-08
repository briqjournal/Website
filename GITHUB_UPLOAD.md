# GitHub repository kullanımı

Bu repository BRIQ sitesinin düzenlenebilir kaynak kodunu, görsellerini ve
yerelleştirilmiş PDF arşivini içerir. PDF arşivinde 609 benzersiz dosya bulunur.

## Yerel çalışma

PDF arşivi yaklaşık 3,4 GiB olduğu için Git LFS gereklidir:

```bash
git lfs install
git clone https://github.com/briqjournal/Website.git
cd Website
git lfs pull
npm ci
npm test
```

Kod değişiklikleri normal Git commit ve pull request akışıyla yönetilebilir.
Mevcut `main` dalını zorla ezmeyin.

## PDF arşivi

PDF envanteri `public/assets/archive/pdfs/manifest.json` dosyasındadır. Her
kayıtta kaynak adresi, yerel yol, dosya boyutu ve SHA-256 özeti yer alır. Arşivi
yenilemek için GitHub Actions ekranındaki `Sync PDF archive` iş akışı elle
çalıştırılabilir.
