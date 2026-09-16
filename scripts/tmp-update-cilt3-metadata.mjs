import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const updates = [
  {
    "slug": "diplomatik-iliskilerin-50-yilinda-ortaya-cikan-gercek-cin-ve-turkiye-birlikte-yukselecek",
    "volume": 3,
    "issue": 1,
    "author": "Fikret Akfırat",
    "title_tr": "Diplomatik İlişkilerin 50. Yılı’nda Ortaya Çıkan Gerçek: Çin ve Türkiye Birlikte Yükselecek",
    "publication_type_tr": "Editörden",
    "publication_type_en": "Editorial",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "karsilikli-saygi-ve-dostluga-dayali-turk-cin-iliskilerinin-son-yarim-yuzyili-ve-gelecegi",
    "volume": 3,
    "issue": 1,
    "author": "Abdulkadir Emin Önen",
    "title_tr": "Karşılıklı Saygı ve Dostluğa Dayalı Türk-Çin İlişkilerinin Son Yarım Yüzyılı ve Geleceği",
    "publication_type_tr": "Görüş Makalesi",
    "publication_type_en": "Perspective Article",
    "received_date": "2021-10-28",
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "cin-ve-turkiyenin-diplomatik-iliskilerinin-kurulusunun-50-yildonumunde-kusak-ve-yol-isbirligi-yeni",
    "volume": 3,
    "issue": 1,
    "author": "Liu Shaobin",
    "title_tr": "Çin ve Türkiye’nin Diplomatik İlişkilerinin Kuruluşunun 50. Yıldönümünde Kuşak ve Yol İşbirliği Yeni Bir Sayfa Açıyor",
    "publication_type_tr": "Görüş Makalesi",
    "publication_type_en": "Perspective Article",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "cin-ve-turkiye-imajlarinin-karsilikli-insasi-algilar-sorunlar-ve-politika-onerileri",
    "volume": 3,
    "issue": 1,
    "author": "Yang Chen; Xie Fang",
    "title_tr": "Çin ve Türkiye İmajlarının Karşılıklı İnşası: Algılar, Sorunlar ve Politika Önerileri",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2021-10-27",
    "revised_date": "2021-11-15",
    "accepted_date": "2021-11-21",
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "iki-cumhuriyet-arasinda-etkilesim-turkiye-cumhuriyeti-ile-cin-cumhuriyeti-iliskileri-1923-1949",
    "volume": 3,
    "issue": 1,
    "author": "Necati Demircan",
    "title_tr": "İki Cumhuriyet Arasında Etkileşim: Türkiye Cumhuriyeti ile Çin Cumhuriyeti İlişkileri (1923-1949)",
    "publication_type_tr": "Derleme Makalesi",
    "publication_type_en": "Review Article",
    "received_date": "2021-10-23",
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "mustafa-kemal-ataturkun-halkcilik-ve-devletcilik-ilkesi-sun-yat-senin-siyasi-dusuncesiyle",
    "volume": 3,
    "issue": 1,
    "author": "Wang Sanyi",
    "title_tr": "Mustafa Kemal Atatürk’ün Halkçılık ve Devletçilik İlkesi: Sun Yat-sen’in Siyasi Düşüncesiyle Karşılaştırma",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": null,
    "revised_date": "2021-10-21",
    "accepted_date": "2021-11-17",
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "turkiye-cumhuriyeti-ile-cin-halk-cumhuriyeti-arasinda-diplomatik-iliskilerin-kurulmasi-1960-1971",
    "volume": 3,
    "issue": 1,
    "author": "Barış Adıbelli",
    "title_tr": "Türkiye Cumhuriyeti ile Çin Halk Cumhuriyeti Arasında Diplomatik İlişkilerin Kurulması (1960-1971)",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2021-11-05",
    "revised_date": "2021-11-17",
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "bin-okur-bin-hamlet-bir-cinli-akademisyenin-kusak-ve-yol-girisimi-hakkindaki-10-onemli-soruya",
    "volume": 3,
    "issue": 1,
    "author": "Li Ning",
    "title_tr": "Bin Okur, Bin Hamlet: Bir Çinli Akademisyenin Kuşak ve Yol Girişimi Hakkındaki 10 Önemli Soruya Cevabı",
    "publication_type_tr": "Kitap İncelemesi",
    "publication_type_en": "Book Review",
    "received_date": "2021-10-17",
    "revised_date": "2021-10-19",
    "accepted_date": "2021-11-03",
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "sinoloji-ve-cin-arastirmalari-sempozyumu-turkiyede-cin-arastirmalarinin-yeni-birlestirici",
    "volume": 3,
    "issue": 1,
    "author": "Anıl Solmaz",
    "title_tr": "Sinoloji ve Çin Araştırmaları Sempozyumu: Türkiye’de Çin Araştırmalarının Yeni Birleştirici Perspektifi",
    "publication_type_tr": "Sempozyum Raporu",
    "publication_type_en": "Symposium Report",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "insanligin-ortak-gelecegini-sporla-kurmak-2022-kis-olimpiyatlarina-dogru",
    "volume": 3,
    "issue": 1,
    "author": "Arda Tunçel",
    "title_tr": "İnsanlığın Ortak Geleceğini Sporla Kurmak: 2022 Kış Olimpiyatları’na Doğru",
    "publication_type_tr": "Forum Raporu",
    "publication_type_en": "Forum Report",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "beklenen-cagri-bir-kusak-bir-yol-senfonisi",
    "volume": 3,
    "issue": 1,
    "author": "Hüseyin Haydar",
    "title_tr": "Beklenen Çağrı (Bir Kuşak Bir Yol Senfonisi)",
    "publication_type_tr": "Şiir",
    "publication_type_en": "Poem",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "resim-kayihan-keskinok",
    "volume": 3,
    "issue": 1,
    "author": "Kayıhan Keskinok",
    "title_tr": "1919 Senesi Mayısının 19’uncu Günü Samsun’a Çıktım. Vaziyet ve Manzarai Umumiye",
    "publication_type_tr": "Resim",
    "publication_type_en": "Painting",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "fotograf-sitki-rifat",
    "volume": 3,
    "issue": 1,
    "author": "Sıtkı Rıfat",
    "title_tr": "Çin",
    "publication_type_tr": "Fotoğraf",
    "publication_type_en": "Photograph",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "rifat-mutlu-tek-disi-kalmis-canavar",
    "volume": 3,
    "issue": 1,
    "author": "Rıfat Mutlu",
    "title_tr": "Tek Dişi Kalmış Canavar",
    "publication_type_tr": "Karikatür",
    "publication_type_en": "Cartoon",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2021-12-01"
  },
  {
    "slug": "gelisen-dunya-ulkeleri-icin-zorunlu-rota-bagimsiz-kamucu-halkci-yonetim",
    "volume": 3,
    "issue": 2,
    "author": "Fikret Akfırat",
    "title_tr": "Gelişen Dünya Ülkeleri İçin Zorunlu Rota: Bağımsız, Kamucu, Halkçı Yönetim",
    "publication_type_tr": "Editörden",
    "publication_type_en": "Editorial",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "milli-demokratik-devlet-ve-kalkinma",
    "volume": 3,
    "issue": 2,
    "author": "Semih Koray",
    "title_tr": "Milli Demokratik Devlet ve Kalkınma",
    "publication_type_tr": "Değerlendirme Makalesi",
    "publication_type_en": "Evaluation Article",
    "received_date": "2022-02-12",
    "revised_date": null,
    "accepted_date": "2022-02-25",
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "ortak-refahi-gerceklestirmek-icin-izleyecegimiz-program",
    "volume": 3,
    "issue": 2,
    "author": "Xi Jinping",
    "title_tr": "Ortak Refahı Gerçekleştirmek İçin İzleyeceğimiz Program",
    "publication_type_tr": "Görüş Makalesi",
    "publication_type_en": "Perspective Article",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "cin-sosyalist-bir-kalkinma-modeli-mi",
    "volume": 3,
    "issue": 2,
    "author": "Michael Roberts",
    "title_tr": "Çin: Sosyalist Bir Kalkınma Modeli Mi?",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2022-01-21",
    "revised_date": null,
    "accepted_date": "2022-02-18",
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "cin-ekonomik-mucizesinin-kodlari-gelisen-dunya-icin-dersler",
    "volume": 3,
    "issue": 2,
    "author": "Efe Can Gürcan",
    "title_tr": "Çin Ekonomik Mucizesinin Kodları: Gelişen Dünya İçin Dersler",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2022-01-04",
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "cinin-ekonomik-diyalektigi-reformun-asil-amaci-uzerine-degerlendirme",
    "volume": 3,
    "issue": 2,
    "author": "John Bellamy Foster",
    "title_tr": "Çin’in Ekonomik Diyalektiği: Reformun Asıl Amacı Üzerine Değerlendirme",
    "publication_type_tr": "Kitap İncelemesi",
    "publication_type_en": "Book Review",
    "received_date": null,
    "revised_date": null,
    "accepted_date": "2022-01-24",
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "kamu-ekonomisinin-hakim-konumu-cin-sosyalizminin-can-damaridir",
    "volume": 3,
    "issue": 2,
    "author": "Ding Bing",
    "title_tr": "Kamu Ekonomisinin Hâkim Konumu Çin Sosyalizminin Can Damarıdır",
    "publication_type_tr": "Görüş Makalesi",
    "publication_type_en": "Perspective Article",
    "received_date": null,
    "revised_date": null,
    "accepted_date": "2022-01-24",
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "erken-cumhuriyet-doneminde-kemalizmin-ekonomi-politikasi-1923-1938",
    "volume": 3,
    "issue": 2,
    "author": "Tolga Dişçi",
    "title_tr": "Erken Cumhuriyet Dönemi’nde Kemalizm’in Ekonomi Politikası (1923-1938)",
    "publication_type_tr": "Derleme Makalesi",
    "publication_type_en": "Review Article",
    "received_date": "2022-02-12",
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "sultanahmet-camii-cuma-namazi",
    "volume": 3,
    "issue": 2,
    "author": "Cemil Şahin",
    "title_tr": "Sultanahmet Camii Cuma Namazı",
    "publication_type_tr": "Fotoğraf",
    "publication_type_en": "Photograph",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "anadolu-buyuleri",
    "volume": 3,
    "issue": 2,
    "author": "Kağan Güner",
    "title_tr": "Anadolu Büyüleri",
    "publication_type_tr": "Resim",
    "publication_type_en": "Painting",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "turhan-selcuk-karikaturu",
    "volume": 3,
    "issue": 2,
    "author": "Turhan Selçuk",
    "title_tr": "Özgürlük Heykeli",
    "publication_type_tr": "Karikatür",
    "publication_type_en": "Cartoon",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-03-01"
  },
  {
    "slug": "yeni-uygarligin-enerjisi",
    "volume": 3,
    "issue": 3,
    "author": "Fikret Akfırat",
    "title_tr": "Yeni Uygarlığın Enerjisi",
    "publication_type_tr": "Editörden",
    "publication_type_en": "Editorial",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "yesil-hidrojen-kusak-ve-yol-girisiminin-ortak-bagi",
    "volume": 3,
    "issue": 3,
    "author": "Birol Kılkış",
    "title_tr": "Yeşil Hidrojen: Kuşak ve Yol Girişimi’nin Ortak Bağı",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2022-04-25",
    "revised_date": null,
    "accepted_date": "2022-05-06",
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "turkiyenin-enerji-su-ve-iklim-degisikligi-sorunlari-icin-kesin-cozum-hidrojen-yakiti",
    "volume": 3,
    "issue": 3,
    "author": "Engin Türe",
    "title_tr": "Türkiye’nin Enerji, Su ve İklim Değişikliği Sorunları İçin Kesin Çözüm: Hidrojen Yakıtı",
    "publication_type_tr": "Derleme Makalesi",
    "publication_type_en": "Review Article",
    "received_date": "2021-12-29",
    "revised_date": "2022-03-22",
    "accepted_date": "2022-04-25",
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "insan-ve-doga-icin-musterek-bir-yasam-yaratmaliyiz",
    "volume": 3,
    "issue": 3,
    "author": "Xi Jinping",
    "title_tr": "İnsan ve Doğa İçin Müşterek Bir Yaşam Yaratmalıyız",
    "publication_type_tr": "Görüş Makalesi",
    "publication_type_en": "Perspective Article",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "ekolojik-uygarligin-enerjisi-hidrojen",
    "volume": 3,
    "issue": 3,
    "author": "Salih Ertan",
    "title_tr": "Ekolojik Uygarlığın Enerjisi: Hidrojen",
    "publication_type_tr": "Derleme Makalesi",
    "publication_type_en": "Review Article",
    "received_date": "2021-12-14",
    "revised_date": null,
    "accepted_date": "2022-05-05",
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "cinin-hidrojen-enerjisi-endustrisinin-gelistirilmesine-yonelik-orta-ve-uzun-vadeli-planina-genel",
    "volume": 3,
    "issue": 3,
    "author": "BRIQ Yazıişleri",
    "title_tr": "Çin'in Hidrojen Enerjisi Endüstrisinin Geliştirilmesine Yönelik Orta ve Uzun Vadeli Planına Genel Bakış",
    "publication_type_tr": "Rapor",
    "publication_type_en": "Report",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "sanghayda-hidrojen-enerji-endustrisi-uygulamalari-ve-gelisimi",
    "volume": 3,
    "issue": 3,
    "author": "Şanghay Enerji Tasarruf Komisyonu Uzman Komitesi / Şanghay Yerel Hükümeti",
    "title_tr": "Şanghay’da Hidrojen Enerji Endüstrisi Uygulamaları ve Gelişimi",
    "publication_type_tr": "Rapor",
    "publication_type_en": "Report",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "kusak-ve-yol-girisiminin-ic-nedenleri",
    "volume": 3,
    "issue": 3,
    "author": "Lin Shiting",
    "title_tr": "Kuşak ve Yol Girişimi’nin İç Nedenleri",
    "publication_type_tr": "Kitap İncelemesi",
    "publication_type_en": "Book Review",
    "received_date": "2022-02-08",
    "revised_date": null,
    "accepted_date": "2022-05-01",
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "yangisardaki-comlek-atolyesinin-avlusu",
    "volume": 3,
    "issue": 3,
    "author": "Carl Gustav Mannerheim",
    "title_tr": "Yangişar’daki Çömlek Atölyesinin Avlusu",
    "publication_type_tr": "Fotoğraf",
    "publication_type_en": "Photograph",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "supernova-moskova",
    "volume": 3,
    "issue": 3,
    "author": "Aleksey Beliayev Guintovt",
    "title_tr": "Süpernova Moskova",
    "publication_type_tr": "Resim",
    "publication_type_en": "Painting",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "karikatur-1",
    "volume": 3,
    "issue": 3,
    "author": "Rıfat Mutlu",
    "title_tr": "NATO ve ABD",
    "publication_type_tr": "Karikatür",
    "publication_type_en": "Cartoon",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  },
  {
    "slug": "uygarlik-yolunda-birlesme-kaynasma-ve-kardeslik",
    "volume": 3,
    "issue": 4,
    "author": "Fikret Akfırat",
    "title_tr": "Uygarlık Yolunda Birleşme, Kaynaşma ve Kardeşlik",
    "publication_type_tr": "Editörden",
    "publication_type_en": "Editorial",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "ortak-mirasimiz-olan-gecmisi-kuresel-olcekte-ele-alip-bilimi-paylasmak-zorundayiz",
    "volume": 3,
    "issue": 4,
    "author": "Mehmet Celal Özdoğan",
    "title_tr": "Ortak Mirasımız Olan Geçmişi Küresel Ölçekte Ele Alıp, Bilimi Paylaşmak Zorundayız",
    "publication_type_tr": "Röportaj",
    "publication_type_en": "Interview",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "yeni-dunya-ipek-yolunun-yarattigi-evrensel-degerler-uzerinde-zenginlik-ve-barisla-kurulacak",
    "volume": 3,
    "issue": 4,
    "author": "Ethem Sancak",
    "title_tr": "Yeni Dünya, İpek Yolu’nun Yarattığı Evrensel Değerler Üzerinde Zenginlik ve Barışla Kurulacak",
    "publication_type_tr": "Röportaj",
    "publication_type_en": "Interview",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "kulturel-ozguveni-percinleyelim",
    "volume": 3,
    "issue": 4,
    "author": "Xi Jinping",
    "title_tr": "Kültürel Özgüveni Perçinleyelim",
    "publication_type_tr": "Görüş Makalesi",
    "publication_type_en": "Perspective Article",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "ipek-yolu-uzerindeki-magara-tapinaklarindaki-kuzey-wei-donemine-ait-budist-resim-kompozisyonlarinin",
    "volume": 3,
    "issue": 4,
    "author": "Caner Karavit",
    "title_tr": "İpek Yolu Üzerindeki Mağara Tapınaklarındaki Kuzey Wei Dönemine Ait Budist Resim Kompozisyonlarının Biçimsel Çözümlemesi",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2022-07-23",
    "revised_date": null,
    "accepted_date": "2022-08-05",
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "ipek-yolu-cayir-guzergahi-cayir-ipek-yolu-milli-ekonomi-iletisim-ve-butunlesme",
    "volume": 3,
    "issue": 4,
    "author": "Wang Laixi; Na Risu; Wu Lan",
    "title_tr": "İpek Yolu Çayır Güzergahı (Çayır İpek Yolu): Milli Ekonomi, İletişim ve Bütünleşme",
    "publication_type_tr": "Derleme Makalesi",
    "publication_type_en": "Review Article",
    "received_date": null,
    "revised_date": null,
    "accepted_date": "2022-02-17",
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "ipek-yolu-uzerinden-yakin-doguya-sibiryali-ust-paleolitik-cag-gocleri",
    "volume": 3,
    "issue": 4,
    "author": "Semih Güneri; Ayça Avcı; Ahmet Z. Bayburt",
    "title_tr": "İpek Yolu Üzerinden Yakın Doğu’ya Sibirya’lı Üst Paleolitik Çağ Göçleri",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2022-03-30",
    "revised_date": null,
    "accepted_date": "2022-05-14",
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "ipek-yolunda-kulturel-etkilesim-orta-asyada-yuezhi-goc-donemi",
    "volume": 3,
    "issue": 4,
    "author": "Kazim Abdullaev",
    "title_tr": "İpek Yolunda Kültürel Etkileşim: Orta Asya’da Yuezhi Göç Dönemi",
    "publication_type_tr": "Araştırma Makalesi",
    "publication_type_en": "Research Article",
    "received_date": "2022-02-18",
    "revised_date": null,
    "accepted_date": "2022-03-10",
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "guc-zayifliktir",
    "volume": 3,
    "issue": 4,
    "author": "Dominik Pietzcker",
    "title_tr": "Güç Zayıflıktır",
    "publication_type_tr": "Kitap İncelemesi",
    "publication_type_en": "Book Review",
    "received_date": "2022-06-06",
    "revised_date": null,
    "accepted_date": "2022-06-14",
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "yangin-merdiveni",
    "volume": 3,
    "issue": 4,
    "author": "Alexander Rodchenko",
    "title_tr": "Yangın Merdiveni",
    "publication_type_tr": "Fotoğraf",
    "publication_type_en": "Photograph",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "simitci",
    "volume": 3,
    "issue": 4,
    "author": "Jak İhmalyan",
    "title_tr": "Simitçi",
    "publication_type_tr": "Resim",
    "publication_type_en": "Painting",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "uygarligin-ipek-yolu",
    "volume": 3,
    "issue": 4,
    "author": "Erhan Yalvaç",
    "title_tr": "Uygarlığın İpek Yolu",
    "publication_type_tr": "Karikatür",
    "publication_type_en": "Cartoon",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-09-01"
  },
  {
    "slug": "1-uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu-turkiye-dijital-ipek-yolunun-oncusu",
    "volume": 3,
    "issue": 3,
    "publication_type_tr": "Sempozyum Raporu",
    "publication_type_en": "Symposium Report",
    "received_date": null,
    "revised_date": null,
    "accepted_date": null,
    "published_online_date": "2022-06-01"
  }
];
const newMeta = {
  "diplomatik-iliskilerin-50-yilinda-ortaya-cikan-gercek-cin-ve-turkiye-birlikte-yukselecek": {
    "season_tr": "Kış",
    "season_en": "Winter",
    "year": "2021-2022",
    "title_en": "The Truth Revealed on the 50th Anniversary of Diplomatic Relations: China and Türkiye Will Rise Together"
  },
  "gelisen-dunya-ulkeleri-icin-zorunlu-rota-bagimsiz-kamucu-halkci-yonetim": {
    "season_tr": "Bahar",
    "season_en": "Spring",
    "year": "2022",
    "title_en": "An Inevitable Route for Developing Countries: Independent, Public-Oriented and Populist Governance"
  },
  "anadolu-buyuleri": {
    "season_tr": "Bahar",
    "season_en": "Spring",
    "year": "2022",
    "title_en": "Anatolian Spells"
  },
  "yeni-uygarligin-enerjisi": {
    "season_tr": "Yaz",
    "season_en": "Summer",
    "year": "2022",
    "title_en": "The Energy of the New Civilization"
  },
  "uygarlik-yolunda-birlesme-kaynasma-ve-kardeslik": {
    "season_tr": "Güz",
    "season_en": "Autumn",
    "year": "2022",
    "title_en": "Unity, Integration and Brotherhood on the Path of Civilization"
  }
};

