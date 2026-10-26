"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { canonicalPageHref } from "../seo-links";

const submissionUrls = { tr: "https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new", en: "https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new" } as const;
const mail = "briq@briqjournal.com";

const stepsTr = [
  {
    title: "Makale üst verilerini girin",
    intro: "Çalışmanızın türünü, başlığını, özetini ve anahtar kelimelerini girin.",
    text: "DergiPark’ın “Makale Üst Verileri” aşamasında çalışmanızın türünü ve dilini seçin. Başlık, özet ve anahtar kelime bilgilerini gönderime hazır metninizle uyumlu biçimde girin. Platform her iki dilde bilgi istiyorsa ilgili alanları tamamlayın.",
    check: "Yayın türünü, başlık ve özet bilgilerini dosyanızla karşılaştırın. Zorunlu alanların eksiksiz olduğundan emin olun.",
    icon: "metadata",
  },
  {
    title: "Yazar bilgilerini tamamlayın",
    intro: "Yazarların adlarını, kurum bilgilerini ve iletişim bilgilerini girin.",
    text: "Tüm yazarların adlarını, kurum bilgilerini ve e-posta adreslerini girin. Varsa ORCID numaralarını ekleyin, yazar sıralamasını kontrol edin ve sorumlu yazarı belirtin.",
    check: "Yazar sıralamasını ve iletişim bilgilerini doğrulayın. Hakem değerlendirmesine sunulacak ana metinde yazar kimliğini açığa çıkarabilecek bilgiler bulunmamalıdır.",
    icon: "authors",
  },
  {
    title: "Dosyalarınızı yükleyin",
    intro: "Anonimleştirilmiş ana metni, kapak dosyasını ve gerekli ekleri yükleyin.",
    text: "Anonimleştirilmiş ana metni ve yazar bilgilerini içeren kapak dosyasını ayrı ayrı yükleyin. Gerekli ek belgeleri uygun alanlara ekleyin. DergiPark’ın intihal.net üzerinden yürüttüğü benzerlik raporu işlemi zaman alabilir; işlem tamamlandığında e-posta ile bilgilendirilebilirsiniz.",
    check: "Dosyaların doğru sürümlerini yüklediğinizi ve ana metinden yazar kimlik bilgilerini çıkardığınızı kontrol edin. Gerekliyse benzerlik raporunun tamamlanmasını bekleyin.",
    icon: "files",
  },
  {
    title: "Ek bilgileri ve beyanları tamamlayın",
    intro: "Gönderim için talep edilen ek bilgileri ve etik beyanları girin.",
    text: "Çalışmanız için gerekli etik beyanları ve ek bilgileri tamamlayın. Gerektiğinde etik kurul onayı, fon ve çıkar çatışması açıklamaları, veri erişimine ilişkin bilgiler ve görsel kullanım izinlerini ilgili alanlara ekleyin.",
    check: "Çalışmanız için geçerli olan beyanları ve gerekli onayları gözden geçirin. İstenen bilgilerin doğru ve eksiksiz olduğundan emin olun.",
    icon: "check",
  },
  {
    title: "Gönderiminizi gözden geçirin ve tamamlayın",
    intro: "Ön İzleme aşamasında bilgileri ve dosyaları kontrol ederek gönderiminizi tamamlayın.",
    text: "“Ön İzleme” aşamasında girdiğiniz bilgileri ve yüklediğiniz dosyaları kontrol edin. Gerekli onayları tamamladıktan sonra gönderiminizi sonlandırın. Benzerlik raporu henüz hazırlanıyorsa ilgili bildirimi bekleyin. İşlemin başarıyla tamamlandığını DergiPark üzerinden doğrulayın.",
    check: "Dosyalarınızı yüklemiş olmanız gönderimin tamamlandığı anlamına gelmez. Son onayı verdiğinizden ve başvuru durumunuzun DergiPark’ta göründüğünden emin olun.",
    icon: "send",
  },
];

const stepsEn = [
  {
    title: "Enter manuscript metadata",
    intro: "Provide your manuscript type, title, abstract and keywords.",
    text: "In DergiPark’s “Manuscript Metadata” section, select the type and language of your manuscript. Enter the title, abstract and keywords as they appear in your final manuscript. Complete both language fields if the platform requests them.",
    check: "Review the manuscript type, title and abstract against your final file, and make sure all required fields are complete.",
    icon: "metadata",
  },
  {
    title: "Complete author information",
    intro: "Enter the authors’ names, affiliations and contact details.",
    text: "Enter each author’s name, affiliation and email address. Add ORCID identifiers where available, review the author order and designate the corresponding author.",
    check: "Confirm the author order and contact details. Ensure that the manuscript prepared for peer review does not reveal the authors’ identities.",
    icon: "authors",
  },
  {
    title: "Upload your files",
    intro: "Upload the anonymised manuscript, title-page file and any required attachments.",
    text: "Upload the anonymised manuscript and a separate title-page file containing author information. Add any required supporting documents in the appropriate fields. DergiPark’s similarity check through intihal.net may take some time; you may receive an email when processing is complete.",
    check: "Make sure you have uploaded the correct file versions and removed identifying information from the main manuscript. Wait for the similarity report if required.",
    icon: "files",
  },
  {
    title: "Complete additional information",
    intro: "Provide the additional details and ethical declarations requested for submission.",
    text: "Complete the declarations and additional information relevant to your work. Where applicable, include ethics approval, funding and competing-interest statements, data availability information and permissions to use third-party images.",
    check: "Review the declarations and approvals relevant to your submission, and make sure the requested information is accurate and complete.",
    icon: "check",
  },
  {
    title: "Review and complete your submission",
    intro: "Check the details and files in Preview before confirming your submission.",
    text: "In the “Preview” section, review the details you entered and the files you uploaded. Complete any required approvals before confirming your submission. If the similarity report is still being processed, wait for the relevant notification. Check DergiPark to make sure your submission has been completed successfully.",
    check: "Uploading your files alone does not complete the submission. Confirm the final step and verify that your submission status is visible on DergiPark.",
    icon: "send",
  },
];

