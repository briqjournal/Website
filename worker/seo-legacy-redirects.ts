/**
 * Reviewed legacy URLs from Google Search Console's 2026-10-16 404 sample.
 * Targets are existing, language-correct BRIQ routes or verified R2 PDF keys.
 * Do not add speculative article redirects or route unrelated content home.
 */
export const SEO_LEGACY_REDIRECTS: Record<string, string> = {
  // GSC alternative-canonical legacy article aliases, verified against the
  // authoritative Volume 1 Issue 4 English published record (2020):
  // title, publication type, first author, issue/page range and PDF asset.
  // Direct 301s prevent the former /en/articles/ intermediate paths from
  // returning 404. Existing Drupal entry aliases already reach these targets.
  "/en/articles/photograph-fujian-huian-maidens-weaving-net": "/en/articles/fujian-huian-maidens-weaving-net/", // Ni Min · photograph · BRIQ 1(4), p. 94 (2020)
  "/en/articles/history-the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/", // Mesud Sadrmohammadi · history · BRIQ 1(4), pp. 85–90 (2020)
  "/en/articles/book-review-post-covid-19-global-system-old-problems-new-trends": "/en/articles/post-covid-19-global-system-old-problems-new-trends/", // Serdar Yurtçiçek · book review · BRIQ 1(4), pp. 91–93 (2020)

  // 2026-10-25 GSC alternative-canonical audit: 103 exact historical author
  // profile aliases in the currently 404 cohort. All destinations were
  // checked as published individual profiles: HTTP 200 and in sitemap.xml.
  // Joint-source aliases target verified first authors; no group pages.
  // Uncertain identities (including Yang Guang, Inan Oner, Bassam/Ziad and
  // historical CMS admin accounts) deliberately remain unmapped.
  "/tr/yazar/prof-dr-ahmet-kavas": "/tr/yazar/ahmet-kavas/",
  "/tr/yazar/prof-dr-li-xi": "/tr/yazar/li-xi/",
  "/en/authors/8": "/en/authors/dominik-pietzcker/",
  "/tr/yazar/dr-ramzy-baroud": "/tr/yazar/ramzy-baroud/",
  "/en/authors/prof-dr-emin-gurses": "/en/authors/emin-gurses/",
  "/en/authors/prof-dr-ugur-murat-leloglu": "/en/authors/ugur-murat-leloglu/",
  "/tr/yazar/dr-ceyhun-ilsever": "/tr/yazar/ceyhun-ilsever/",
  "/tr/yazar/cheng-enfu-ve-li-jing": "/tr/yazar/cheng-enfu/",
  "/tr/yazar/prof-dr-ugur-murat-leloglu": "/tr/yazar/ugur-murat-leloglu/",
  "/tr/yazar/dr-hande-gunozu": "/tr/yazar/hande-gunozu/",
  "/en/authors/dr-hande-gunozu": "/en/authors/hande-gunozu/",
  "/en/authors/prof-dr-sun-degang": "/en/authors/sun-degang/",
  "/tr/yazar/dr-mehmet-perincek": "/tr/yazar/mehmet-perincek/",
  "/tr/yazar/necati-demircan-ye-zhangxu": "/tr/yazar/necati-demircan/",
  "/en/authors/7": "/en/authors/mehmet-adnan-akfirat/",
  "/tr/yazar/dr-sean-thomas-mckenna": "/tr/yazar/sean-thomas-mckenna/",
  "/en/authors/prof-dr-li-xi": "/en/authors/li-xi/",
  "/en/authors/sultan-hem-ve-degang-sun": "/en/authors/hend-elmahly-mahmoud-sultan/",
  "/en/authors/dr-sean-thomas-mckenna": "/en/authors/sean-thomas-mckenna/",
  "/tr/yazar/assoc-prof-dr-aleksandr-sotnicenko": "/tr/yazar/aleksandr-sotnicenko/",
  "/en/authors/dr-francisco-dominguez": "/en/authors/francisco-dominguez/",
  "/tr/yazar/yi-shaoxuan-yang-chen": "/tr/yazar/yi-shaoxuan/",
  "/tr/yazar/prof-dr-birol-kilkis": "/tr/yazar/birol-kilkis/",
  "/en/authors/prof-jinghua-cao": "/en/authors/jinghua-cao/",
  "/tr/yazar/prof-dr-semih-koray": "/tr/yazar/semih-koray/",
  "/tr/yazar/yang-chen-ma-jinting": "/tr/yazar/yang-chen/",
  "/tr/yazar/dr-mohamad-zreik-prof-dr-zhao-changfeng": "/tr/yazar/mohamad-zreik/",
  "/tr/yazar/dr-ogr-uyesi-assadollah-athari-ve-dr-ehsan-ejazi": "/tr/yazar/assadollah-athari/",
  "/tr/yazar/7": "/tr/yazar/mehmet-adnan-akfirat/",
  "/tr/yazar/assoc-prof-dr-yang-chen": "/tr/yazar/yang-chen/",
  "/tr/yazar/doc-dr-efe-can-gurcan": "/tr/yazar/efe-can-gurcan/",
  "/tr/yazar/prof-dr-emin-gurses": "/tr/yazar/emin-gurses/",
  "/en/authors/prof-dr-mehmet-celal-ozdogan": "/en/authors/mehmet-celal-ozdogan/",
  "/tr/yazar/doc-dr-siir-kilkis": "/tr/yazar/siir-kilkis/",
  "/en/authors/dr-can-ulusoy": "/en/authors/can-ulusoy/",
  "/en/authors/prof-dr-song-shuli-prof-dr-cheng-enfu": "/en/authors/song-shuli/",
  "/tr/yazar/mao-zedung": "/tr/yazar/mao-zedong/",
  "/tr/yazar/wang-laixi-na-risu-wu-lan": "/tr/yazar/wang-laixi/",
  "/en/authors/wang-laixi-na-risu-wu-lan": "/en/authors/wang-laixi/",
  "/tr/yazar/zhang-yan-jun-liu-yu-jun": "/tr/yazar/zhang-yan-jun/",
  "/tr/yazar/prof-dr-sun-degang-dr-aml-ali-abdrabou": "/tr/yazar/sun-degang/",
  "/en/authors/prof-dr-gunay-cifci": "/en/authors/gunay-cifci/",
  "/en/authors/zhang-qingyi-du-donghui": "/en/authors/zhang-qingyi/",
  "/tr/yazar/igor-korotchenko": "/tr/yazar/igor-korotcenko/",
  "/tr/yazar/sule-perincek": "/tr/yazar/h-sule-perincek/",
  "/tr/yazar/expert-committee-shanghai-energy-conservation-commission": "/tr/yazar/expert-committee-of-shanghai-energy-conservation-commission/",
  "/en/authors/zhang-yan-jun-liu-yu-jun": "/en/authors/zhang-yan-jun/",
  "/en/authors/prof-dr-guo-changgang": "/en/authors/guo-changgang/",
  "/en/authors/igor-korotchenko": "/en/authors/igor-korotcenko/",
  "/tr/yazar/liu-ningning-cheng-enfu": "/tr/yazar/liu-ningning/",
  "/tr/yazar/prof-dr-sun-degang": "/tr/yazar/sun-degang/",
  "/en/authors/necati-demircan-ye-zhangxu": "/en/authors/necati-demircan/",
  "/tr/yazar/prof-dr-mehmet-celal-ozdogan": "/tr/yazar/mehmet-celal-ozdogan/",
  "/tr/yazar/8": "/tr/yazar/dominik-pietzcker/",
  "/en/authors/prof-dr-david-laibman": "/en/authors/david-laibman/",
  "/tr/yazar/zhang-qingyi-du-donghui": "/tr/yazar/zhang-qingyi/",
  "/en/authors/prof-dr-semih-koray": "/en/authors/semih-koray/",
  "/en/authors/cheng-enfu-ve-lu-chunyi": "/en/authors/cheng-enfu/",
  "/en/authors/prof-ding-xiaoqin": "/en/authors/ding-xiaoqin/",
  "/en/authors/doc-dr-han-zhimin": "/en/authors/han-zhimin/",
  "/en/authors/liu-ningning-cheng-enfu": "/en/authors/liu-ningning/",
  "/en/authors/expert-committee-shanghai-energy-conservation-commission": "/en/authors/expert-committee-of-shanghai-energy-conservation-commission/",
  "/en/authors/sule-perincek": "/en/authors/h-sule-perincek/",
  "/en/authors/assoc-prof-dr-aleksandr-sotnicenko": "/en/authors/aleksandr-sotnicenko/",
  "/tr/yazar/prof-dr-gunay-cifci": "/tr/yazar/gunay-cifci/",
  "/tr/yazar/cheng-enfu-ve-lu-chunyi": "/tr/yazar/cheng-enfu/",
  "/tr/yazar/doc-dr-han-zhimin": "/tr/yazar/han-zhimin/",
  "/tr/yazar/prof-ding-xiaoqin": "/tr/yazar/ding-xiaoqin/",
  "/en/authors/dr-mohamad-zreik-prof-dr-zhao-changfeng": "/en/authors/mohamad-zreik/",
  "/en/authors/prof-caner-karavit": "/en/authors/caner-karavit/",
  "/en/authors/drarif-acaloglu": "/en/authors/arif-acaloglu/",
  "/en/authors/fahri-erenel-ahmet-gedik": "/en/authors/fahri-erenel/",
  "/en/authors/luis-kato-maldonado-ve-guadalupe-huerta-moreno": "/en/authors/luis-kato-maldonado/",
  "/en/authors/dr-digby-james-wren": "/en/authors/digby-james-wren/",
  "/tr/yazar/fahri-erenel-ahmet-gedik": "/tr/yazar/fahri-erenel/",
  "/tr/yazar/drarif-acaloglu": "/tr/yazar/arif-acaloglu/",
  "/en/authors/prof-dr-radhika-desai": "/en/authors/radhika-desai/",
  "/tr/yazar/semih-guneri-ayca-avci-ahmet-z-bayburt": "/tr/yazar/semih-guneri/",
  "/en/authors/dr-tulin-uygur": "/en/authors/tulin-uygur/",
  "/en/authors/prof-cheng-enfu": "/en/authors/cheng-enfu/",
  "/en/authors/amit-kumar-ve-dr-veena-ramachandran": "/en/authors/amit-kumar/",
  "/tr/yazar/prof-dr-radhika-desai": "/tr/yazar/radhika-desai/",
  "/tr/yazar/dr-ali-sahin": "/tr/yazar/ali-sahin/",
  "/tr/yazar/sultan-hem-ve-degang-sun": "/tr/yazar/hend-elmahly-mahmoud-sultan/",
  "/en/authors/dr-ramzy-baroud": "/en/authors/ramzy-baroud/",
  "/en/authors/semih-guneri-ayca-avci-ahmet-z-bayburt": "/en/authors/semih-guneri/",
  "/tr/yazar/efe-can-gurcan-ve-omer-ersin-kahraman": "/tr/yazar/efe-can-gurcan/",
  "/en/authors/prof-dr-birol-kilkis": "/en/authors/birol-kilkis/",
  "/en/authors/doc-dr-siir-kilkis": "/en/authors/siir-kilkis/",
  "/tr/yazar/prof-dr-guo-changgang": "/tr/yazar/guo-changgang/",
  "/en/authors/degang-sun-yingqi-yang": "/en/authors/sun-degang/",
  "/tr/yazar/dr-alexandr-bovdunov": "/tr/yazar/alexandr-bovdunov/",
  "/en/authors/wenbo-zhang-quan-heng": "/en/authors/wenbo-zhang/",
  "/en/authors/doc-dr-efe-can-gurcan": "/en/authors/efe-can-gurcan/",
  "/tr/yazar/shangtao-gao-jessica-durdu": "/tr/yazar/shangtao-gao/",
  "/en/authors/yi-shaoxuan-yang-chen": "/en/authors/yi-shaoxuan/",
  "/tr/yazar/dr-ersel-zafer-oral": "/tr/yazar/ersel-zafer-oral/",
  "/en/authors/assoc-prof-dr-yang-chen": "/en/authors/yang-chen/",
  "/en/authors/prof-dr-ahmet-kavas": "/en/authors/ahmet-kavas/",
  "/en/authors/shangtao-gao-jessica-durdu": "/en/authors/shangtao-gao/",
  "/tr/yazar/dr-tulin-uygur": "/tr/yazar/tulin-uygur/",
  "/tr/yazar/dr-can-ulusoy": "/tr/yazar/can-ulusoy/",
  "/tr/yazar/prof-dr-ufuk-tutan": "/tr/yazar/ufuk-tutan/",

  // Reviewed 2026-10-16 GSC canonical sample: exact English Drupal author
  // aliases, matched to existing English author profiles and publication order.
  // Never create joint-author pages or redirect ambiguous identities to one author.
  "/en/user/fahri-erenel-ahmet-gedik": "/en/authors/fahri-erenel/",
  "/en/user/liu-ningning-cheng-enfu": "/en/authors/liu-ningning/",
  "/en/user/wenbo-zhang-quan-heng": "/en/authors/wenbo-zhang/",
  "/en/user/shangtao-gao-jessica-durdu": "/en/authors/shangtao-gao/",
  "/en/user/8": "/en/authors/dominik-pietzcker/",
  "/en/user/necati-demircan-ye-zhangxu": "/en/authors/necati-demircan/",
  "/en/user/dr-mohamad-zreik-prof-dr-zhao-changfeng": "/en/authors/mohamad-zreik/",
  "/en/user/luis-kato-maldonado-ve-guadalupe-huerta-moreno": "/en/authors/luis-kato-maldonado/",
  "/en/user/sitki-rifat": "/en/authors/sitki-firat/",
  "/en/user/prof-dr-sun-degang-zhang-jieying": "/en/authors/sun-degang/",
  "/en/user/robet-minor": "/en/authors/robert-minor/",
  "/en/user/sule-perincek": "/en/authors/h-sule-perincek/",
  "/en/user/drarif-acaloglu": "/en/authors/arif-acaloglu/",
  "/en/user/igor-korotchenko": "/en/authors/igor-korotcenko/",
  "/en/user/yang-chen-ma-jinting": "/en/authors/yang-chen/",
  "/en/user/prof-dr-song-shuli-prof-dr-cheng-enfu": "/en/authors/song-shuli/",
  "/en/user/semih-guneri-ayca-avci-ahmet-z-bayburt": "/en/authors/semih-guneri/",
  "/en/user/cheng-enfu-ve-lu-chunyi": "/en/authors/cheng-enfu/",
  "/en/user/amit-kumar-ve-dr-veena-ramachandran": "/en/authors/amit-kumar/",
  "/en/user/zhang-yan-jun-liu-yu-jun": "/en/authors/zhang-yan-jun/",
  "/en/user/wang-laixi-na-risu-wu-lan": "/en/authors/wang-laixi/",
  "/en/user/fang-chenyu-and-wang-weibin": "/en/authors/fang-chenyu/",
  "/en/user/guo-xingen": "/en/authors/guo-xin-gen/",
  "/en/user/degang-sun-yingqi-yang": "/en/authors/sun-degang/",
  "/en/user/yi-shaoxuan-yang-chen": "/en/authors/yi-shaoxuan/",
  "/en/user/forugh-farrokhzad": "/en/authors/furug-ferruhzad/",
  "/en/user/sultan-hem-ve-degang-sun": "/en/authors/hend-elmahly-mahmoud-sultan/",

  // Historical published issue and call-for-papers URLs; both titles and
  // current final destinations matched and verified HTTP 200.
  "/en/reconfiguring-transatlantic-relations-era-war-and-strategic-fragmentation": "/en/calls-for-papers/transatlantic-relations/",
  "/briq-1cilt-2-sayi": "/tr/arsiv/cilt-1-sayi-2/",

  // Historical Drupal joint-author aliases: resolve each to the first author
  // shown in the published BRIQ article byline (verified 2026-10-24).
  // There are NO new joint-author pages or fabricated person profiles.
  // Excluded: Bassam Abu Abdullah / Ziad Ayoub Arbache — their two shared
  // articles reverse first-author order; no unique correct target.
  "/user/amit-kumar-ve-dr-veena-ramachandran": "/tr/yazar/amit-kumar/",
  "/user/cheng-enfu-ve-li-jing": "/tr/yazar/cheng-enfu/",
  "/user/cheng-enfu-ve-lu-chunyi": "/tr/yazar/cheng-enfu/",
  "/user/dr-mohamad-zreik-prof-dr-zhao-changfeng": "/tr/yazar/mohamad-zreik/",
  "/user/dr-ogr-uyesi-assadollah-athari-ve-dr-ehsan-ejazi": "/tr/yazar/assadollah-athari/",
  "/user/efe-can-gurcan-ve-omer-ersin-kahraman": "/tr/yazar/efe-can-gurcan/",
  "/user/fahri-erenel-ahmet-gedik": "/tr/yazar/fahri-erenel/",
  "/user/fang-chenyu-ve-wang-weibin": "/tr/yazar/fang-chenyu/",
  "/user/liu-ningning-cheng-enfu": "/tr/yazar/liu-ningning/",
  "/user/luis-kato-maldonado-ve-guadalupe-huerta-moreno": "/tr/yazar/luis-kato-maldonado/",
  "/user/necati-demircan-ye-zhangxu": "/tr/yazar/necati-demircan/",
  "/user/prof-dr-song-shuli-prof-dr-cheng-enfu": "/tr/yazar/song-shuli/",
  "/user/prof-dr-sun-degang-dr-aml-ali-abdrabou": "/tr/yazar/sun-degang/",
  "/user/prof-dr-sun-degang-zhang-jieying": "/tr/yazar/sun-degang/",
  "/user/semih-guneri-ayca-avci-ahmet-z-bayburt": "/tr/yazar/semih-guneri/",
  "/user/shangtao-gao-jessica-durdu": "/tr/yazar/shangtao-gao/",
  "/user/wenbo-zhang-quan-heng": "/tr/yazar/wenbo-zhang/",
  "/user/yang-chen-ma-jinting": "/tr/yazar/yang-chen/",
  "/user/zhang-qingyi-du-donghui": "/tr/yazar/zhang-qingyi/",
  "/user/zhang-yan-jun-liu-yu-jun": "/tr/yazar/zhang-yan-jun/",

  // Source identity verified against original archived Drupal profiles:
  // /user/8 -> Dominik Pietzcker (2026-04-15 Wayback snapshot);
  // /user/sitki-rifat -> Sıtkı Fırat (2024-03-02 source biography,
  // despite the historical page heading spelling "Sıtkı Rıfat").
  "/user/8": "/tr/yazar/dominik-pietzcker/",
  "/user/sitki-rifat": "/tr/yazar/sitki-firat/",

  // GSC's historical /user aliases found in the 2026-10-16 canonical sample.
  // Exact old spelling/identity matched to an existing published author profile
  // on 2026-10-24. No combined-author or ambiguous identity fallbacks.
  "/user/mao-zedung": "/tr/yazar/mao-zedong/",
  "/user/robet-minor": "/tr/yazar/robert-minor/",
  "/user/sule-perincek": "/tr/yazar/h-sule-perincek/",
  "/user/igor-korotchenko": "/tr/yazar/igor-korotcenko/",
  "/user/drarif-acaloglu": "/tr/yazar/arif-acaloglu/",
  "/user/expert-committee-shanghai-energy-conservation-commission": "/tr/yazar/expert-committee-of-shanghai-energy-conservation-commission/",

  // Search Console's legacy /user aliases with honorifics; each target is a
  // verified existing EN/TR author profile in the production sitemap.
  "/user/dr-hande-gunozu": "/tr/yazar/hande-gunozu",
  "/en/user/dr-francisco-dominguez": "/en/authors/francisco-dominguez",
  "/user/assoc-prof-dr-yang-chen": "/tr/yazar/yang-chen",
  "/user/prof-dr-semih-koray": "/tr/yazar/semih-koray",
  "/en/user/assoc-prof-dr-aleksandr-sotnicenko": "/en/authors/aleksandr-sotnicenko",
  "/en/user/dr-alexandr-bovdunov": "/en/authors/alexandr-bovdunov",
  "/en/user/assoc-prof-dr-yang-chen": "/en/authors/yang-chen",
  "/user/prof-dr-mehmet-celal-ozdogan": "/tr/yazar/mehmet-celal-ozdogan",
  "/user/prof-dr-birol-kilkis": "/tr/yazar/birol-kilkis",
  "/en/user/prof-dr-semih-koray": "/en/authors/semih-koray",
  "/user/prof-dr-radhika-desai": "/tr/yazar/radhika-desai",
  "/user/dr-sean-thomas-mckenna": "/tr/yazar/sean-thomas-mckenna",
  "/en/user/prof-dr-radhika-desai": "/en/authors/radhika-desai",
  "/en/user/prof-dr-ufuk-tutan": "/en/authors/ufuk-tutan",
  "/en/user/prof-jinghua-cao": "/en/authors/jinghua-cao",
  "/en/user/dr-ramzy-baroud": "/en/authors/ramzy-baroud",
  "/en/user/prof-dr-david-laibman": "/en/authors/david-laibman",
  "/en/user/dr-digby-james-wren": "/en/authors/digby-james-wren",
  "/en/user/prof-caner-karavit": "/en/authors/caner-karavit",
  "/en/user/dr-sean-thomas-mckenna": "/en/authors/sean-thomas-mckenna",
  "/user/dr-francisco-dominguez": "/tr/yazar/francisco-dominguez",
  "/en/user/prof-dr-emin-gurses": "/en/authors/emin-gurses",
  "/en/user/prof-dr-mehmet-celal-ozdogan": "/en/authors/mehmet-celal-ozdogan",
  "/en/user/dr-ali-sahin": "/en/authors/ali-sahin",
  "/en/user/prof-dr-ugur-murat-leloglu": "/en/authors/ugur-murat-leloglu",
  "/en/user/prof-dr-cuneyt-akalin": "/en/authors/cuneyt-akalin",
  "/user/prof-dr-cuneyt-akalin": "/tr/yazar/cuneyt-akalin",
  "/tr/user/prof-dr-cuneyt-akalin": "/tr/yazar/cuneyt-akalin",
  "/user/prof-jinghua-cao": "/tr/yazar/jinghua-cao",
  "/user/prof-dr-gunay-cifci": "/tr/yazar/gunay-cifci",
  "/en/user/prof-dr-ahmet-kavas": "/en/authors/ahmet-kavas",
  "/user/dr-alexandr-bovdunov": "/tr/yazar/alexandr-bovdunov",
  "/user/dr-ersel-zafer-oral": "/tr/yazar/ersel-zafer-oral",
  "/user/dr-digby-james-wren": "/tr/yazar/digby-james-wren",
  "/user/dr-ramzy-baroud": "/tr/yazar/ramzy-baroud",
  "/en/user/doc-dr-ogasawara-hiroyuki": "/en/authors/ogasawara-hiroyuki",
  "/user/doc-dr-efe-can-gurcan": "/tr/yazar/efe-can-gurcan",
  "/user/prof-dr-ahmet-kavas": "/tr/yazar/ahmet-kavas",

  // Former static/journal URLs. Override stale targets in LEGACY_REDIRECTS.
  "/yayin-etigi": "/tr/yazarlar/yayin-etigi",
  "/telif-hakki-sartlari-ve-lisans": "/tr/yazarlar/telif-hakki-sartlari-ve-lisans",
  "/en/principles-publication": "/en/journal/publication-principles",
  "/en/principles-of-publication": "/en/journal/publication-principles",
  "/en/submission-guidelines": "/en/for-authors/guidelines",
  "/en/copyright-lisence-terms": "/en/for-authors/copyright-and-licence",
  "/en/evaluation-process-peer-reviewed-submissions": "/en/for-authors/review-process",
  "/en/call-book-reviews": "/en/calls-for-papers/book-reviews",
  "/en/call-for-book-reviews": "/en/calls-for-papers/book-reviews",
  "/en/kitap-inceleme": "/en/calls-for-papers/book-reviews",
  "/en/homepage": "/en",
  "/briq-1cilt-3-sayi": "/tr/arsiv/cilt-1-sayi-3",
  "/briq-6cilt-4sayi-0": "/tr/arsiv/cilt-6-sayi-4",

  // Evidence recovered from dated BRIQ pages in the Internet Archive.
  // /index.php is stripped before lookup: /index.php/user/7 and /user/7
  // are both Mehmet Adnan Akfırat's historical Drupal author profile.
  "/user/7": "/tr/yazar/mehmet-adnan-akfirat",
  // Former WordPress "BRIQ Journal" author archive lists calls for papers.
  // The destination preserves the recovered historical CFP archive, not a
  // mismatched individual author profile.
  "/en/author/briq": "/en/calls-for-papers",
  // WordPress numeric slug = Cilt 1 Sayı 3 Ethem Sancak interview.
  "/2729-2": "/tr/makaleler/bmc-yonetim-kurulu-baskani-ethem-sancak-asya-kartalinin-iki-kanadi-turkiye-ve-cin",

  // Old contributor slug conventions. Generic /user/:slug is handled separately.
  "/user/prof-caner-karavit": "/tr/yazar/caner-karavit",
  "/en/user/doc-dr-efe-can-gurcan": "/en/authors/efe-can-gurcan",
  "/user/dr-yang-chen": "/tr/yazar/yang-chen",
  "/en/author/gongjianhua": "/en/authors/gong-jianhua",
  "/en/author/degangsun": "/en/authors/sun-degang",
  "/en/author/emingurses": "/en/authors/emin-gurses",
  "/en/author/cemgurdeniz": "/en/authors/cem-gurdeniz",

  // Recover archived calls from their exact original-language URLs (2020–2023).
  "/makale-cagrisi-ataturk-devriminin-yuzuncu-yili-ve-avrasyayi-birlestiren-ortak-program": "/tr/makale-cagrilari/ataturk-devriminin-yuzuncu-yili",
  "/makale-cagrisi-natonun-asya-pasifike-dogru-genisleme-planlarinin-dunyaya-etkisi": "/tr/makale-cagrilari/natonun-asya-pasifike-genislemesi",
  "/makale-cagrisi-enerjide-hidrojen-cagi": "/tr/makale-cagrilari/enerjide-hidrojen-cagi",
  "/makale-cagrisi-turkiye-cumhuriyeti-ile-cin-halk-cumhuriyeti-arasinda-diplomatik-iliskilerin": "/tr/makale-cagrilari/turkiye-cin-diplomatik-iliskilerinin-50-yili",
  "/21-yuzyilda-ekolojik-bir-makale-cagrisi-medeniyet-insa-etmek-gelismekte-olan-dunyadan-perspektifler": "/tr/makale-cagrilari/21-yuzyilda-ekolojik-medeniyet",
  "/makale-cagrisi-kusak-yol-girisimi-kapsaminda-bilimsel-ve-teknolojik-isbirligi": "/tr/makale-cagrilari/kusak-yol-bilimsel-teknolojik-isbirligi",
  "/makale-cagrisi-koronavirus-sonrasi-dunyada-sosyoekonomik-sistemlerin-catismasi": "/tr/makale-cagrilari/koronavirus-sonrasi-sosyoekonomik-sistemler",
  "/makale-cagrisi-gelismekte-olan-dunyada-uluslararasi-guvenlik-sorunlar-ve-cozumleri": "/tr/makale-cagrilari/gelismekte-olan-dunyada-uluslararasi-guvenlik",
  "/en/special-issue-call-papers-centenary-the-1923-turkish-revolution": "/en/calls-for-papers/centenary-1923-turkish-revolution",
  "/en/special-issue-call-papers-the-impact-natos-expansion-plans-towards-asia-pacific": "/en/calls-for-papers/nato-expansion-asia-pacific",
  "/en/special-issue-call-papers-carbon-hydrogen-era": "/en/calls-for-papers/carbon-hydrogen-era",
  "/en/special-issue-call-papers-the-50th-anniversary-the-establishment-diplomatic-relations-between-the": "/en/calls-for-papers/turkey-china-diplomatic-relations-50th-anniversary",
  "/en/special-issue-call-papers-building-ecological-civilization-the-21st-century-perspectives-the": "/en/calls-for-papers/ecological-civilization-21st-century",
  "/en/special-issue-call-papers-scientific-and-technological-cooperation-the-framework-the-belt-and-road": "/en/calls-for-papers/belt-road-scientific-technological-cooperation",
  "/en/call-papers-the-clash-socioeconomic-systems-post-coronavirus-world": "/en/calls-for-papers/post-coronavirus-socioeconomic-systems",
  "/en/call-papers-international-security-the-developing-world-problems-and-solutions": "/en/calls-for-papers/international-security-developing-world",
  "/en/special-issue-call-for-papers-scientific-and-technological-cooperation-in-the-framework-of-the-belt-and-road-initiative": "/en/calls-for-papers/belt-road-scientific-technological-cooperation",
  "/en/special-issue-call-for-papers-building-an-ecological-civilization-in-the-21st-century-perspectives-from-the-developing-world": "/en/calls-for-papers/ecological-civilization-21st-century",

  // Former call-for-papers article URLs: these are CFPs, not research articles.
  "/en/latin-americas-role-progressive-change-and-resistance-us-hegemonism": "/en/calls-for-papers/latin-amerikada-ilerici-donusumler",
  "/latin-amerikada-ilerici-donusumler-ve-amerikan-hegemonyaciligina-direnis": "/tr/makale-cagrilari/latin-amerikada-ilerici-donusumler",
  "/en/artificial-intelligence-productive-forces-and-the-common-prosperity-humanity": "/en/calls-for-papers/artificial-intelligence-productive-forces",
  "/dunyada-giderek-buyuyen-gida-ve-su-krizi-kuresel-kuzeyin-politika-ve-uygulamalari-gelismekte-olan": "/tr/makale-cagrilari/dunyada-gida-ve-su-krizi",
  "/gelisen-dunyada-kulturel-mirasin-yagmasina-karsi-onlemler-ve-isbirligi": "/tr/makale-cagrilari/kulturel-miras-yagmasina-karsi-stratejiler",
  "/sun-yat-senin-olumunun-100-yildonumunde-1911-cin-devrimi-ve-sun-yat-senin-guncel-mirasi": "/tr/makale-cagrilari/1911-cin-devrimi-ve-sun-yat-sen",
  "/en/the-centenary-sun-yat-sens-death-the-1911-chinese-revolution-and-sun-yat-sens-enduring-legacy": "/en/calls-for-papers/1911-cin-devrimi-ve-sun-yat-sen",
  "/en/belt-and-road-initiative-and-the-islamic-world-economic-geopolitical-and-cultural-interactions": "/en/calls-for-papers/kusak-ve-yol-ve-islam-dunyasi",
  "/kusak-ve-yol-girisimi-ve-islam-dunyasi-ekonomik-jeopolitik-kulturel-alanlarda-etkilesimler": "/tr/makale-cagrilari/kusak-ve-yol-ve-islam-dunyasi",
  "/en/belt-and-road-initiative-and-organization-turkic-states-the-balance-shifts-central-asia": "/en/calls-for-papers/orta-asyada-kusak-ve-yol-ve-tdt",
  "/orta-asyada-dengeler-degisirken-kusak-ve-yol-girisimi-ve-turk-devletleri-teskilati": "/tr/makale-cagrilari/orta-asyada-kusak-ve-yol-ve-tdt",
  "/savaslar-ve-stratejik-parcalanma-caginda-transatlantik-iliskilerin-yeniden-yapilanmasi": "/tr/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi",
  "/cok-kutupluluga-karsi-tehditler-ve-etnik-ayrilikci-dinci-asirilikci-kiskirtmalar": "/tr/makale-cagrilari/cok-kutupluluga-karsi-tehditler",
  "/en/challenges-multipolarity-and-provocations-ethnic-separatists-and-religious-extremists": "/en/calls-for-papers/cok-kutupluluga-karsi-tehditler",
  "/70-yil-donumunde-bandung-konferansinin-gecmisten-gunumuze-suregelen-mirasi": "/tr/makale-cagrilari/bandung-konferansinin-mirasi",
  "/makale-cagrisi-kuresel-guneyde-bilimsel-ve-teknolojik-gelisme-politikalari": "/tr/makale-cagrilari/kuresel-guneyde-bilim-ve-teknoloji",

  // Former article aliases that resolved to removed slugs (confirmed 404).
  // Targets are their verified, published EN/TR canonical article pages.
  "/dilek-uyar-fotograf-sanatcisi": "/tr/makaleler/cobanin-sagim-sonrasi-suruyu-tekrar-otlaklara-goturme-cabasi-ve-tozlu-yolculuk/",
  "/download/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey": "/en/articles/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey-bitlis/",
  "/en/articles/history-the-first-book-about-ataturk-ever-published-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/book-review-post-covid-19-global-system-old-problems-new-trends": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/dilek-uyar-photography-artist": "/en/articles/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey-bitlis/",
  "/en/fotograf-ni-min-fujian-huian-kadini-ag-onariyor": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/history-the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/history-the-first-book-about-ataturk-ever-published-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/makale/book-review-post-covid-19-global-system-old-problems-new-trends": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/makale/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/makale/fotograf-ni-min-fujian-huian-kadini-ag-onariyor": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/makale/history-the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/makale/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/makale/nato-and-the-wider-international-territory": "/en/articles/nato-from-control-of-the-western-territorial-line-to-control-of-the-wider-international-territory/",
  "/en/makale/photograph-fujian-huian-maidens-weaving-net": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/photograph-fujian-huian-maidens-weaving-net": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",

  // Existing article whose old, noncanonical slug is an exact content match.
  "/en/the-belt-and-road-initiative-in-the-shadow-of-competition-between-china-and-the-us": "/en/articles/the-belt-and-road-initiative-in-the-shadow-of-competition-between-china-and-the-us",
  "/kusak-ve-yol-girisimi-avrasyanin-yolu": "/tr/makaleler/rus-stratejist-dr-alexander-dugin-kusak-ve-yol-girisimi-avrasyanin-yolu",
  "/sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon": "/tr/makaleler/sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0",

  // Exact formerly published slugs recovered from the Search Console 404 sample.
  "/roportaj-yesil-ve-dijital-donusum-kapsaminda-": "/tr/makaleler/roportaj-yesil-ve-dijital-donusum-kapsaminda-ar-ge-ve-yenilik-ekosistemini-harekete-geciriyoruz",
  "/1uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu": "/tr/makaleler/1-uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu-turkiye-dijital-ipek-yolunun-oncusu",

  // Additional legacy slugs matched to published records in the article catalog.
  "/en/neo-mahanian-": "/en/articles/a-neo-mahanian-reading-of-turkey-and-chinas-changing-maritime-geopolitics",
  "/en/russian-strategist-": "/en/articles/russian-strategist-dr-alexander-dugin-the-belt-and-road-initiative-a-eurasian-road",
  "/turk-milli-ordusunun-zaferinin-uluslararasi-kiymeti": "/tr/makaleler/turk-milli-ordusunun-zaferinin-uluslarasi-kiymeti",

  // Specific 2020 English Issue 4 upload: name omits volume, so automatic
  // legacy PDF parser cannot infer the published issue. R2 target verified.
  "/sites/default/files/dergi-sayilari/2020-11/BRIQ_ENG ISSUE 4.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf",
  "/sites/default/files/dergi-sayilari/2020-11/briq_eng issue 4.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf",

  // Volume 7 issues 3/4 live under /assets/issues, not the older PDF prefix.
  "/assets/archive/pdfs/issues/cilt-7-sayi-3-tr.pdf": "/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf",
  "/assets/archive/pdfs/issues/cilt-7-sayi-3-en.pdf": "/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf",
  "/assets/archive/pdfs/issues/cilt-7-sayi-4-tr.pdf": "/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf",
  "/assets/archive/pdfs/issues/cilt-7-sayi-4-en.pdf": "/assets/issues/BRIQ-Volume7-Issue4-EN-original.pdf",

  // Three exact aliases from GSC's 2026-10-16 404 sample, rechecked live on
  // 2026-10-23. Each target exists and returns HTTP 200. No broad fallback.
  "/kitap-incelemesi": "/tr/makale-cagrilari/kitap-incelemesi/",
  // handleLegacyRedirect removes /index.php before looking up aliases.
  "/yapay-zeka-uretici-gucler-ve-insanligin-ortak-refahi": "/tr/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah/",
  "/sites/default/files/dergi-sayilari/2020-09/BRIQ_TURKCE - 3. SAYI.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-3-tr.pdf",

  // Exact recoveries from GSC's 404 report, source-verified 2026-10-24:
  // The crawled Drupal HTML for /en/user/emrah-alan explicitly sets
  // data-drupal-link-system-path="user/68" on its Turkish language link.
  "/user/68": "/tr/yazar/emrah-alan/",

  // A cut-off GSC link is uniquely matched in the 619-file migration manifest:
  // the sole 2021-04 old PDF starting "Turkey in the" is the published
  // "Turkey in the Century of the Sea and Asia" (exact designed English PDF).
  // Only these two exact truncated spellings redirect; no wildcard guessing.
  "/sites/default/files/yazi-ici-dosyalar/2021-04/Turkey in the": "/assets/archive/pdfs/articles/deniz-ve-asya-yuzyilinda-turkiye-en.pdf",
  "/sites/default/files/yazi-ici-dosyalar/2021-04/Turkey in the ": "/assets/archive/pdfs/articles/deniz-ve-asya-yuzyilinda-turkiye-en.pdf",

  // Older issue filenames observed in live 404 logs; source and R2 targets
  // were checked by volume/issue metadata and exact R2 object existence.
  "/assets/archive/pdfs/cilt-3-sayi-1-turk-cin-iliskileri-tr.pdf": "/assets/archive/pdfs/issues/cilt-3-sayi-1-tr.pdf",
  "/assets/archive/pdfs/cilt-1-sayi-4-dogu-akdeniz-guney-kafkasya-tr.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-tr.pdf",
  "/assets/archive/pdfs/cilt-3-sayi-3-sanghay-hidrojen-tr.pdf": "/assets/archive/pdfs/issues/cilt-3-sayi-3-tr.pdf",
};
