export type LegalLocale = "tr" | "en";
export type LegalKind = "privacy" | "cookies";

type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] };
type LegalCopy = { title: string; intro: string; date: string; sections: LegalSection[] };

export const legalPages: Record<LegalLocale, Record<LegalKind, LegalCopy>> = {
  tr: {
    privacy: {
      title: "Gizlilik ve Kişisel Verilerin Korunması",
      intro: "BRIQ web sitesinin teknik işleyişi, ziyaretçi verileri ve kişisel verilerin korunmasına ilişkin bilgilendirme.",
      date: "14 Ekim 2026",
      sections: [
        {
          heading: "Yayıncı ve iletişim",
          paragraphs: [
            "BRIQ (Belt & Road Initiative Quarterly) web sitesinin yayıncısı Çin İş Geliştirme ve Dostluk Derneği'dir (Türk-Çin İş Der). İletişim adresi: Ünalan Mahallesi, Libadiye Caddesi No:84, Üsküdar, İstanbul, Türkiye. Kişisel veri işleme ve ilgili kişi başvuruları hakkında briq@briqjournal.com adresinden iletişim kurulabilir.",
          ],
        },
        {
          heading: "İşlenebilecek veri kategorileri",
          paragraphs: [
            "Web sitesini ziyaret ettiğinizde, barındırma ve güvenlik hizmeti sunan Cloudflare üzerinden IP adresi, isteğin tarihi ve saati, talep edilen adres, tarayıcıya/cihaza ilişkin teknik bilgiler, yaklaşık coğrafi konum ve güvenlik olayları gibi bağlantı verileri işlenebilir.",
            "Cloudflare Web Analytics, sayfaların kullanımını ve performansını toplulaştırılmış biçimde değerlendirmeye yardımcı olur. Bu hizmet analiz için çerez kullanmaz. BRIQ'ın mevcut site kodunda reklam, yeniden pazarlama veya ziyaretler arası kişisel profilleme çerezi bulunmamaktadır.",
            "BRIQ'a e-posta gönderdiğinizde mesajda paylaştığınız ad, adres, iletişim bilgileri ve içerik, talebinizi yanıtlamak amacıyla işlenebilir.",
          ],
        },
        {
          heading: "İşleme amaçları ve hukuki dayanaklar",
          paragraphs: [
            "Bağlantı ve güvenlik verileri; sitenin erişilebilirliğini sağlama, kötüye kullanım ve siber saldırıları önleme, teknik sorunları giderme ve hizmetin güvenliğini koruma amaçlarıyla kullanılabilir. Bu işlemler, somut faaliyet bakımından gerekli ve ölçülü olmak şartıyla 6698 sayılı Kanun'un 5. maddesindeki ilgili hukuki işleme şartlarına, özellikle meşru menfaate dayanabilir.",
            "İletişim taleplerinde gönderdiğiniz bilgiler, talebinizin niteliğine göre sözleşme ilişkisi, hukuki yükümlülük veya meşru menfaat gibi uygun işleme şartları kapsamında ele alınır. Her faaliyet bakımından uygulanacak hukuki dayanak ayrıca değerlendirilir.",
          ],
        },
        {
          heading: "Hizmet sağlayıcılar ve diğer internet siteleri",
          paragraphs: [
            "BRIQ'ın web altyapısında Cloudflare Workers, CDN, Web Analytics ve R2 hizmetleri kullanılmaktadır. Bu hizmetler kapsamında teknik veriler Cloudflare tarafından işlenebilir. Cloudflare'ın uluslararası altyapısı nedeniyle yurt dışı erişim veya veri aktarımı söz konusu olabilir; uygulanacak aktarım güvenceleri ve sözleşmeler ayrıca değerlendirilir.",
            "Yazı gönderimi ve hakemlik süreçleri DergiPark bağlantıları üzerinden yürütülür. DergiPark ve bağlantı verilen diğer harici sitelerin kendi veri işleme uygulamaları bulunabilir.",
          ],
        },
        {
          heading: "Saklama ve güvenlik",
          paragraphs: [
            "Kişisel veriler, ilgili işleme amacı ve geçerli mevzuatın gerektirdiği sürelerle sınırlı tutulmalıdır. Cloudflare kaynaklı teknik kayıtların saklama süreleri kullanılan hizmete ve hesap yapılandırmasına göre değişebilir. İletişim yazışmalarının saklama süreleri ise talebin niteliğine ve uygulanabilir yükümlülüklere bağlıdır.",
            "Yetkisiz erişimi ve kötüye kullanımı azaltmak için hizmet sağlayıcının güvenlik mekanizmalarından yararlanılır. Hiçbir internet hizmetinde mutlak güvenlik garanti edilemez.",
          ],
        },
        {
          heading: "İlgili kişi hakları",
          paragraphs: [
            "6698 sayılı Kanun'un 11. maddesi uyarınca, şartları oluştuğunda kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi isteme, işleme amacını öğrenme, düzeltme veya silinmesini isteme, işlem yapılan üçüncü kişilerin bilgilendirilmesini talep etme ve kanunda öngörülen diğer haklarınızı kullanabilirsiniz.",
            "Başvurularınızı briq@briqjournal.com adresine iletebilirsiniz. Başvurunun değerlendirilmesi için gerekli hâllerde kimlik ve yetki doğrulaması istenebilir.",
          ],
        },
        {
          heading: "Politika değişiklikleri",
          paragraphs: [
            "Teknik altyapı, hizmet sağlayıcılar veya kişisel veri işleme uygulamaları değişirse bu bilgilendirme güncellenir. Zorunlu olmayan izleme teknolojilerinin kullanılması hâlinde gerekli aydınlatma ve izin mekanizmaları ayrıca sağlanır.",
          ],
        },
      ],
    },
    cookies: {
      title: "Çerez Politikası",
      intro: "BRIQ web sitesinde çerezlerin ve benzer tarayıcı teknolojilerinin mevcut kullanımına ilişkin açıklama.",
      date: "14 Ekim 2026",
      sections: [
        {
          heading: "Çerez nedir?",
          paragraphs: [
            "Çerez, bir web sitesinin tarayıcıya kaydedebildiği küçük bir veridir. Çerezlerin bazıları oturum ve güvenlik için, bazıları analitik veya reklam amaçlı kullanılabilir.",
          ],
        },
        {
          heading: "BRIQ'ın mevcut kullanımı",
          paragraphs: [
            "14 Ekim 2026 tarihinde yapılan teknik denetimde test edilen olağan ziyaret akışlarında BRIQ'a ait analitik veya reklam çerezi, yerel depolama ya da oturum depolama kaydı görülmedi. Denetim tüm olası güvenlik senaryolarını kapsamaz.",
            "BRIQ'ın mevcut uygulamasında reklam hedefleme, yeniden pazarlama veya ziyaretçileri ziyaretler arasında çerezle tanıma altyapısı etkin değildir.",
          ],
        },
        {
          heading: "Çerezsiz web analitiği",
          paragraphs: [
            "BRIQ, ziyaretçi trafiğini ve web performansını incelemek için Cloudflare Web Analytics kullanır. Cloudflare'ın açıklamasına göre bu hizmet çerez kullanmaz ve farklı siteler arasında kullanıcı izleme amacı taşımaz.",
            "Çerez kullanılmaması, hizmet sunumunda hiçbir teknik verinin işlenmediği anlamına gelmez. Ayrıntılar Gizlilik ve Kişisel Verilerin Korunması sayfasında açıklanmıştır.",
          ],
        },
        {
          heading: "Koşullu güvenlik çerezleri",
          paragraphs: [
            "Cloudflare, şüpheli veya zararlı trafiğe karşı bir güvenlik doğrulaması uyguladığında, doğrulamayı hatırlamak amacıyla cf_clearance gibi teknik çerezler kullanabilir. Bu çerezin oluşması her ziyaret için zorunlu değildir; varlığı, kapsamı ve süresi uygulanan güvenlik mekanizmasına ve Cloudflare yapılandırmasına bağlıdır.",
            "Bu tür teknik güvenlik çerezleri reklam kişiselleştirmesi amacıyla kullanılmaz. Tarayıcı ayarlarından çerezlerin engellenmesi bazı güvenlik doğrulamalarının tekrar yapılmasına veya erişimin kısıtlanmasına yol açabilir.",
          ],
        },
        {
          heading: "Üçüncü taraf bağlantıları",
          paragraphs: [
            "BRIQ'tan DergiPark ve diğer harici sitelere geçtiğinizde ilgili sitelerin kendi çerez politikaları geçerli olabilir. BRIQ bu sitelerin çerez tercihlerini yönetmez.",
          ],
        },
        {
          heading: "Gelecekteki değişiklikler",
          paragraphs: [
            "BRIQ ileride zorunlu olmayan analitik, kişiselleştirme veya reklam çerezlerini kullanmaya karar verirse bu politika güncellenecek; gerekli olduğu ölçüde çerezler etkinleşmeden önce açık rıza ve tercih yönetimi sağlanacaktır.",
            "Çerezlere ve veri işleme uygulamalarına ilişkin sorular için briq@briqjournal.com adresine yazabilirsiniz.",
          ],
        },
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy and Personal Data Protection",
      intro: "Information about the BRIQ website, technical visitor data and the protection of personal data.",
      date: "14 October 2026",
      sections: [
        {
          heading: "Publisher and contact",
          paragraphs: [
            "BRIQ (Belt & Road Initiative Quarterly) is published by the Turkish-Chinese Business Development and Friendship Association. Contact address: Ünalan Mahallesi, Libadiye Caddesi No:84, Üsküdar, Istanbul, Türkiye. Questions and requests relating to personal data may be sent to briq@briqjournal.com.",
          ],
        },
        {
          heading: "Categories of data",
          paragraphs: [
            "When you visit the website, Cloudflare, which provides hosting and security services, may process connection data such as IP address, request date and time, requested URL, technical browser/device information, approximate location and security events.",
            "Cloudflare Web Analytics supports aggregated assessments of page usage and performance. The service does not use analytics cookies. BRIQ's current website code does not implement advertising, remarketing or cross-visit personal profiling cookies.",
            "When you contact BRIQ by email, the name, contact details and message content you provide may be processed to respond to your enquiry.",
          ],
        },
        {
          heading: "Purposes and legal grounds",
          paragraphs: [
            "Connection and security data may be processed to operate the website, prevent abuse and cyberattacks, resolve technical faults and maintain security. Where necessary and proportionate, the relevant processing conditions of Article 5 of Türkiye's Personal Data Protection Law No. 6698, including legitimate interests, may apply.",
            "Information sent in enquiries is assessed according to the nature of the request and an applicable legal ground, which may include contractual necessity, legal obligation or legitimate interests. The applicable ground must be assessed for each activity.",
          ],
        },
        {
          heading: "Providers and external websites",
          paragraphs: [
            "BRIQ uses Cloudflare Workers, CDN, Web Analytics and R2. Technical data may be processed by Cloudflare through these services. Cloudflare operates an international network, and access or transfers outside Türkiye may occur. The relevant transfer safeguards and contractual arrangements require separate assessment.",
            "Manuscript submissions and reviewer requests are handled through links to DergiPark. DergiPark and other linked websites may apply their own privacy practices.",
          ],
        },
        {
          heading: "Retention and security",
          paragraphs: [
            "Personal data should be retained no longer than necessary for the relevant purpose and legal obligations. Retention of Cloudflare technical logs may vary by service and account configuration. Retention of correspondence depends on the nature of the enquiry and applicable obligations.",
            "Security mechanisms provided by the hosting and security service are used to reduce unauthorised access and abuse. Absolute security cannot be guaranteed.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Subject to applicable requirements, Article 11 of Türkiye's Personal Data Protection Law No. 6698 provides rights to learn whether personal data is processed, request information, understand processing purposes, seek correction or deletion, request notification to recipients and exercise other statutory rights.",
            "Please send requests to briq@briqjournal.com. Identity or authority verification may be needed to process a request.",
          ],
        },
        {
          heading: "Updates",
          paragraphs: [
            "This notice will be updated when technical services or personal-data practices change. Should non-essential tracking technologies be introduced, applicable notices and consent controls will be provided separately.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      intro: "Current use of cookies and related browser technologies on the BRIQ website.",
      date: "14 October 2026",
      sections: [
        {
          heading: "What is a cookie?",
          paragraphs: [
            "A cookie is a small piece of data that a website may store in a browser. Some cookies support sessions and security; others may be used for analytics or advertising.",
          ],
        },
        {
          heading: "Current use on BRIQ",
          paragraphs: [
            "A technical audit on 14 October 2026 found no BRIQ analytics or advertising cookies, localStorage or sessionStorage entries on the ordinary visit paths tested. This audit does not cover every possible security scenario.",
            "The current website does not use cookie-based advertising targeting, remarketing or cross-visit visitor recognition.",
          ],
        },
        {
          heading: "Cookie-free web analytics",
          paragraphs: [
            "BRIQ uses Cloudflare Web Analytics to assess web traffic and performance. According to Cloudflare, Web Analytics does not use cookies or track visitors across different websites.",
            "Cookie-free analytics does not mean that no technical data is processed. See our Privacy and Personal Data Protection notice for details.",
          ],
        },
        {
          heading: "Conditional security cookies",
          paragraphs: [
            "If Cloudflare presents a security challenge in response to suspicious or abusive traffic, it may set a technical cookie such as cf_clearance to remember successful verification. This does not necessarily occur on ordinary visits. Availability, scope and duration depend on the security measure and Cloudflare configuration.",
            "Such security cookies are not used for personalised advertising. Blocking cookies in your browser may lead to repeated challenges or restricted access.",
          ],
        },
        {
          heading: "Third-party websites",
          paragraphs: [
            "If you follow links from BRIQ to DergiPark or another external website, that website may use its own cookies and notices. BRIQ does not manage the cookie preferences of external websites.",
          ],
        },
        {
          heading: "Future changes",
          paragraphs: [
            "If BRIQ introduces non-essential analytics, personalisation or advertising cookies in the future, this notice will be updated and any legally required opt-in consent and preference controls will be provided before such cookies are used.",
            "Questions about cookies or data practices can be sent to briq@briqjournal.com.",
          ],
        },
      ],
    },
  },
};