const copy = {
  tr: {
    toc: "Bu sayfada",
    start: "Gönderime başlayın",
    prepare: "Dosyalarınızı hazırlayın",
    platform: "DergiPark üzerinden gönderim",
    support: "Alternatif gönderim ve destek",
    after: "Gönderim sonrası süreç",
    helpTitle: "Gönderimle ilgili sorularınız mı var?",
    helpText: "Sorularınız için BRIQ Yazıişleri ile iletişime geçebilirsiniz.",
    channel: "Gönderim kanalı",
    channelText: "BRIQ, Türkçe ve İngilizce çalışmaları kabul etmektedir. Yazı gönderimi ve yayımlanması için herhangi bir ücret talep edilmez. Çalışmanızı DergiPark üzerinden gönderebilir ve değerlendirme sürecini aynı platformdan takip edebilirsiniz.",
    entryTitle: "DergiPark üzerinden yazı gönderimi",
    entryText: "Yazınızı DergiPark üzerinden gönderebilir ve değerlendirme sürecini takip edebilirsiniz.",
    entryCta: "DergiPark’ta yazı gönderin",
    alternativeBefore: "Gönderim sırasında teknik bir sorunla karşılaşırsanız ",
    alternativeAfter: " adresinden bizimle iletişime geçebilirsiniz.",
    before: "Gönderim öncesi",
    prepareBefore: "Gönderim öncesinde çalışmanızı BRIQ ",
    rules: "Yazım Kurallarına",
    prepareAfter: " uygun biçimde hazırlayın. Akademik makalelerde, hakem değerlendirmesine sunulacak anonimleştirilmiş ana metni ve yazar bilgilerini içeren kapak dosyasını ayrı ayrı hazırlayın.",
    fileOne: "Anonimleştirilmiş ana metin",
    fileOneText: "Ana metninizi Word formatında hazırlayın. Metinde en fazla 200 kelimelik özet, beş anahtar kelime ve APA 7 kurallarına uygun kaynakça bulunmalıdır. Yazar kimliğini ortaya çıkarabilecek bilgileri metinden çıkarın.",
    fileTwo: "Yazar bilgileri (kapak dosyası)",
    fileTwoText: "Kapak dosyasında tüm yazarların adlarına, kurum ve e-posta bilgilerine, varsa ORCID numaralarına, sorumlu yazara ve en fazla 150 kelimelik kısa biyografilere yer verin.",
    fileThree: "Ek belgeler ve beyanlar",
    fileThreeText: "Gerektiğinde etik kurul/onam bilgilerini, fon ve çıkar çatışması beyanlarını, veri açıklamalarını ve görsel kullanım izinlerini hazırlayın.",
    noteBefore: "Akademik makaleler özet, notlar ve kaynakça dahil 5.000–9.000 kelime olmalıdır. Diğer yazı türlerinin koşulları için ",
    noteLink: "yazım kurallarını inceleyin",
    guide: "Gönderim rehberi",
    guideIntro: "Önce DergiPark hesabınıza giriş yapın. Ardından platformun beş gönderim aşamasını sırasıyla tamamlayın.",
    loginBefore: "DergiPark hesabı: ",
    loginText: "Hesabınıza giriş yapın veya yeni bir hesap oluşturun.",
    loginLink: "DergiPark’a giriş yapın",
    stepsLabel: "Gönderim adımları",
    expand: "Tüm adımları aç +",
    collapse: "Tüm adımları daralt −",
    checkLabel: "Kontrol etmeniz gerekenler",
    openSubmit: "DergiPark başvuru ekranını aç",
    guideAfterBefore: "DergiPark yeni bir sekmede açılır. Ayrıntılı bilgi için ",
    guideDoc: "DergiPark yazar kılavuzunu",
    guideAfterEnd: " da inceleyebilirsiniz.",
    supportKicker: "Alternatif gönderim",
    supportTextBefore: "DergiPark üzerinden gönderiminizi teknik bir sorun nedeniyle tamamlayamıyorsanız çalışmanızı ve gerekli belgeleri ",
    supportTextAfter: " adresine gönderebilirsiniz. E-postanızda karşılaştığınız sorunu ve varsa DergiPark başvuru numaranızı belirtmenizi rica ederiz.",
    recipient: "Alıcı",
    subject: "Konu",
    subjectText: "Yazı gönderimi — [Yazınızın başlığı]",
    attachments: "Eklenecek dosyalar",
    attachmentsText: "Ana metin, yazar bilgilerini içeren kapak dosyası ve çalışmanız için gerekli ek belgeler.",
    tech: "Teknik sorun yaşadıysanız",
    techText: "Karşılaştığınız hata mesajını ve varsa DergiPark başvuru numaranızı belirtin.",
    mailCta: "E-posta gönderin",
    afterKicker: "Gönderim sonrası",
    afterText: "Gönderdiğiniz çalışma öncelikle BRIQ Yayın İlkeleri, yazım kuralları ve yayın etiği açısından editoryal ön incelemeye alınır. Ön incelemeyi geçen akademik makaleler çift kör hakem değerlendirmesine gönderilir. Değerlendirme sonuçlarını ve varsa düzeltme taleplerini DergiPark üzerinden takip edebilirsiniz.",
    afterLink: "Yayın değerlendirme sürecini inceleyin",
  },
  en: {
    toc: "On this page",
    start: "Start Your Submission",
    prepare: "Prepare Your Files",
    platform: "Submit Through DergiPark",
    support: "Alternative Submission and Support",
    after: "After Submission",
    helpTitle: "Questions About Your Submission?",
    helpText: "You can contact the BRIQ Editorial Office with any questions.",
    channel: "Submission channel",
    channelText: "BRIQ welcomes submissions in Turkish and English. There are no submission or publication fees. You can submit your work through DergiPark and follow the review process on the same platform.",
    entryTitle: "Submit your manuscript through DergiPark",
    entryText: "You can submit your manuscript and track its progress through DergiPark.",
    entryCta: "Submit via DergiPark",
    alternativeBefore: "If you encounter a technical problem during submission, you can contact us at ",
    alternativeAfter: ".",
    before: "Before submission",
    prepareBefore: "Before submitting, prepare your manuscript in accordance with the ",
    rules: "BRIQ Submission Guidelines",
    prepareAfter: ". For scholarly articles, prepare the anonymised manuscript for peer review and a separate title-page file containing the authors’ details.",
    fileOne: "Anonymised manuscript",
    fileOneText: "Prepare your main manuscript as a Word document. It should include an abstract of no more than 200 words, five keywords and references in APA 7 style. Remove information that could identify the authors.",
    fileTwo: "Author information (title page)",
    fileTwoText: "Include all authors’ names, affiliations and email addresses, ORCID identifiers where available, the corresponding author and short biographies of up to 150 words.",
    fileThree: "Supporting documents and declarations",
    fileThreeText: "Where relevant, prepare ethics approval or consent information, funding and competing-interest declarations, data statements and permissions for images.",
    noteBefore: "Scholarly articles should be 5,000–9,000 words, including the abstract, notes and references. For other contribution types, please ",
    noteLink: "review the submission guidelines",
    guide: "Submission Guide",
    guideIntro: "First, sign in to your DergiPark account. Then complete the platform’s five submission stages in order.",
    loginBefore: "DergiPark account: ",
    loginText: "Sign in to your account or create a new one.",
    loginLink: "Sign in to DergiPark",
    stepsLabel: "Submission steps",
    expand: "Expand all steps +",
    collapse: "Collapse all steps −",
    checkLabel: "Before You Continue",
    openSubmit: "Open the DergiPark Submission Page",
    guideAfterBefore: "DergiPark opens in a new tab. For more information, you can also consult the ",
    guideDoc: "DergiPark author guide",
    guideAfterEnd: ".",
    supportKicker: "Alternative submission",
    supportTextBefore: "If a technical issue prevents you from completing your submission through DergiPark, you can email your manuscript and required documents to ",
    supportTextAfter: ". Please include a brief description of the issue and your DergiPark submission number, if available.",
    recipient: "Recipient",
    subject: "Subject",
    subjectText: "Manuscript submission — [Manuscript title]",
    attachments: "Files to attach",
    attachmentsText: "Main manuscript, separate author-information (title-page) file and any required supporting documents.",
    tech: "If you encountered a technical problem",
    techText: "Please include any error message and your DergiPark submission number, if available.",
    mailCta: "Contact the Editorial Office",
    afterKicker: "Editorial review",
    afterText: "We first review your submission for compliance with BRIQ’s Principles of Publication, submission guidelines and publication ethics. Scholarly articles that pass this initial screening proceed to double-blind peer review. You can follow the review outcome and any revision requests through DergiPark.",
    afterLink: "Read the Publication Review Process",
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
          
        </section>
        <section className="submission-section" id="sonrasi"><span className="submission-kicker">{t.afterKicker}</span><h2>{t.after}</h2><p>{t.afterText}</p><a className="editorial-next-link" href={reviewUrl}>{t.afterLink} →︎</a></section>
      </article>
    </div>
  );
}
