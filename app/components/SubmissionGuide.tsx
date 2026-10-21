"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { canonicalPageHref } from "../seo-links";

const submissionUrls = { tr: "https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new", en: "https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new" } as const;
const mail = "briq@briqjournal.com";

const stepsTr = [
  {
    title: "Makale üst verilerini girin",
    intro: "Yayın türünü, başlığı, özeti, anahtar kelimeleri ve diğer istenen alanları doldurun.",
    text: "DergiPark’ın Makale Üst Verileri adımında yayın türünü ve dili seçin. Gerekli başlık, özet ve anahtar kelime alanlarını yazınızın son sürümüne göre doldurun; sistem Türkçe ve İngilizce alanlar istiyorsa ikisini de tamamlayın.",
    check: "Zorunlu alanların tamamlandığını, seçtiğiniz yayın türünü ve başlık/özet bilgilerinin dosyanızla uyumlu olduğunu doğrulayın.",
    icon: "metadata",
  },
  {
    title: "Yazar bilgilerini tamamlayın",
    intro: "Yazarların adlarını, kurumlarını ve iletişim bilgilerini girin.",
    text: "DergiPark’ın Yazarlar adımında tüm yazarları doğru sırayla ekleyin, mevcutsa ORCID bilgilerini yazın ve sorumlu yazarı belirtin.",
    check: "Yazar sıralaması ve e-posta adresleri doğru olmalı; hakemlere gidecek anonim ana metinde kimlik bilgisi bulunmamalıdır.",
    icon: "authors",
  },
  {
    title: "Dosyaları yükleyin",
    intro: "Anonim ana metni, yazar dosyasını ve istenen ekleri yükleyin.",
    text: "Dosyalar aşamasında kimlik bilgileri çıkarılmış Word ana metnini ve yazar bilgilerini ayrı dosyalarda yükleyin. Gerekli diğer ekleri doğru dosya türüyle ilişkilendirin. BRIQ’in DergiPark ekranı intihal.net benzerlik raporu isteyebilir; raporun hazırlanması zaman alabilir ve sonuç e-posta ile bildirilebilir.",
    check: "Yüklenen dosyaların doğru sürümler olduğunu, ana metnin anonimleştirildiğini ve benzerlik raporu sürecinin durumunu kontrol edin.",
    icon: "files",
  },
  {
    title: "Ek bilgileri ve beyanları tamamlayın",
    intro: "Sistemin istediği diğer bilgileri ve etik beyanları girin.",
    text: "Ek Bilgiler aşamasında başvurunuz için istenen beyanları tamamlayın. Gerektiğinde etik kurul/onam bilgilerini, fon ve çıkar çatışması açıklamalarını, veri açıklamasını ve görsel izinlerini ekleyin.",
    check: "Yalnızca başvurunuza uygulanabilen beyanları doğru ve eksiksiz doldurun; zorunlu onayları gözden geçirin.",
    icon: "check",
  },
  {
    title: "Ön izleyin ve gönderimi tamamlayın",
    intro: "Başvuru özetini inceleyin ve son onayı verin.",
    text: "Ön İzleme aşamasında makale üst verilerini, yazarları, dosyaları ve beyanları tek tek kontrol edin. Benzerlik raporu veya zorunlu alanlar beklemedeyse sürecin tamamlanmasını bekleyin. Ardından son gönderim onayını verin.",
    check: "Dosya yüklemek tek başına başvuruyu tamamlamaz. DergiPark’ta gönderimin tamamlandığını ve başvuru durumunuzu gördüğünüzden emin olun.",
    icon: "send",
  },
];

const stepsEn = [
  {
    title: "Enter manuscript metadata",
    intro: "Choose the submission type and provide the title, abstract, keywords and required fields.",
    text: "Under Manuscript Metadata, select the appropriate publication type and manuscript language. Enter the title, abstract and keywords exactly as in your final manuscript. Complete both language fields where the platform requests them.",
    check: "Confirm that every required field is complete and that the publication type, title and abstract match your manuscript.",
    icon: "metadata",
  },
  {
    title: "Add the authors",
    intro: "Provide all authors’ names, affiliations and contact details.",
    text: "Under Authors, add everyone in the correct order, include ORCID identifiers where available, and identify the corresponding author.",
    check: "Check the order and email addresses. Author-identifying information must not appear in the anonymised main manuscript sent for review.",
    icon: "authors",
  },
  {
    title: "Upload the files",
    intro: "Upload your anonymised manuscript, author details and required attachments.",
    text: "Under Files, upload the anonymised Word manuscript and the separate author-information file. Attach any other required documents in the correct categories. BRIQ’s DergiPark submission page requests an intihal.net similarity report; processing can take time, and the result may be sent by email.",
    check: "Confirm the uploaded versions are correct, the main manuscript is anonymised, and any similarity-report processing is complete.",
    icon: "files",
  },
  {
    title: "Complete additional information",
    intro: "Fill in supplementary fields and declarations requested by the system.",
    text: "Under Additional Information, complete the declarations relevant to your submission. Where applicable, include ethics approval or consent, funding, competing interests, data availability and permissions for third-party images.",
    check: "Review all required declarations and approvals, and ensure they are accurate and complete.",
    icon: "check",
  },
  {
    title: "Preview and complete submission",
    intro: "Review the submission summary and provide final confirmation.",
    text: "Under Preview, verify the manuscript metadata, authors, files and declarations. Wait for any outstanding required fields or similarity reports, then confirm the final submission.",
    check: "Uploading files alone does not complete a submission. Make sure DergiPark confirms submission and shows its status.",
    icon: "send",
  },
];

