"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { canonicalPageHref } from "../seo-links";

const submissionUrl = "https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new";
const mail = "briq@briqjournal.com";

const steps = [
  {
    title: "Hesabınıza giriş yapın",
    intro: "DergiPark hesabınızı açın veya yeni bir hesap oluşturun.",
    text: "E-posta adresinizi doğruladıktan sonra BRIQ Kuşak ve Yol Girişimi Dergisi’nin gönderim ekranını açın. İlk kez başvuruyorsanız yazar hesabı oluşturmanız gerekir.",
    check: "BRIQ dergisini seçtiğinizi ve hesabınızdaki e-posta adresinin güncel olduğunu doğrulayın.",
    href: "https://dergipark.org.tr/tr/login",
    link: "DergiPark’a giriş yapın",
    icon: "login",
  },
  {
    title: "Makale bilgilerini girin",
    intro: "Başlık, özet, anahtar kelimeler ve diğer bibliyografik alanları doldurun.",
    text: "Bilgileri yazınızın gönderime hazır son sürümünden aktarın. Türkçe ve İngilizce başlık, özet ve anahtar kelime alanları isteniyorsa ikisini de eksiksiz tamamlayın; yazı türünü ve dilini doğru seçin.",
    check: "Sistem ekranındaki zorunlu alanları boş bırakmayın ve metinle aynı yazımı kullandığınızı kontrol edin.",
    icon: "metadata",
  },
  {
    title: "Yazar bilgilerini tamamlayın",
    intro: "Tüm yazarları doğru sırayla ekleyin ve sorumlu yazarı belirtin.",
    text: "Yazar adlarını, kurum bilgilerini, e-posta adreslerini ve mevcutsa ORCID numaralarını girin. Birden fazla yazar varsa listedeki sıralamanın makaledekiyle aynı olmasına dikkat edin.",
    check: "Yazar kimlik bilgileri ayrı yazar dosyasında bulunmalı; hakemlere gidecek ana metinde yer almamalıdır.",
    icon: "authors",
  },
  {
    title: "Dosyaları ve ek bilgileri yükleyin",
    intro: "Anonim ana metni, yazar dosyasını ve gerekli ekleri doğru alanlara ekleyin.",
    text: "Akademik makalelerde yazar bilgilerini içeren kapak dosyası ile kimlik bilgileri çıkarılmış Word metnini ayrı yükleyin. Etik kurul, fon, çıkar çatışması, görsel izinleri veya diğer beyanları ilgili alanlara ekleyin.",
    check: "Dosyaları yükledikten sonra adlarını ve açılan sürümlerini kontrol edin; ana metindeki yazar adı ve izlenebilir değişiklikleri kaldırın.",
    icon: "files",
  },
  {
    title: "Önizleyin ve gönderimi tamamlayın",
    intro: "Son kontrolü yapın, gerekli onayları verin ve başvuruyu gönderin.",
    text: "Başvuru önizlemesinde makale bilgilerini, yazarları ve yüklenen bütün dosyaları gözden geçirin. Zorunlu beyan ve onayları tamamlayıp son gönderim adımını onaylayın.",
    check: "Yalnızca dosya yüklemek başvuruyu tamamlamaz. DergiPark’ta gönderim onayını ve başvuru durumunu gördüğünüzden emin olun.",
    icon: "send",
  },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    login: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 8l4 4-4 4M14 12H6"/></>,
    metadata: <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></>,
    authors: <><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 5"/></>,
    files: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14h8M8 17h6"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function SubmissionGuide() {
  const [allOpen, setAllOpen] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    stepsRef.current?.querySelectorAll("details").forEach((item) => { item.open = allOpen; });
  }, [allOpen]);
  return (
    <div className="site-shell submission-guide">
      <aside className="submission-side">
        <nav aria-label="Bu sayfada">
          <b>Bu sayfada</b>
          <a href="#basvuru">Başvurunuzu başlatın</a>
          <a href="#hazirlik">Dosyalarınızı hazırlayın</a>
          <a href="#dergipark">DergiPark ile gönderim</a>
          <a href="#eposta">E-posta ile gönderim</a>
          <a href="#sonrasi">Gönderimden sonra</a>
        </nav>
        <div className="submission-side-help"><Icon name="mail"/><h2>Bir adımda takıldınız mı?</h2><p>Size yardımcı olalım. Bize e-posta gönderin.</p><a href={`mailto:${mail}`}>{mail}</a></div>
      </aside>
      <article className="submission-content">
        <section className="submission-section" id="basvuru">
          <span className="submission-kicker">Gönderim kanalı</span>
          <h2>Başvurunuzu başlatın</h2>
          <p>BRIQ’e Türkçe veya İngilizce yazı gönderebilirsiniz. Başvuru ve yayın ücretsizdir. DergiPark üzerinden başvurarak gönderinizi ve değerlendirme sürecinizi takip edebilirsiniz.</p>
          <div className="submission-entry"><div><span>DergiPark üzerinden çevrimiçi başvuru</span><p>Başvurunuzu başlatmak ve durumunu takip etmek için DergiPark’ı kullanın.</p></div><a className="button button-dark" href={submissionUrl} target="_blank" rel="noreferrer">DergiPark’ta başla <span>↗︎</span></a></div>
          <p className="submission-alternative">DergiPark’ta ilerleyemezseniz <a href={`mailto:${mail}`}>{mail}</a> adresinden bize ulaşın.</p>
        </section>
        <section className="submission-section" id="hazirlik">
          <span className="submission-kicker">Gönderim öncesi</span><h2>Dosyalarınızı hazırlayın</h2>
          <p>Gönderime başlamadan önce yazınızı <a href={canonicalPageHref("/tr/yazarlar/yazim-kurallari")}>yazım kurallarına</a> göre düzenleyin. Akademik makalelerde değerlendirme metni ile yazar bilgilerini ayrı dosyalarda hazırlayın.</p>
          <div className="submission-file-grid">
            <div><Icon name="files"/><h3>Anonim ana metin</h3><p>Word dosyası; özet (en çok 200 kelime), beş anahtar kelime ve APA 7 kaynakça. Yazar kimliğini açığa çıkaran bilgileri çıkarın.</p></div>
            <div><Icon name="authors"/><h3>Yazar dosyası</h3><p>Tüm yazarların adları, kurumları, e-postaları, ORCID bilgileri, sorumlu yazar ve en çok 150 kelimelik biyografiler.</p></div>
            <div><Icon name="check"/><h3>Gerekli ek ve beyanlar</h3><p>Varsa etik kurul/onam bilgisi, fon ve çıkar çatışması beyanları, veri açıklaması ve görsel izinleri.</p></div>
          </div>
          <p className="submission-note">Akademik makaleler özet, notlar ve kaynakça dahil 5.000–9.000 kelime olmalıdır. Diğer yazı türlerinin koşulları için <a href={canonicalPageHref("/tr/yazarlar/yazim-kurallari")}>yazım kurallarına bakın</a>.</p>
        </section>
        <section className="submission-section" id="dergipark">
          <span className="submission-kicker">Adım adım rehber</span><h2>DergiPark ile gönderim</h2>
          <p>Hesabınızla giriş yapın ve BRIQ’in gönderim ekranını açın. Aşağıdaki adımlar başvuruyu tamamlamanıza yardımcı olur.</p>
          <div className="submission-flow-tools"><span>Başvuru adımları</span><button type="button" onClick={() => setAllOpen((open) => !open)}>{allOpen ? "Tüm adımları daralt −" : "Tüm adımları aç +"}</button></div>
          <div className="submission-steps" ref={stepsRef}>{steps.map((step, i) => <details key={step.title} className="submission-step">
            <summary><span className="submission-step-number">{String(i + 1).padStart(2, "0")}</span><Icon name={step.icon}/><span><b>{step.title}</b><small>{step.intro}</small></span></summary>
            <div className="submission-step-body"><p>{step.text}</p><div className="submission-check"><Icon name="check"/><p><b>Devam etmeden önce</b>{step.check}</p></div>{step.href && <a href={step.href} target="_blank" rel="noreferrer">{step.link} ↗︎</a>}</div>
          </details>)}</div>
          <a className="button button-dark submission-main-link" href={submissionUrl} target="_blank" rel="noreferrer">DergiPark başvuru ekranını aç <span>↗︎</span></a>
          <p className="submission-small">DergiPark başka bir sekmede açılır; bu rehber açık kalır. Platformun kullanımına ilişkin <a href="https://dergipark.org.tr/tr/pub/page/egitim-dokumanlari" target="_blank" rel="noreferrer">DergiPark yazar kılavuzunu</a> da inceleyebilirsiniz.</p>
        </section>
        <section className="submission-section" id="eposta">
          <span className="submission-kicker">Alternatif destek</span><h2>E-posta ile gönderim</h2>
          <p>DergiPark’ta başvuruyu tamamlayamıyorsanız yazınızı <a href={`mailto:${mail}`}>{mail}</a> adresine gönderebilirsiniz. Teknik bir sorunla karşılaştıysanız hangi adımda takıldığınızı da belirtin.</p>
          <div className="submission-mail-panel"><Icon name="mail"/><div><span>Alıcı</span><a href={`mailto:${mail}`}>{mail}</a><span>Konu</span><p>Yazı gönderimi — [Yazınızın başlığı]</p><span>Eklenecek dosyalar</span><p>Ana metin, yazar bilgileri dosyası ve yazınız için gerekli ekler.</p><span>Teknik destek için</span><p>Karşılaştığınız hata mesajını ve varsa DergiPark başvuru numaranızı ekleyin.</p></div></div>
          <a className="button button-outline" href={`mailto:${mail}?subject=${encodeURIComponent("Yazı gönderimi — [Yazınızın başlığı]")}`}>E-posta taslağı oluştur <span>→︎</span></a>
          <p className="submission-small">E-posta uygulamanız açılmazsa adresi kopyalayıp kullandığınız uygulamaya ekleyin; dosyaları ayrıca eklemeyi unutmayın.</p>
        </section>
        <section className="submission-section" id="sonrasi"><span className="submission-kicker">Başvurudan sonra</span><h2>Gönderimden sonra</h2><p>Çalışmanız önce editoryal ön incelemeden geçer. Uygun bulunan akademik makaleler çift kör hakem değerlendirmesine gönderilir. Düzeltme taleplerini ve süreç bildirimlerini takip edin.</p><a className="editorial-next-link" href={canonicalPageHref("/tr/yazarlar/yayin-degerlendirme-sureci")}>Yayın değerlendirme sürecini inceleyin →︎</a></section>
      </article>
      <a className="submission-mobile-help" href={`mailto:${mail}`}><Icon name="mail"/><span>DergiPark’ta takıldınız mı?</span><b>E-posta gönder</b></a>
    </div>
  );
}
