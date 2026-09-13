export type CallEditorialCopy = {
  paragraphs: string[];
  topics?: [string, string[]][];
  note?: string;
};

const suggestedBooks = [
  "Arduino, A., & Xue, G. (Eds.). (2018). Securing the Belt and Road Initiative: Risk assessment, private security and special insurances along the new wave of Chinese outbound investments. Palgrave Macmillan.",
  "Arduino, A. (2018). China’s private army: Protecting the New Silk Road. Palgrave Pivot.",
  "Berlie, J. A. (Ed.). (2020). China’s globalization and the Belt and Road Initiative. Palgrave Macmillan.",
  "Blanchard, J. M. F. (Ed.). (2018). China’s Maritime Silk Road Initiative and South Asia: A political economic analysis of its purposes, perils, and promise. Palgrave.",
  "Blanchard, J. M. F. (Ed.). (2019). China’s Maritime Silk Road Initiative and Southeast Asia: Dilemmas, doubts, and determination. Palgrave Macmillan.",
  "Cai, F., & Nolan, P. (Eds.). (2019). Routledge handbook of the Belt and Road. Routledge.",
  "Cheng, Y., Song, L., & Huang, L. (Eds.). (2018). The Belt & Road Initiative in the global arena: Chinese and European perspectives. Palgrave Macmillan.",
  "Deepak, B. R. (Ed.). (2018). China’s global rebalancing and the New Silk Road. Springer.",
  "Ehteshami, A., & Horesh, N. (Eds.). (2018). China’s presence in the Middle East: The implications of the One Belt, One Road Initiative. Routledge.",
  "Islam, N. Md. (2019). Silk Road to Belt Road: Reinventing the past and shaping the future. Springer.",
  "Joshua, J. (2019). The Belt and Road Initiative and the global economy: Volume I—Trade and economic development. Palgrave Macmillan.",
  "Joshua, J. (2019). The Belt and Road Initiative and the global economy: Volume II—The changing international financial system and implications. Palgrave Macmillan.",
  "Łasak, P., & Van der Linden, R. W. H. (2019). The financial implications of China’s Belt and Road Initiative: A route to more sustainable economic growth. Palgrave Pivot.",
  "Liang, H., & Zhang, Y. (2019). The theoretical system of Belt and Road Initiative. Springer.",
  "Liu, W., & Zhang, H. (Eds.). (2019). Regional mutual benefit and win-win under the double circulation of global value. Springer.",
  "Liu, W. (Ed.). (2018). China’s Belt and Road Initiatives: Economic geography reformation. Springer.",
  "Maçaes, B. (2018). Belt and Road: A Chinese world order. Hurst.",
  "Mayer, M. (Ed.). (2018). Rethinking the Silk Road: China’s Belt and Road Initiative and emerging Eurasian relations. Palgrave Macmillan.",
  "Shan, W., Nuotio, K., & Zhang, K. (Eds.). (2018). Normative readings of the Belt and Road Initiative: Road to new paradigms. Springer.",
  "Shang, H. (2019). The Belt and Road Initiative: Key concepts. Springer.",
  "Simelane, T., & Managa, L. R. (Eds.). (2018). Belt and Road Initiative: Alternative development path for Africa. Africa Institute of South Africa.",
  "Syed, J., & Ying, Y. H. (Eds.). (2019). China’s Belt and Road Initiative in a global context: Volume I—A business and management perspective. Palgrave Macmillan.",
  "Syed, J., & Ying, Y. H. (Eds.). (2020). China’s Belt and Road Initiative in a global context: Volume II—The China-Pakistan Economic Corridor and its implications for business. Palgrave Macmillan.",
  "Thaliyakkattil, S. (2019). China’s Achilles’ heel: The Belt and Road Initiative and its Indian discontents. Palgrave Macmillan.",
  "Wolf, S. O. (2020). The China-Pakistan Economic Corridor of the Belt and Road Initiative. Springer International Publishing.",
  "Xing, L. (Ed.). (2018). Mapping China’s ‘One Belt One Road’ Initiative. Palgrave Macmillan.",
  "Xu, F. (2018). The Belt and Road: The global strategy of China high-speed railway. Springer.",
  "Yang, L., Bork, H.-R., Fang, X., & Mischke, S. (Eds.). (2019). Socio-environmental dynamics along the Historical Silk Road. Springer.",
  "Zhang, Q., Li, C., Wu, H., & Wang, M. (2019). 21st century Maritime Silk Road: Construction of remote islands and reefs. Springer.",
  "Zhang, Q., Xiao, Z., Zhou, W., Chen, X., & Chen, X. (2018). 21st century Maritime Silk Road: A peaceful way forward. Springer.",
  "Zhang, W., Alon, I., & Lattemann, C. (Eds.). (2018). China’s Belt and Road Initiative: Changing the rules of globalization. Palgrave Macmillan.",
  "Zheng, C., Xu, J., Zhan, C., & Wang, Q. (2020). 21st century Maritime Silk Road: Wave energy resource evaluation. Springer.",
  "Zou, L. (2018). The political economy of China’s Belt and Road Initiative. World Scientific Publishing.",
];