const issues = {
  1: 'v03-i01.json',
  2: 'v03-i02.json',
  3: 'v03-i03.json',
  4: 'v03-i04.json',
};

const additions = {
  1: [newMeta['diplomatik-iliskilerin-50-yilinda-ortaya-cikan-gercek-cin-ve-turkiye-birlikte-yukselecek'] ? 'diplomatik-iliskilerin-50-yilinda-ortaya-cikan-gercek-cin-ve-turkiye-birlikte-yukselecek' : null],
  2: [
    'gelisen-dunya-ulkeleri-icin-zorunlu-rota-bagimsiz-kamucu-halkci-yonetim',
    'anadolu-buyuleri'
  ],
  3: ['yeni-uygarligin-enerjisi'],
  4: ['uygarlik-yolunda-birlesme-kaynasma-ve-kardeslik']
};

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}
function setOrDelete(obj, key, value) {
  if (value === null || value === undefined || value === '') delete obj[key];
  else obj[key] = value;
}

const updateBySlug = new Map(updates.map(x => [x.slug, x]));
const seen = new Set();

for (const u of updates) {
  const metaPath = path.join(root, 'content', 'articles', u.slug, 'metadata.json');
  let meta;
  if (fs.existsSync(metaPath)) {
    meta = readJson(metaPath);
  } else {
    const add = newMeta[u.slug];
    if (!add) throw new Error(`Missing metadata file for existing target: ${u.slug}`);
    meta = {
      slug: u.slug,
      volume: 3,
      issue: u.issue,
      season_tr: add.season_tr,
      season_en: add.season_en,
      year: add.year,
      author: u.author,
      title_tr: u.title_tr,
      abstract_tr: null,
      title_en: add.title_en,
      abstract_en: null
    };
  }

  meta.publication_type_tr = u.publication_type_tr;
  meta.publication_type_en = u.publication_type_en;

  for (const key of ['received_date','revised_date','accepted_date','published_online_date']) {
    setOrDelete(meta, key, u[key]);
  }
  writeJson(metaPath, meta);
  seen.add(u.slug);
}