const copy = {
  tr: {
    toc: "Bu sayfada", start: "Başvurunuzu başlatın", prepare: "Dosyalarınızı hazırlayın", platform: "DergiPark ile gönderim", support: "E-posta ile gönderim", after: "Gönderimden sonra",
    helpTitle: "Bir adımda takıldınız mı?", helpText: "Size yardımcı olalım. Bize e-posta gönderin.",
    channel: "Gönderim kanalı", channelText: "BRIQ’e Türkçe veya İngilizce yazı gönderebilirsiniz. Başvuru ve yayın ücretsizdir. DergiPark üzerinden başvurarak gönderinizi ve değerlendirme sürecinizi takip edebilirsiniz.",
    entryTitle: "DergiPark üzerinden çevrimiçi başvuru", entryText: "Başvurunuzu başlatmak ve durumunu takip etmek için DergiPark’ı kullanın.", entryCta: "DergiPark’ta başla",
    alternativeBefore: "DergiPark’ta ilerleyemezseniz ", alternativeAfter: " adresinden bize ulaşın.",
    before: "Gönderim öncesi", prepareBefore: "Gönderime başlamadan önce yazınızı ", rules: "yazım kurallarına", prepareAfter: " göre düzenleyin. Akademik makalelerde değerlendirme metni ile yazar bilgilerini ayrı dosyalarda hazırlayın.",
    fileOne: "Anonim ana metin", fileOneText: "Word dosyası; özet (en çok 200 kelime), beş anahtar kelime ve APA 7 kaynakça. Yazar kimliğini açığa çıkaran bilgileri çıkarın.",
    fileTwo: "Yazar dosyası", fileTwoText: "Tüm yazarların adları, kurumları, e-postaları, mevcutsa ORCID bilgileri, sorumlu yazar ve en çok 150 kelimelik biyografiler.",
    fileThree: "Gerekli ek ve beyanlar", fileThreeText: "Varsa etik kurul/onam bilgisi, fon ve çıkar çatışması beyanları, veri açıklaması ve görsel izinleri.",
    noteBefore: "Akademik makaleler özet, notlar ve kaynakça dahil 5.000–9.000 kelime olmalıdır. Diğer yazı türlerinin koşulları için ", noteLink: "yazım kurallarına bakın",
    guide: "Adım adım rehber", guideIntro: "Önce DergiPark hesabınıza giriş yapın. Ardından platformun beş başvuru aşamasını aşağıdaki sırayla tamamlayın.",
    loginBefore: "Başlamadan önce: ", loginText: "DergiPark hesabınızla giriş yapın veya yeni bir hesap oluşturun.", loginLink: "DergiPark’a giriş yapın",
    stepsLabel: "Başvuru adımları", expand: "Tüm adımları aç +", collapse: "Tüm adımları daralt −", checkLabel: "Devam etmeden önce",
    openSubmit: "DergiPark başvuru ekranını aç", guideAfterBefore: "DergiPark başka bir sekmede açılır; bu rehber açık kalır. Platformun kullanımına ilişkin ", guideDoc: "DergiPark yazar kılavuzunu", guideAfterEnd: " da inceleyebilirsiniz.",
    supportKicker: "Alternatif destek", supportTextBefore: "DergiPark’ta başvuruyu tamamlayamıyorsanız yazınızı ", supportTextAfter: " adresine gönderebilirsiniz. Teknik bir sorunla karşılaştıysanız hangi adımda takıldığınızı da belirtin.",
    recipient: "Alıcı", subject: "Konu", subjectText: "Yazı gönderimi — [Yazınızın başlığı]", attachments: "Eklenecek dosyalar", attachmentsText: "Ana metin, yazar bilgileri dosyası ve yazınız için gerekli ekler.", tech: "Teknik destek için", techText: "Karşılaştığınız hata mesajını ve varsa DergiPark başvuru numaranızı ekleyin.", mailCta: "E-posta taslağı oluştur", mailNote: "E-posta uygulamanız açılmazsa adresi kopyalayıp kullandığınız uygulamaya ekleyin; dosyaları ayrıca eklemeyi unutmayın.",
    afterKicker: "Başvurudan sonra", afterText: "Çalışmanız önce editoryal ön incelemeden geçer. Uygun bulunan akademik makaleler çift kör hakem değerlendirmesine gönderilir. Düzeltme taleplerini ve süreç bildirimlerini takip edin.", afterLink: "Yayın değerlendirme sürecini inceleyin",
  },
  en: {
    toc: "On this page", start: "Start your submission", prepare: "Prepare your files", platform: "Submit through DergiPark", support: "Email assistance", after: "After submission",
    helpTitle: "Need help with a step?", helpText: "Contact our editorial team by email.",
    channel: "Submission channel", channelText: "BRIQ accepts manuscripts in Turkish or English. Submission and publication are free. Use DergiPark to submit your work and follow its editorial progress.",
    entryTitle: "Submit online through DergiPark", entryText: "Use DergiPark to start your application and track its status.", entryCta: "Start on DergiPark",
    alternativeBefore: "If you cannot complete the process on DergiPark, contact ", alternativeAfter: " for assistance.",
    before: "Before submission", prepareBefore: "Before submitting, format your manuscript according to the ", rules: "submission guidelines", prepareAfter: ". For scholarly articles, prepare the anonymised review manuscript and author details in separate files.",
    fileOne: "Anonymised manuscript", fileOneText: "Word file with an abstract (up to 200 words), five keywords and references in APA 7 style. Remove author-identifying information.",
    fileTwo: "Author information", fileTwoText: "All authors’ names, affiliations, emails, ORCID identifiers where available, corresponding author and biographies of up to 150 words.",
    fileThree: "Attachments and declarations", fileThreeText: "Where applicable, provide ethics approval/consent, funding and competing-interest statements, data information and image permissions.",
    noteBefore: "Scholarly articles must be 5,000–9,000 words including abstracts, notes and references. For other submission types, see the ", noteLink: "submission guidelines",
    guide: "Step-by-step guide", guideIntro: "Sign in to your DergiPark account first, then complete the platform’s five submission stages in order.",
    loginBefore: "Before you begin: ", loginText: "Sign in to your DergiPark account or create a new one.", loginLink: "Sign in to DergiPark",
    stepsLabel: "Submission steps", expand: "Expand all steps +", collapse: "Collapse all steps −", checkLabel: "Before continuing",
    openSubmit: "Open DergiPark submission", guideAfterBefore: "DergiPark opens in a new tab so you can keep this guide visible. You can also consult the ", guideDoc: "DergiPark author documentation", guideAfterEnd: ".",
    supportKicker: "Alternative support", supportTextBefore: "If you cannot complete the submission on DergiPark, you may send your manuscript to ", supportTextAfter: ". Please describe the step and error if you encounter a technical problem.",
    recipient: "Recipient", subject: "Subject", subjectText: "Manuscript submission — [Manuscript title]", attachments: "Files to attach", attachmentsText: "Main manuscript, author-information file and any necessary attachments.", tech: "For technical support", techText: "Include any error message and your DergiPark submission number, if available.", mailCta: "Create email draft", mailNote: "If your email application does not open, copy the address into your preferred email client and attach the files manually.",
    afterKicker: "After submission", afterText: "Your manuscript first undergoes editorial screening. Suitable scholarly articles proceed to double-blind peer review. Monitor revision requests and process notifications.", afterLink: "Read the publication review process",
  },
} as const;

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