const aiTopicsTr = [
  "Yapay zekânın ve robotlaşmanın üretici güçlerin gelişimi üzerindeki etkileri; emek süreci, verimlilik, sanayi politikaları ve teknolojik dönüşüm",
  "Yapay zekâ ve robotlaşmanın işgücü üzerindeki etkileri; mavi yakalı emeğin otomasyonu, beyaz yakalı bilişsel emeğin dönüşümü, işsizleşme riski, yeniden vasıflanma, emek piyasasında kutuplaşma ve üretkenlik artışının toplumsal bölüşümü",
  "Yapay zekâ ile bilimsel üretim arasındaki ilişki; araştırma süreçleri, keşif hızı, doğrulama mekanizmaları ve akademik emek",
  "Yapay zekânın sağlık, eğitim, tarım, ulaştırma, afet yönetimi, enerji ve yerel yönetimler gibi alanlarda kamusal yarar doğrultusunda kullanımı",
  "Büyük teknoloji şirketlerinin yapay zekâ alanındaki konumu; veri mülkiyeti, altyapı denetimi, platform gücü ve dijital bağımlılık ilişkileri",
  "Yapay zekânın bireysel tüketim, reklamcılık ve gözetim alanlarındaki kullanımlarının toplumsal sonuçları",
  "Yapay zekânın kamucu, planlamacı veya toplum yararını önceleyen kullanımlarına ilişkin karşılaştırmalı ülke deneyimleri, politika, kurum ve uygulama örnekleri",
  "Yapay zekâ, ulusal kalkınma ve gelişmekte olan ülkelerde teknolojik egemenlik; veri egemenliği, hesaplama altyapısı ve açık kaynak stratejileri",
  "Yapay zekâ, uluslararası işbölümü ve eşitsiz gelişme; ülkelerin göreli teknolojik konumları, yeni uzmanlaşma biçimleri, hesaplama altyapısı, veri egemenliği, teknolojik bağımlılık ilişkileri ve küresel güç dengeleri",
  "Üretken yapay zekâ çağında akademik etik; yazarlık, intihal, şeffaflık, kaynak gösterme, doğruluk ve hakemlik süreçlerinin dönüşümü",
  "Yapay zekâda etik sınırlar; insan denetimi, açıklanabilirlik, hesap verebilirlik, ayrımcılık, mahremiyet ve kamusal güvenlik",
  "Yapay zekâ yönetişimi; ulusal düzenleme modelleri, uluslararası norm arayışları ve insanlığın ortak çıkarlarını merkeze alan hukuki çerçeveler",
  "Yapay zekâ ve eğitim; yalnızca beceri uyumu değil, yurttaşlık, eleştirel düşünce ve bilim kültürünün yeniden üretimi",
  "Yapay zekânın kültür, dil ve iletişim alanındaki etkileri; dilsel eşitsizlikler, kültürel egemenlik ve çokdillilik",
  "Açık bilim, açık veri ve toplumsal fayda odaklı teknoloji ekosistemleri bağlamında yapay zekâ",
  "Yapay zekânın askerileşmesi ile sivil/kamucu kullanım arasındaki gerilimler ve sınır tartışmaları",
];