if (seen.size !== updates.length) throw new Error(`Expected ${updates.length} updated records, got ${seen.size}`);

// Add omitted contents to issue lists without deleting any existing item.
for (const [issueNoStr, file] of Object.entries(issues)) {
  const issueNo = Number(issueNoStr);
  const issuePath = path.join(root, 'content', 'issues', file);
  const issue = readJson(issuePath);
  if (!Array.isArray(issue.articles)) throw new Error(`No article list in ${file}`);

  if (issueNo === 1) {
    const editorial = 'diplomatik-iliskilerin-50-yilinda-ortaya-cikan-gercek-cin-ve-turkiye-birlikte-yukselecek';
    issue.articles = issue.articles.filter(x => x !== editorial);
    issue.articles.unshift(editorial);
  }
  if (issueNo === 2) {
    const editorial = 'gelisen-dunya-ulkeleri-icin-zorunlu-rota-bagimsiz-kamucu-halkci-yonetim';
    const painting = 'anadolu-buyuleri';
    issue.articles = issue.articles.filter(x => x !== editorial && x !== painting);
    issue.articles.unshift(editorial);
    const photoIdx = issue.articles.indexOf('sultanahmet-camii-cuma-namazi');
    const cartoonIdx = issue.articles.indexOf('turhan-selcuk-karikaturu');
    const insertAt = photoIdx >= 0 ? photoIdx + 1 : (cartoonIdx >= 0 ? cartoonIdx : issue.articles.length);
    issue.articles.splice(insertAt, 0, painting);
  }
  if (issueNo === 3) {
    const editorial = 'yeni-uygarligin-enerjisi';
    issue.articles = issue.articles.filter(x => x !== editorial);
    issue.articles.unshift(editorial);
  }
  if (issueNo === 4) {
    const editorial = 'uygarlik-yolunda-birlesme-kaynasma-ve-kardeslik';
    issue.articles = issue.articles.filter(x => x !== editorial);
    issue.articles.unshift(editorial);
  }
  writeJson(issuePath, issue);
}

// Rebuild global article_order from canonical issue order so archive invariants stay exact.
const catalogPath = path.join(root, 'content', 'catalog.json');
const catalog = readJson(catalogPath);
const flattened = [];
for (const issueFile of catalog.issue_order) {
  const issue = readJson(path.join(root, 'content', 'issues', issueFile));
  for (const slug of issue.articles) flattened.push(slug);
}
catalog.article_order = flattened;
writeJson(catalogPath, catalog);

console.log(`Updated ${updates.length} metadata records.`);
console.log('Cilt 3 final issue counts:',
  [1,2,3,4].map(i => {
    const issue = readJson(path.join(root, 'content', 'issues', issues[i]));
    return `${i}:${issue.articles.length}`;
  }).join(', ')
);