export function SubmissionGuide({ locale = "tr" }: { locale?: "tr" | "en" }) {
  const [allOpen, setAllOpen] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);
  const t = copy[locale];
  const currentSteps = locale === "en" ? stepsEn : stepsTr;
  const submissionUrl = submissionUrls[locale];
  const rulesUrl = canonicalPageHref(locale === "en" ? "/en/for-authors/guidelines" : "/tr/yazarlar/yazim-kurallari");
  const reviewUrl = canonicalPageHref(locale === "en" ? "/en/for-authors/review-process" : "/tr/yazarlar/yayin-degerlendirme-sureci");
  const loginUrl = `https://dergipark.org.tr/${locale}/login`;
  const docsUrl = `https://dergipark.org.tr/${locale}/pub/page/egitim-dokumanlari`;

  useEffect(() => {
    stepsRef.current?.querySelectorAll("details").forEach((item) => { item.open = allOpen; });
  }, [allOpen]);

  return (
    <div className="site-shell submission-guide">
      <aside className="submission-side">
        <nav aria-label={t.toc}>
          <b>{t.toc}</b>
          <a href="#basvuru">{t.start}</a>
          <a href="#hazirlik">{t.prepare}</a>
          <a href="#dergipark">{t.platform}</a>
          <a href="#eposta">{t.support}</a>
          <a href="#sonrasi">{t.after}</a>
        </nav>
        <div className="submission-side-help"><Icon name="mail"/><h2>{t.helpTitle}</h2><p>{t.helpText}</p><a href={`mailto:${mail}`}>{mail}</a></div>
      </aside>
      <article className="submission-content">
        <section className="submission-section" id="basvuru">
          <span className="submission-kicker">{t.channel}</span>
          <h2>{t.start}</h2>
          <p>{t.channelText}</p>
          <div className="submission-entry"><div><span>{t.entryTitle}</span><p>{t.entryText}</p></div><a className="button button-dark" href={submissionUrl} target="_blank" rel="noreferrer">{t.entryCta} <span>↗︎</span></a></div>
          <p className="submission-alternative">{t.alternativeBefore}<a href={`mailto:${mail}`}>{mail}</a>{t.alternativeAfter}</p>
        </section>
        <section className="submission-section" id="hazirlik">
          <span className="submission-kicker">{t.before}</span><h2>{t.prepare}</h2>
          <p>{t.prepareBefore}<a href={rulesUrl}>{t.rules}</a>{t.prepareAfter}</p>
          <div className="submission-file-grid">
            <div><Icon name="files"/><h3>{t.fileOne}</h3><p>{t.fileOneText}</p></div>
            <div><Icon name="authors"/><h3>{t.fileTwo}</h3><p>{t.fileTwoText}</p></div>
            <div><Icon name="check"/><h3>{t.fileThree}</h3><p>{t.fileThreeText}</p></div>
          </div>
          <p className="submission-note">{t.noteBefore}<a href={rulesUrl}>{t.noteLink}</a>.</p>
        </section>
        <section className="submission-section" id="dergipark">
          <span className="submission-kicker">{t.guide}</span><h2>{t.platform}</h2>
          <p>{t.guideIntro}</p>
          <div className="submission-login-note"><Icon name="login"/><p><strong>{t.loginBefore}</strong>{t.loginText} <a href={loginUrl} target="_blank" rel="noreferrer">{t.loginLink} ↗︎</a></p></div>
          <div className="submission-flow-tools"><span>{t.stepsLabel}</span><button type="button" aria-controls="submission-steps" aria-expanded={allOpen} onClick={() => setAllOpen((open) => !open)}>{allOpen ? t.collapse : t.expand}</button></div>
          <div className="submission-steps" id="submission-steps" ref={stepsRef}>{currentSteps.map((step, i) => <details key={step.title} className="submission-step">
            <summary><span className="submission-step-number">{String(i + 1).padStart(2, "0")}</span><Icon name={step.icon}/><span><b>{step.title}</b><small>{step.intro}</small></span></summary>
            <div className="submission-step-body"><p>{step.text}</p><div className="submission-check"><Icon name="check"/><p><b>{t.checkLabel}</b>{step.check}</p></div></div>
          </details>)}</div>
          <a className="button button-dark submission-main-link" href={submissionUrl} target="_blank" rel="noreferrer">{t.openSubmit} <span>↗︎</span></a>
          <p className="submission-small">{t.guideAfterBefore}<a href={docsUrl} target="_blank" rel="noreferrer">{t.guideDoc}</a>{t.guideAfterEnd}</p>
        </section>
        <section className="submission-section" id="eposta">
          <span className="submission-kicker">{t.supportKicker}</span><h2>{t.support}</h2>
          <p>{t.supportTextBefore}<a href={`mailto:${mail}`}>{mail}</a>{t.supportTextAfter}</p>
          <div className="submission-mail-panel"><Icon name="mail"/><div><span>{t.recipient}</span><a href={`mailto:${mail}`}>{mail}</a><span>{t.subject}</span><p>{t.subjectText}</p><span>{t.attachments}</span><p>{t.attachmentsText}</p><span>{t.tech}</span><p>{t.techText}</p></div></div>
          <a className="button button-outline" href={`mailto:${mail}?subject=${encodeURIComponent(t.subjectText)}`}>{t.mailCta} <span>→︎</span></a>
          <p className="submission-small">{t.mailNote}</p>
        </section>
        <section className="submission-section" id="sonrasi"><span className="submission-kicker">{t.afterKicker}</span><h2>{t.after}</h2><p>{t.afterText}</p><a className="editorial-next-link" href={reviewUrl}>{t.afterLink} →︎</a></section>
      </article>
    </div>
  );
}