const aiTopicsEn = [
  "The effects of artificial intelligence and robotisation on productive forces, including the labour process, productivity, industrial policy, and technological transformation",
  "The effects of AI and robotisation on the workforce, including blue-collar automation, the transformation of white-collar cognitive labour, unemployment risk, reskilling, labour-market polarisation, and the social distribution of productivity gains",
  "The relationship between AI and scientific production, including research processes, the pace of discovery, verification mechanisms, and academic labour",
  "The use of AI for public benefit in health, education, agriculture, transport, disaster management, energy, and local government",
  "The position of big technology companies in AI, including data ownership, control of infrastructure, platform power, and relations of digital dependency",
  "The social consequences of AI applications in individual consumption, advertising, and surveillance",
  "Comparative country experiences, policies, institutions, and applications involving public, planning-oriented, or socially beneficial uses of AI",
  "AI, national development, and technological sovereignty in developing countries, including data sovereignty, computing infrastructure, and open-source strategies",
  "AI, the international division of labour, and uneven development, including countries’ relative technological positions, new forms of specialisation, computing infrastructure, data sovereignty, technological dependency, and global power balances",
  "Academic ethics in the age of generative AI, including authorship, plagiarism, transparency, citation, accuracy, and the transformation of peer review",
  "Ethical limits in AI, including human oversight, explainability, accountability, discrimination, privacy, and public safety",
  "AI governance, including national regulatory models, the search for international norms, and legal frameworks centred on humanity’s common interests",
  "AI and education, encompassing not only skills alignment but also citizenship, critical thinking, and the reproduction of scientific culture",
  "The effects of AI on culture, language, and communication, including linguistic inequality, cultural hegemony, and multilingualism",
  "AI in the context of open science, open data, and technology ecosystems oriented towards social benefit",
  "Tensions and boundary questions between the militarisation of AI and its civilian or public use",
];

export const completeCallCopyTr: Record<string, CallEditorialCopy> = {
  "transatlantik-iliskilerin-yeniden-yapilanmasi": {
    paragraphs: [
      "Günümüz uluslararası sistemi, iç içe geçmiş krizler, değişen güç dengeleri ve yerleşik kurumsal yapıların aşınmasıyla birlikte derin bir dönüşüm sürecinden geçmektedir. Ukrayna savaşı, Donald Trump’ın ABD’de yeniden iktidara gelişi ve İran ile yaşanan doğrudan çatışma süreci, transatlantik ilişkilerin yapısal olarak yeniden şekillenmesini hızlandırmıştır. Bu gelişmeler, Batı ittifakı içerisindeki derin çelişkileri görünür kılmıştır.",
      "ABD ile Avrupa arasındaki farklılaşmalar artık yalnızca politika tercihleriyle sınırlı kalmayıp güvenlik, ekonomik yönetişim ve küresel düzen konularında rekabet eden stratejik perspektifleri yansıtmaktadır. Aynı zamanda çatışma alanlarının çoğalması ve jeopolitik rekabetin yoğunlaşması, NATO’nun sürdürülebilirliği ve gelecekteki yönelimi hakkında temel soruları gündeme getirmektedir.",
      "Bu bağlamda BRIQ, ABD–Avrupa ilişkileri ve NATO’nun dönüşen rolünü küresel sistemdeki yapısal değişimlerle birlikte ele alan makaleleri davet etmektedir. Bu özel sayı, transatlantik ilişkilerdeki yeniden yapılanmayı küresel sistem dönüşümü bağlamında ele alan eleştirel bir tartışma zemini oluşturmayı amaçlamaktadır. Disiplinler arası ve teorik derinliği olan çalışmalar özellikle teşvik edilmektedir.",
    ],
    topics: [
      ["Transatlantik İlişkilerde Dönüşüm", ["Ukrayna savaşı sonrasında ABD–Avrupa ilişkilerinde yapısal yeniden yapılanma", "Washington ile Avrupa aktörleri arasındaki stratejik ayrışmalar", "ABD iç siyasetindeki değişimlerin ittifak ilişkilerine etkisi"]],
      ["Değişen Güvenlik Ortamında NATO", ["Çok cepheli çatışma ortamında NATO’nun dönüşen rolü", "Yük paylaşımı, caydırıcılık ve stratejik özerklik tartışmaları", "Avrupa’da alternatif güvenlik mimarilerinin olasılığı"]],
      ["Trump Faktörü ve Stratejik Yeniden Hizalanma", ["Donald Trump döneminde dış politika yönelimi", "İttifak güvenilirliği ve küresel yönetişim üzerindeki etkiler", "Tek taraflılık ve çok taraflılık arasındaki gerilim"]],
      ["İran Savaşı ve Küresel Etkileri", ["ABD–İran çatışmasının Avrupa açısından stratejik sonuçları", "Enerji güvenliği, ekonomik kırılganlıklar ve jeopolitik riskler", "Bölgesel yayılma dinamikleri ve NATO’nun olası rolü"]],
      ["Çok Kutupluluk ve Batı İttifakının Krizi", ["Alternatif jeopolitik platform ve kurumların yükselişi", "BRICS, ŞİÖ ve Küresel Güney’in rolü", "Küresel yönetişim yapılarının dönüşümü"]],
    ],
    note: "Makaleler özgün olmalı ve başka bir yerde değerlendirme sürecinde bulunmamalıdır. Uzunluk 5.000–9.000 kelimedir. BRIQ, güncel yazım kuralları doğrultusunda APA 7’yi kullanır. Tüm akademik çalışmalar çift kör hakemlik sürecine tabi tutulur. Son metin gönderimi 15 Ağustos 2026’da sona ermiştir.",
  },
  "yapay-zeka-uretici-gucler-ortak-refah": {
    paragraphs: [
      "BRIQ Kuşak ve Yol Girişim Dergisi, “Yapay Zekâ, Üretici Güçler ve İnsanlığın Ortak Refahı” konusunda bir kapak dosyası hazırlığındadır.",
      "İnsanlık, sanayi devrimlerinden dijital dönüşüme uzanan her büyük tarihsel değişimde, üretici güçlerin gelişimi ile toplumsal örgütlenme biçimleri arasındaki ilişkinin yeniden ele alındığı dönemlerden geçmiştir. Yapay zekâ da bugün bu ilişkinin önemli başlıklarından biridir.",
      "Bilginin işlenişini hızlandıran, karar süreçlerini etkileyen, bilimsel araştırmanın kapsamını genişleten ve üretim süreçlerini dönüştüren yapay zekâ; emek, mülkiyet, planlama, egemenlik ve toplumsal refah meseleleriyle birlikte tartışılmaktadır. Bu dönüşümün işgücü üzerindeki etkileri de çok yönlü biçimde incelenmelidir.",
      "Robotlaşmanın mavi yakalı emeği, üretken yapay zekâ ve otomasyonun ise beyaz yakalı bilişsel emeği nasıl etkilediği; işsizleşme, yeniden vasıflanma, işin niteliği, emek piyasasında kutuplaşma, pazarlık gücü ve üretkenlik artışının bölüşümü gibi başlıklarla birlikte değerlendirilebilir.",
      "Yapay zekânın bugünkü gelişim seyri, aynı zamanda çeşitli toplumsal, ekonomik ve hukuki tartışmaları da beraberinde getirmektedir. İnsanlığın ortak bilgi birikimi, kamu destekli araştırmalar, üniversiteler, açık veri ekosistemleri ve toplumsal emek tarafından oluşturulan teknolojik kapasitenin hangi amaçlarla ve hangi kurumsal yapılar içinde kullanıldığı önemli bir sorudur.",
      "Büyük teknoloji şirketlerinin yapay zekâ alanındaki belirleyici konumu; veri mülkiyeti, altyapı denetimi, platform gücü, reklamcılık, tüketim yönlendirme ve dijital gözetim gibi başlıklarda eleştirel incelemeleri gerekli kılmaktadır. Bunun yanında yapay zekânın sağlık, eğitim, ulaştırma, enerji, afet yönetimi, tarımsal planlama, sanayi modernizasyonu ve bilimsel keşif gibi alanlarda kamu yararı açısından nasıl kullanılabileceği de araştırılması gereken temel konular arasındadır.",
      "Öte yandan, başta Çin olmak üzere çeşitli ülkelerde yapay zekânın kamusal hizmetler, sanayi kapasitesi, bilimsel araştırma, üretim planlaması ve toplumsal ihtiyaçlar bağlamında kullanılması, karşılaştırmalı çalışmalar için önemli örnekler sunmaktadır. Yapay zekâ, uluslararası düzeyde eşitsiz gelişme dinamikleri açısından da incelenmesi gereken yeni sorular ortaya çıkarmaktadır.",
      "Veri, çip, hesaplama altyapısı, araştırmacı yetiştirme kapasitesi ve sanayi entegrasyonu gibi alanlardaki farklılıkların ülkelerin göreli konumları, uzmanlaşma biçimleri ve teknolojik bağımlılık ilişkileri üzerindeki etkisi bu dosyanın tartışma başlıkları arasındadır. Bu nedenle yapay zekâ, piyasa uygulamaları yanında kamu yararı, toplumsal gelişme ve ortak refah boyutlarıyla da ele alınabilir.",
      "Yapay zekâ, bilim alanında da önemli bir dönüşüm potansiyeli taşımaktadır. Büyük veri analizi, modelleme, simülasyon, malzeme bilimi, biyoteknoloji, ilaç geliştirme, iklim araştırmaları ve temel bilimlerde yeni araştırma imkânları ortaya çıkarken; akademik üretimde yöntem, doğrulama, yazarlık, emek, özgünlük ve araştırma etiği gibi meseleler de tartışmaya açılmaktadır.",
      "Bu nedenle yapay zekânın hangi toplumsal amaçlarla, kimin denetiminde, hangi etik ve hukuki sınırlar içinde ve hangi gelişme perspektifiyle kullanılacağı önem taşımaktadır.",
      "Bu çerçevede BRIQ; yapay zekânın üretici güçlerin gelişimi, işgücü, toplumsal refah, bilimsel üretim, kamusal planlama, uluslararası eşitsizlikler ve etik yönetişim üzerindeki etkilerini ele alan eleştirel, karşılaştırmalı, kuramsal ve ampirik çalışmaları beklemektedir. Teknoloji alanındaki tekelleşme, kamucu alternatifler, gelişmekte olan ülkelerin deneyimleri, işgücünün robotlaşma ve yapay zekâ karşısındaki dönüşümü, eşitsiz gelişme dinamikleri, bilimsel ilerleme ve toplumsal yarar arasındaki ilişki bu dosyanın öncelikli ilgi alanları arasındadır.",
    ],
    topics: [["Önerilen Konu Başlıkları", aiTopicsTr]],
    note: "Makale gönderimleri Türkçe ve İngilizce kabul edilir. Makaleler özgün olmalı ve başka bir yerde değerlendirme sürecinde bulunmamalıdır. Uzunluk 5.000–9.000 kelimedir. Atıf sistemi APA 7’dir. Tüm akademik çalışmalar çift kör hakemlik sürecine tabi tutulur. Son metin gönderimi 1 Aralık 2026’dır. Başvuru ve iletişim: briq@briqjournal.com.",
  },
  "kitap-incelemesi": {
    paragraphs: [
      "BRIQ (Kuşak & Yol Girişimi Dergisi), önümüzdeki sayılarda yayımlanmak üzere uluslararası politika ve politik ekonomi konularına ilişkin güncel kitap incelemeleri için genel bir çağrı yayımlamıştır. Bu çağrı süresiz olarak açıktır ve dönemsel olarak güncellenir.",
      "Önerisi kabul edilen yazarlar, incelenen kitapta ortaya konan ana konuların ve bakış açılarının özlü bir tanıtımını sunan, en fazla 1.000 kelimelik bir kitap eleştirisi yazmaya davet edilir. İnceleme, eserin güçlü ve zayıf yönleri, bilimselliği ve alana katkıları bakımından kitabın önemine ilişkin eleştirel bir değerlendirme sunmalıdır.",
      "İncelemeler APA 7 formatında yazılmalı ve inceleyen yazarın en fazla 150 kelimelik kısa özgeçmişinin yanı sıra kitabın APA 7’ye uygun künyesini de içermelidir.",
      "Öneriler ve sorular için BRIQ Yayın Kurulu ile briq@briqjournal.com adresinden iletişime geçilebilir.",
    ],
    topics: [["Önerilen Kitaplar", suggestedBooks]],
    note: "BRIQ; akademik makaleler, kitap incelemeleri, araştırma/inceleme yazıları, röportajlar, haber bültenleri ve ana makaleler yayımlar. Gönderiler Türkçe veya İngilizce kabul edilir; daha önce yayımlanmış veya başka bir dergide değerlendirmede olan içerikler kabul edilmez. Kitap incelemeleri 1.000 kelimeyi aşmamalıdır.",
  },
};

export const completeCallCopyEn: Record<string, CallEditorialCopy> = {
  "transatlantic-relations": {
    paragraphs: [
      "The contemporary international system is undergoing a profound transformation amid overlapping crises, shifting balances of power, and the erosion of established institutional structures. The war in Ukraine, Donald Trump’s return to power in the United States, and the direct conflict involving Iran have accelerated the structural reconfiguration of transatlantic relations and made deep contradictions within the Western alliance visible.",
      "Differences between the United States and Europe are no longer confined to policy preferences; they reflect competing strategic perspectives on security, economic governance, and global order. The multiplication of conflict zones and intensifying geopolitical competition also raise fundamental questions about NATO’s sustainability and future direction.",
      "BRIQ therefore invites articles examining US-European relations and NATO’s changing role together with structural transformations in the global system. Interdisciplinary work with theoretical depth is especially encouraged.",
    ],
    topics: [
      ["Transformation in Transatlantic Relations", ["Structural reconfiguration of US-European relations after the war in Ukraine", "Strategic divergences between Washington and European actors", "The effects of changes in US domestic politics on alliance relations"]],
      ["NATO in a Changing Security Environment", ["NATO’s changing role amid conflicts on multiple fronts", "Debates over burden-sharing, deterrence, and strategic autonomy", "The possibility of alternative security architectures in Europe"]],
      ["The Trump Factor and Strategic Realignment", ["Foreign-policy orientation under Donald Trump", "Effects on alliance reliability and global governance", "Tensions between unilateralism and multilateralism"]],
      ["The Iran War and Its Global Effects", ["Strategic consequences of the US-Iran conflict for Europe", "Energy security, economic vulnerabilities, and geopolitical risks", "Regional escalation dynamics and NATO’s possible role"]],
      ["Multipolarity and the Crisis of the Western Alliance", ["The rise of alternative geopolitical platforms and institutions", "The role of BRICS, the SCO, and the Global South", "The transformation of global governance structures"]],
    ],
    note: "Manuscripts must be original and not under consideration elsewhere. The required length is 5,000–9,000 words. BRIQ follows APA 7 under its current submission guidelines. All scholarly articles undergo double-blind peer review. The final submission deadline was 15 August 2026.",
  },
  "artificial-intelligence-productive-forces": {
    paragraphs: [
      "BRIQ: Belt & Road Initiative Quarterly is preparing a special issue on ‘Artificial Intelligence, Productive Forces, and the Common Prosperity of Humanity.’",
      "At every major historical transformation, from the industrial revolutions to the digital turn, humanity has reconsidered the relationship between the development of productive forces and forms of social organisation. Artificial intelligence is now a central dimension of that relationship.",
      "AI accelerates the processing of knowledge, affects decision-making, expands the scope of scientific research, and transforms production. It must therefore be discussed together with labour, ownership, planning, sovereignty, and social welfare. Its multifaceted effects on the workforce require particular attention.",
      "The effects of robotisation on blue-collar labour and of generative AI and automation on white-collar cognitive labour can be examined together with unemployment, reskilling, the quality of work, labour-market polarisation, bargaining power, and the distribution of productivity gains.",
      "The current development of AI also raises social, economic, and legal questions concerning the purposes and institutional settings in which technological capacities created through humanity’s common knowledge, publicly funded research, universities, open-data ecosystems, and social labour are used.",
      "The decisive position of big technology companies calls for critical study of data ownership, infrastructure control, platform power, advertising, consumption steering, and digital surveillance. At the same time, AI’s potential public uses in health, education, transport, energy, disaster management, agricultural planning, industrial modernisation, and scientific discovery require investigation.",
      "Experiences in China and other countries, where AI is applied to public services, industrial capacity, scientific research, production planning, and social needs, provide significant material for comparative analysis. AI also raises new questions about uneven development at the international level.",
      "Differences in data, chips, computing infrastructure, researcher-training capacity, and industrial integration affect countries’ relative positions, forms of specialisation, and relations of technological dependency. AI should therefore be considered not only through market applications but also through public benefit, social development, and common prosperity.",
      "AI also carries substantial transformative potential for science. Big-data analysis, modelling, simulation, materials science, biotechnology, drug development, climate research, and the basic sciences are gaining new possibilities, while method, verification, authorship, labour, originality, and research ethics are being reopened for debate.",
      "The social purposes, forms of control, ethical and legal boundaries, and development perspectives governing AI are therefore crucial.",
      "BRIQ welcomes critical, comparative, theoretical, and empirical studies on AI’s effects on productive forces, labour, social welfare, scientific production, public planning, international inequalities, and ethical governance. Technological monopolisation, public alternatives, developing-country experiences, the transformation of labour, uneven development, and the relationship between scientific progress and social benefit are among the issue’s priority areas.",
    ],
    topics: [["Suggested Topics", aiTopicsEn]],
    note: "Submissions are accepted in Turkish or English. Manuscripts must be original and not under consideration elsewhere. The required length is 5,000–9,000 words. BRIQ follows APA 7. All scholarly articles undergo double-blind peer review. The final submission deadline is 1 December 2026. Contact: briq@briqjournal.com.",
  },
  "book-reviews": {
    paragraphs: [
      "BRIQ: Belt & Road Initiative Quarterly has issued a general, ongoing call for reviews of recent books on international politics and political economy for publication in forthcoming issues. The call is updated periodically.",
      "Authors whose proposals are accepted will be invited to write a review of no more than 1,000 words that concisely introduces the book’s principal themes and perspective. Reviews should also offer a critical assessment of the book’s strengths, weaknesses, scholarly quality, significance, and contribution to the field.",
      "Reviews must follow APA 7 and include the book’s APA 7 bibliographic entry together with a short biography of the reviewer of no more than 150 words.",
      "Contact the BRIQ Editorial Board with proposals or questions at briq@briqjournal.com.",
    ],
    topics: [["Suggested Books", suggestedBooks]],
    note: "BRIQ publishes academic articles, book reviews, review essays, interviews, news reports, and feature articles. Submissions are accepted in Turkish or English and must not have been published or be under consideration elsewhere. Book reviews must not exceed 1,000 words.",
  },
};
