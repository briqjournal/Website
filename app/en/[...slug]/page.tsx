import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  archiveArticles,
  archiveIssues,
  annualReports,
  articlePdfUrl,
  findArchiveArticle,
  findArchiveIssue,
  issueLabel,
  issuePdfUrl,
  publicationType,
} from "../../archive";
import { IndexTicker, SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { PdfViewer } from "../../components/PdfViewer";
import { AuthorLinks } from "../../components/AuthorLinks";
import { PublicationRecord } from "../../components/PublicationRecord";
import { ArchiveExplorer } from "../../components/ArchiveExplorer";
import { ArticleExplorer } from "../../components/ArticleExplorer";
import { ContactForm } from "../../components/ContactForm";
import { SearchExplorer } from "../../components/SearchExplorer";
import { CallsExplorer } from "../../components/CallsExplorer";
import { ScrollSpyNav, type ScrollSpyItem } from "../../components/ScrollSpyNav";
import { EditorialLongform } from "../../components/EditorialLongform";
import { PeopleDirectory } from "../../components/PeopleDirectory";
import { CoverLightbox } from "../../components/CoverLightbox";
import { DergiParkLogo } from "../../components/DergiParkLogo";
import { ArticlePdfPage, ArticlePlatform } from "../../components/ArticlePlatform";
import { findAuthorProfile, bylineAffiliation } from "../../authors";
import { issueAccent, issueSurface } from "../../issue-themes";
import { advisoryBoard, editorialBoard, editors, calls, pastCalls } from "../../site-data";

type PageRecord = {
  kicker: string;
  title: string;
  intro: string;
  sections: [string, string][];
};

type EnglishSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const pages: Record<string, PageRecord> = {
  journal: { kicker: "Journal", title: "About BRIQ", intro: "A concise introduction to BRIQ, its purpose, publishing model, and institutional home.", sections: [["What is BRIQ?", "BRIQ is a quarterly scholarly journal of international politics, economics, and culture, published in Turkish and English."], ["Why BRIQ?", "BRIQ strengthens direct intellectual exchange among Türkiye, China, and the developing world, and studies multipolarity, shared development, and the Belt and Road Initiative."], ["Publisher and independent decisions", "BRIQ is published by the China Research Institute of the China Business Development and Friendship Association. Scientific decisions on individual submissions are made by the journal’s authorised academic bodies."], ["Access and fees", "BRIQ is open access and charges authors no submission, review, or publication fees."]]},
  "journal/about-briq": { kicker: "Journal", title: "About BRIQ", intro: "A concise introduction to BRIQ, its purpose, publishing model, and institutional home.", sections: [["What is BRIQ?", "BRIQ is a quarterly scholarly journal of international politics, economics, and culture, published in Turkish and English."], ["Why BRIQ?", "BRIQ strengthens direct intellectual exchange among Türkiye, China, and the developing world, and studies multipolarity, shared development, and the Belt and Road Initiative."], ["Publisher and independent decisions", "BRIQ is published by the China Research Institute of the China Business Development and Friendship Association. Scientific decisions on individual submissions are made by the journal’s authorised academic bodies."], ["Access and fees", "BRIQ is open access and charges authors no submission, review, or publication fees."]]},
  "journal/publication-principles": { kicker: "Journal", title: "Principles of Publication", intro: "BRIQ’s verified principles of publication.", sections: [["A changing world order", "BRIQ examines the opportunities and challenges emerging with multipolarity and growing cooperation among developing countries."], ["The Belt and Road Initiative", "The journal studies the Belt and Road Initiative as a contemporary platform for connectivity, production, trade, technology, and common development."], ["Direct exchange", "BRIQ brings together scholars, intellectuals, and decision-makers from Türkiye, China, and the wider developing world without relying solely on Western-centred secondary frameworks."], ["Core principles", "Peace, cooperation, social benefit, shared prosperity, and a just international order guide the journal’s publishing mission."]]},
  "for-authors": { kicker: "For Authors", title: "Submit to BRIQ", intro: "Guidelines, checklists, and review stages from submission through publication.", sections: [["Submission channel", "Turkish- and English-language submissions are accepted through DergiPark. Submission and publication are free of charge."], ["Before submitting", "Review the submission guidelines, publication review process, publication ethics, and copyright terms before uploading a manuscript."]]},
  "for-authors/guidelines": { kicker: "For Authors", title: "Submission Guidelines", intro: "Requirements for research articles, book reviews, essays, interviews, newsletters, and feature articles.", sections: [["Languages and originality", "Submissions are accepted in Turkish or English and must not have been published or be under consideration elsewhere."], ["Research articles", "Academic articles are 5,000–9,000 words, include an abstract of up to 200 words and five keywords, and are evaluated through double-blind peer review."], ["Other contribution types", "Book reviews are up to 1,000 words; research/review essays up to 3,000; news analysis up to 1,500; and feature articles combining report and analysis up to 3,500 words."], ["Style", "BRIQ follows APA 7 and uses American English spelling for English-language work."]]},
  "for-authors/review-process": { kicker: "For Authors", title: "Publication Review Process", intro: "The route from initial screening through review, revision, translation, author approval, and publication.", sections: [["Initial review", "Editors assess publication principles, originality, relevance, thematic fit, writing rules, and ethical criteria including plagiarism."], ["Editorial preparation", "Citations and references are matched, similarity findings are addressed, headings and source needs are checked, and the manuscript is prepared for specialist review."], ["Peer review and revision", "Suitable academic manuscripts are sent to expert reviewers. Reports are shared with the author; substantial revisions may be returned to the reviewer."], ["Translation and publication", "The revised manuscript is translated, checked by an assigned editor, sent to the author for limited final changes and acceptance of copyright terms, and then prepared for publication."]]},
  "for-authors/copyright-and-licence": { kicker: "For Authors", title: "Copyright Terms and Licence", intro: "Author undertakings, supplementary material, editing, publication ethics, termination, and licensing.", sections: [["Author undertakings", "Authors confirm that they have authority to submit the work, that it is original, accurate, lawful, and does not infringe third-party rights."], ["Supplementary material", "Datasets, audiovisual interviews, podcasts, appendices, additional text, charts, illustrations, photographs, graphics, and film may be supplied as supplementary material."], ["Editing and corrections", "The editor and publisher may edit for clarity, accuracy, language, style, and presentation; the corresponding author reviews proofs and responds within the stated period."], ["Licence", "Published content is made available under the Creative Commons Attribution 4.0 International licence (CC BY 4.0)."]]},
  "for-authors/publication-ethics": { kicker: "For Authors", title: "Publication Ethics", intro: "Ethical duties of editors, authors, and reviewers.", sections: [["Journal ethics", "BRIQ follows national and international academic principles and standards associated with COPE, DOAJ, and OASPA."], ["Editors", "Editors and assistant editors act objectively and impartially, protect confidentiality, and cooperate through a fair division of responsibilities."], ["Authors", "Authors must comply with applicable copyright law, national research and publication ethics rules, COPE standards, and BRIQ’s adopted requirements."], ["Reviewers", "Reviewers assess manuscripts carefully, fairly, and within their expertise; report ethical concerns promptly; and use constructive, respectful language."]]},
  "calls-for-papers/book-reviews": { kicker: "Calls for Papers", title: "Call for Book Reviews", intro: "A continuously open call for critical reviews of recent scholarly books.", sections: [["Purpose", "Accepted proposals lead to a concise introduction to a book’s main questions and viewpoint together with a critical assessment of its strengths, weaknesses, scholarly quality, and contribution."], ["Format", "Reviews are no longer than 1,000 words and include the book’s APA citation and a short author biography of up to 150 words."], ["Contact", "Send proposals and questions to the BRIQ Publication Board at briq@briqjournal.com."]]},
};

const englishPageMetadata: Record<string, [string, string, string]> = {
  journal: ["About BRIQ", "BRIQ’s publication profile, purpose, and institutional structure.", "/dergi"],
  "journal/about-briq": ["About BRIQ", "BRIQ’s publication profile, purpose, and institutional structure.", "/dergi/briq-hakkinda"],
  "journal/publication-principles": ["Principles of Publication", "BRIQ’s publication principles and developing-world perspective.", "/dergi/yayin-ilkeleri"],
  "journal/publication-board": ["Publication Board", "Members of the BRIQ Publication Board.", "/dergi/yayin-kurulu"],
  "journal/advisory-board": ["Advisory Board", "Members of the BRIQ Advisory Board.", "/dergi/danisma-kurulu"],
  "journal/indexes": ["Indexes and Repositories", "BRIQ’s verified index and open-repository records.", "/dergi/endeksler"],
  contact: ["Contact", "BRIQ contact information and message form.", "/iletisim"],
  search: ["Search BRIQ", "Search BRIQ articles, issues, authors, and calls for papers.", "/arama"],
  "for-authors": ["For Authors", "BRIQ submission guidelines and publication review process.", "/yazarlar"],
  "for-authors/guidelines": ["Submission Guidelines", "Submission requirements for BRIQ research articles and other contributions.", "/yazarlar/yazim-kurallari"],
  "for-authors/review-process": ["Publication Review Process", "BRIQ’s editorial and peer-review workflow from submission to publication.", "/yazarlar/yayin-degerlendirme-sureci"],
  "for-authors/copyright-and-licence": ["Copyright Terms and Licence", "BRIQ copyright transfer and CC BY 4.0 licence terms.", "/yazarlar/telif-hakki-sartlari-ve-lisans"],
  "for-authors/publication-ethics": ["Publication Ethics", "The ethical responsibilities of BRIQ authors, reviewers, and editors.", "/yazarlar/yayin-etigi"],
  "current-issue": ["Current Issue — Volume 7, Issue 4", "A New Era in West Asia: contents and full-issue PDF.", "/guncel-sayi"],
  archive: ["All Issues", "BRIQ’s verified bilingual archive of 27 issues.", "/arsiv"],
  articles: ["Article Search", "Advanced search and filtering across BRIQ’s publication archive.", "/makaleler"],
  "calls-for-papers": ["Calls for Papers", "Active and past BRIQ calls for papers with deadlines and publication outcomes.", "/makale-cagrilari"],
  "annual-reports": ["Annual Reports", "Verified records of BRIQ’s publishing activity and institutional development.", "/yillik-raporlar"],
};

function EnglishHero({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <section className="page-hero">
      <div className="page-hero-rule" />
      <div className="site-shell page-hero-inner">
        <div className="page-breadcrumb"><a href="/en">Home</a><span>/</span><span>{kicker}</span></div>
        <p className="section-kicker light">{kicker}</p>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}

function EnglishStandardPage({ page }: { page: PageRecord }) {
  return (
    <>
      <EnglishHero kicker={page.kicker} title={page.title} intro={page.intro} />
      <div className="site-shell reading-layout">
        <aside className="reading-nav">
          <b>On this page</b>
          {page.sections.map(([title]) => (
            <a href={`#${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={title}>{title}</a>
          ))}
        </aside>
        <div className="reading-content">
          {page.sections.map(([title, text]) => (
            <section id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function EnglishLinkCards({ items }: { items: { number: string; title: string; text: string; href: string }[] }) {
  return (
    <div className="link-card-grid">
      {items.map((item) => (
        <a href={item.href} className="link-card" key={item.href}>
          <span>{item.number}</span><h2>{item.title}</h2><p>{item.text}</p><b aria-hidden="true">→︎</b>
        </a>
      ))}
    </div>
  );
}

function EnglishProseSections({ sections }: { sections: EnglishSection[] }) {
  return (
    <div className="prose-sections">
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </section>
      ))}
    </div>
  );
}

function EnglishAboutBriq() {
  return (
    <>
      <EnglishHero kicker="Journal" title="About BRIQ" intro="Since 2019, an independent, bilingual, open-access scholarly space for direct exchange among Türkiye, China, and the developing world." />
      <EditorialLongform
        navigationTitle="On this page"
        className="about-briq editorial-about"
        before={
          <>
            <section className="about-era-card" aria-label="BRIQ publication history">
              <div><span>2019</span><small>Beginning of publication</small></div>
              <p>BRIQ began publication in 2019 to create an alternative scholarly space where researchers from the developing world can discuss their own experiences, concepts, and paths towards solutions directly.</p>
            </section>
            <div className="fact-strip">
              <div><span>Frequency</span><b>Quarterly</b></div>
              <div><span>Languages</span><b>Turkish · English</b></div>
              <div><span>Access</span><b>Open access</b></div>
              <div><span>Review</span><b>Double-blind peer review</b></div>
            </div>
          </>
        }
        sections={[
          {
            id: "what-is-briq",
            title: "What is BRIQ?",
            subsections: [
              { id: "scholarly-journal", title: "A scholarly, bilingual journal", content: <p>BRIQ (Belt &amp; Road Initiative Quarterly) is a scholarly journal of international politics, economy, and culture. The languages of publication are Turkish and English.</p> },
              { id: "alternative-scholarly-space", title: "An alternative scholarly space", content: <p>Published since 2019, BRIQ seeks to reduce reliance on Western-centred secondary frameworks and to develop a scholarly forum where Türkiye, China, and the developing world can share their own research agendas and intellectual traditions directly.</p> },
              { id: "direct-exchange", title: "Direct exchange of knowledge", content: <p>BRIQ assumes the task of providing direct exchange of views and information among Chinese and Turkish academics, intellectuals, and policy makers. In the meantime, this journal will serve as a platform to bring together the intellectual accumulation of the whole world, especially developing countries, on the basis of the Belt and Road Initiative, which presents a historic opportunity for the common future of humanity.</p> },
            ],
          },
          {
            id: "why-published",
            title: "Why is it published?",
            subsections: [
              { id: "knowledge-gap-about", title: "Bridging the knowledge gap", content: <p>Turkey has a significant role – real and potential – in accelerating South-South cooperation. Turkey is conveniently located as Asia’s farthest outpost to the West. It assumes a critical position as a pivotal country on BRI’s North-South and East-West axes. However, China’s development and BRI’s contribution to the future of humanity have remained to a large extent underrecognized and superficially evaluated in Turkish academia, media, and politics. This is mainly because Turkey’s academics, media professionals, and policy makers have been observing China using Western sources. In the same manner, China and BRI’s other potential partners have been viewing Turkey through a Western lens.</p> },
              { id: "asian-century-about", title: "Understanding the Asian Century", content: <p>Belt and Road Initiative Quarterly (BRIQ) has committed itself to developing an in-depth and accurate understanding of the present era, with a particular emphasis on the new opportunities and obstacles on the road to the New Asian Century.</p> },
            ],
          },
          {
            id: "publishing-approach",
            title: "Publishing approach",
            subsections: [
              { id: "public-driven-about", title: "Public-driven economies", content: <p>BRIQ is also devoted to publishing research and other intellectual contributions that underline the transformative power of public-driven economies, where popular interests are upheld as the basic principle, ahead of individual profit. The fundamental tasks of BRIQ are to demonstrate how BRI contributes to the implementation of this public-driven model, and to help potential BRI partners – including Turkey – to realize their real potential.</p> },
              { id: "fair-world-order", title: "A fair world order", content: <p>BRIQ stands for the unity of humanity and a fair world order. It will therefore be a publication for the world’s distinguished intellectuals, especially those from Eurasia, Africa, and the Americas: the defenders of a new civilization rising from Asia on the basis of peace, fraternity, cooperation, prosperity, and common development.</p> },
            ],
          },
          {
            id: "institutional-structure",
            title: "Institutional structure",
            subsections: [
              { id: "publisher", title: "Publisher", content: <p>BRIQ is published by the China Research Institute of the China Business Development and Friendship Association. The owner is Emine Sağlam on behalf of the Turkish-Chinese Business Development and Friendship Association.</p> },
              { id: "independent-decisions", title: "Independent publication decisions", content: <><p>The publisher ensures the journal’s institutional and administrative continuity; scientific bodies decide whether individual submissions are reviewed, accepted, revised, or rejected.</p><p>The journal charges no submission, review, or publication fee. Sponsors, donors, and external stakeholders cannot intervene in reviewer selection or publication decisions.</p></> },
            ],
          },
        ]}
      />
    </>
  );
}

function EnglishPublicationPrinciples() {
  const navigation: ScrollSpyItem[] = [
    { id: "changing-world", label: "A Changing World and the Belt and Road", level: 2 },
    { id: "multipolarisation", label: "Multipolarisation and Joint Development", level: 3, parentId: "changing-world" },
    { id: "belt-and-road", label: "The Belt and Road Initiative", level: 3, parentId: "changing-world" },
    { id: "turkeys-position", label: "Turkey’s Strategic Position", level: 2 },
    { id: "knowledge-gap", label: "The Knowledge Gap between Turkey and China", level: 3, parentId: "turkeys-position" },
    { id: "briq-mission", label: "BRIQ’s Publishing Mission", level: 2 },
    { id: "asian-century", label: "The Asian Century and Direct Exchange", level: 3, parentId: "briq-mission" },
    { id: "public-driven-economies", label: "Public-Driven Economies and a Fair World Order", level: 3, parentId: "briq-mission" },
  ];
  return (
    <>
      <EnglishHero kicker="Journal" title="Principles of Publication" />
      <div className="site-shell reading-layout publication-principles-layout">
        <ScrollSpyNav title="On this page" items={navigation} />
        <div className="reading-content publication-principles">
          <section className="principle-section" id="changing-world">
            <h2>A Changing World and the Belt and Road</h2>
            <div className="principle-subsection" id="multipolarisation">
              <h3>Multipolarisation and Joint Development</h3>
              <p>At a time when US ambitions for a unipolar world order have lost their appeal, a new order is taking shape through the multi-polarization of world politics and the acceleration of cooperation between developing countries, rejecting the globalism of imperialist states. Under these conditions, the new agenda of global cooperation should respond to the needs and aspirations of developing countries seeking joint development and solidarity under the guidance of public-driven projects. In particular, the Belt and Road Initiative (BRI) – put forward in 2013 by Xi Jinping, President of the People’s Republic of China – provides a suitable opportunity and a sound foundation for the implementation of this new agenda of global cooperation.</p>
            </div>
            <div className="principle-subsection" id="belt-and-road">
              <h3>The Belt and Road Initiative</h3>
              <p>BRI is an epoch-making move to re-implement the concept of the Silk Road, which dates back 2,000 years, to a time when China was immensely contributing to global prosperity and the development of trade and cooperation. The revival of this concept entails a much more comprehensive approach that also incorporates rail and sea transport, and digital systems.</p>
              <p>BRI proposes to bring together over 60 countries across Asia, Europe, Africa, and Latin America – together accounting for half of the world’s production – for prosperity and development at the initiative of China. Unlike the Western-centered world order, BRI seeks peaceful collaboration for improving global trade and production towards common goals for humanity. It firmly rejects crude imperialist exploitation. Two thousand years ago, the Silk Road was a conduit for the flow of gunpowder, spices, silk, compasses and paper to the world. Today, it offers artificial intelligence, quantum computers, new energy and material technologies, and space-age visions to developing countries. In addition,the New Silk Road provides incentives and opportunities for the development and implementation of bio-economic schemes in stakeholder countries against the threat of climate change and other environmental threats that bring the entire ecosystem to the brink of extinction.</p>
            </div>
          </section>
          <section className="principle-section" id="turkeys-position">
            <h2>Turkey’s Strategic Position</h2>
            <div className="principle-subsection" id="knowledge-gap">
              <h3>The Knowledge Gap between Turkey and China</h3>
              <p>Turkey has a significant role – real and potential – in accelerating South-South cooperation. Turkey is conveniently located as Asia’s farthest outpost to the West. It assumes a critical position as a pivotal country on BRI’s North-South and East-West axes. However, China’s development and BRI’s contribution to the future of humanity have remained to a large extent underrecognized and superficially evaluated in Turkish academia, media, and politics. This is mainly because Turkey’s academics, media professionals, and policy makers have been observing China using Western sources. In the same manner, China and BRI’s other potential partners have been viewing Turkey through a Western lens.</p>
            </div>
          </section>
          <section className="principle-section" id="briq-mission">
            <h2>BRIQ’s Publishing Mission</h2>
            <div className="principle-subsection" id="asian-century">
              <h3>The Asian Century and Direct Exchange</h3>
              <p>Belt and Road Initiative Quarterly (BRIQ) has committed itself to developing an in-depth and accurate understanding of the present era, with a particular emphasis on the new opportunities and obstacles on the road to the New Asian Century.</p>
              <p>BRIQ assumes the task of providing direct exchange of views and information among Chinese and Turkish academics, intellectuals, and policy makers. In the meantime, this journal will serve as a platform to bring together the intellectual accumulation of the whole world, especially developing countries, on the basis of the Belt and Road Initiative, which presents a historic opportunity for the common future of humanity.</p>
            </div>
            <div className="principle-subsection" id="public-driven-economies">
              <h3>Public-Driven Economies and a Fair World Order</h3>
              <p>BRIQ is also devoted to publishing research and other intellectual contributions that underline the transformative power of public-driven economies, where popular interests are upheld as the basic principle, ahead of individual profit. The fundamental tasks of BRIQ are to demonstrate how BRI contributes to the implementation of this public-driven model, and to help potential BRI partners – including Turkey – to realize their real potential.</p>
              <p>BRIQ stands for the unity of humanity and a fair world order. It will therefore be a publication for the world’s distinguished intellectuals, especially those from Eurasia, Africa, and the Americas: the defenders of a new civilization rising from Asia on the basis of peace, fraternity, cooperation, prosperity, and common development.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function EnglishAuthorsHub() {
  return (
    <>
      <EnglishHero kicker="For Authors" title="For Authors" intro="Submission conditions, review process, publication ethics, and copyright terms in one roadmap." />
      <div className="site-shell page-section authors-hub-page">
        <div className="fact-strip">
          <div><span>Languages</span><b>Turkish · English</b></div>
          <div><span>Submission fee</span><b>Free of charge</b></div>
          <div><span>Academic article</span><b>5,000–9,000 words</b></div>
          <div><span>Evaluation</span><b>Double-blind review</b></div>
        </div>
        <div className="submission-lead">
          <div><span>Submission channel</span><h2 className="dergipark-heading"><DergiParkLogo /></h2><p>Submissions are accepted in Turkish and English. Submission and publication are free of charge.</p></div>
          <a className="button button-dark" href="https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new">Start a submission ↗︎</a>
        </div>
        <EnglishLinkCards items={[
          { number: "01", title: "Submission Guidelines", text: "Contribution types, lengths, anonymisation, abstracts, and APA 7 requirements.", href: "/en/for-authors/guidelines" },
          { number: "02", title: "Publication Review Process", text: "Initial screening, peer review, revision, translation, and final approval.", href: "/en/for-authors/review-process" },
          { number: "03", title: "Publication Ethics", text: "The ethical duties and responsibilities of authors, reviewers, and editors.", href: "/en/for-authors/publication-ethics" },
          { number: "04", title: "Copyright Terms and Licence", text: "Author undertakings, copyright transfer, supplementary materials, and CC BY 4.0.", href: "/en/for-authors/copyright-and-licence" },
        ]} />
        <section className="authors-process-module">
          <p className="section-kicker">Process overview</p>
          <h2>From submission to publication</h2>
          <div className="process-overview">
            {[["01", "Review the guidelines"], ["02", "Submit the file"], ["03", "Peer review"], ["04", "Revision"], ["05", "Final approval"]].map(([number, label]) => <div key={number}><span>{number}</span><b>{label}</b></div>)}
          </div>
        </section>
      </div>
    </>
  );
}

function EnglishWritingRules() {
  return (
    <>
      <EnglishHero kicker="For Authors" title="Submission Guidelines" intro="The scope, format, length, and evaluation conditions for work submitted to BRIQ." />
      <EditorialLongform
        navigationTitle="On this page"
        className="for-authors-longform"
        before={
          <div className="format-table">
            <div className="format-row format-head"><b>Contribution type</b><b>Length</b><b>Evaluation</b></div>
            <div className="format-row"><span>Academic article</span><span>5,000–9,000 words</span><span>Double-blind peer review</span></div>
            <div className="format-row"><span>Book review</span><span>Up to 1,000 words</span><span>Editorial review</span></div>
            <div className="format-row"><span>Research / review essay</span><span>Up to 3,000 words</span><span>Editorial review</span></div>
            <div className="format-row"><span>News report</span><span>Up to 1,500 words</span><span>Editorial review</span></div>
            <div className="format-row"><span>Feature article</span><span>Up to 3,500 words</span><span>Editorial review</span></div>
          </div>
        }
        sections={[
          {
            id: "journal-and-scope",
            title: "Journal and publication scope",
            subsections: [
              { id: "briq-and-content", title: "BRIQ and contribution types", content: <><p>BRIQ (Belt &amp; Road Initiative Quarterly) is an open access scholarly journal of international politics, economy, and culture.</p><p>Belt and Road Initiative Quarterly (BRIQ) features a broad range of content, from academic articles to book reviews, review essays, interviews, news reports, and feature articles.</p><p>The Editorial Board can issue calls for papers for special issues and invite authors to contribute manuscripts; however, it also welcomes unsolicited submissions.</p></> },
              { id: "fee-policy", title: "Fee policy", content: <p>There are no fees to submit or publish in this journal.</p> },
            ],
          },
          {
            id: "submission-conditions",
            title: "Submission conditions",
            subsections: [
              { id: "language-file-originality", title: "Language, file, and originality", content: <><p>Submissions are invited in English or Turkish. All submissions are to include a short biography (150-word limit) and should be sent as Microsoft Word attachments to <a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a>. Articles or other content that have been previously published or are under review by other journals will not be considered for publication.</p><p>BRIQ follows American Psychological Association style (7th edition, <a href="https://apastyle.apa.org/">www.apastyle.org</a>) and uses American English spelling.</p></> },
              { id: "academic-articles", title: "Academic articles", content: <><p>BRIQ uses a double-blind review process for all academic articles.</p><p>Academic articles should be between 5,000 and 9,000 words in length, including abstracts, notes, references, and all other content. Please supply a cover page that includes complete author information, and a fully anonymized manuscript that also contains an abstract (200- word limit) and 5 keywords.</p></> },
              { id: "other-contributions", title: "Other contribution types", content: <><p>Book reviews should not exceed 1,000 words; review essays covering two or more works can be up to 3,000 words.</p><p>News reports consisting of brief analyses of news developments should not exceed 1,500 words; feature articles combining reporting and analysis can be up to 3,500 words.</p><p>BRIQ is an open access journal that allows readers to easily read and download the contents of published articles from the website. These contents are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0) which means that the readers can copy, download, redistribute, and share the contents only if appropriate credit is given.</p><p>Please contact the Editorial Board for interview proposals.</p><a className="editorial-next-link" href="/en/for-authors/review-process">Evaluation Process for Peer-Reviewed Submissions →︎</a></> },
            ],
          },
        ]}
      />
    </>
  );
}

function EnglishReviewFlow() {
  return (
    <>
      <EnglishHero kicker="For Authors" title="Publication Review Process" intro="The ten-step process followed by peer-reviewed submissions from initial screening to publication." />
      <EditorialLongform
        navigationTitle="On this page"
        className="for-authors-longform review-process-page"
        before={
          <div className="process-overview" aria-label="Review process summary">
            {[["01", "Initial screening"], ["02", "Editorial compliance"], ["03", "Expert review"], ["04", "Revision"], ["05", "Publication preparation"]].map(([number, label]) => <div key={number}><span>{number}</span><b>{label}</b></div>)}
          </div>
        }
        sections={[
          {
            id: "initial-screening",
            title: "Initial screening",
            subsections: [
              { id: "submission-and-scope", title: "Submission and scope", content: <><p>BRIQ accepts submissions in English or Turkish. All articles are published in bilingual format.</p><p>Peer-review process for the submissions involves ten steps:</p><p>a) Submissions sent to the journal are screened by the Editor-in-Chief, the Editorial Board Coordinator and the Managing Editor in terms of compliance with the BRIQ Principles of Publication and research ethics including plagiarism.</p><p>b) The Managing Editor consults the Editorial and/or Advisory Board Members who are experts in their field, whether the evaluation process needs special proficiency.</p><p>c) If the submission is for a special issue, the issue editor is also consulted regarding the submission’s compliance with the BRIQ Principles of Publication, research ethics, and the issue topic.</p><p>d) The corresponding author is expected to adjust its submission according to the BRIQ Submission Guidelines. In case of noncompliance with the BRIQ Submission Guidelines, the BRIQ Editorial Team contact the corresponding author to request the necessary editorial corrections.</p></> },
              { id: "editorial-corrections", title: "Editorial corrections", content: <><p>Editorial corrections include following phases:</p><ol><li>Compliance of the submission with the BRIQ Submission Guidelines,</li><li>Synchronization between citations and references,</li><li>Providing feedback for the corresponding in case of plagiarism,</li><li>Adjusting the title and subtitles if needed,</li><li>Checking for references.</li></ol></> },
            ],
          },
          {
            id: "peer-review-and-revision",
            title: "Peer review and revision",
            subsections: [
              { id: "expert-assessment", title: "Expert assessment", content: <><p>e) If the relevant BRIQ editors find the submission eligible for external and blind peer review based on the above criteria, the Editorial Team will contact potential peer-reviewers who have expertise in the relevant areas.</p><p>f) Upon receipt of peer-review reports, these reports are sent to the corresponding author and the corresponding author is expected to apply the changes suggested by reviewers.</p><p>g) If the peer-review reports require substantial changes to the paper, the revised submissions are sent back to the peer-reviewers for approval after receipt of the revised submission. If the peer-review reports require only stylistic changes, the revised submissions are sent to the Managing Editor in order to confirm compliance with peer-reviewers’ suggestions.</p></> },
            ],
          },
          {
            id: "publication-preparation",
            title: "Publication preparation",
            subsections: [
              { id: "translation-and-final-approval", title: "Translation and final approval", content: <><p>h) Revised submissions are sent to translation, if necessary. After translations, submissions are checked by a BRIQ editor, appointed by the Managing Editor. The editor inserts photographs, prepares the final proofs and sends them to Editorial Team.</p><p>i) Bilingual proofs and Copyright Terms are sent to the corresponding author for final approval. In that stage, the corresponding author can only make minor changes, which are later to be approved by the Editorial Team and should agree the Copyright Terms.</p><p>j) The approved version of the final proofs by the corresponding author are controlled by the Editorial Team and then sent to publication.</p><a className="editorial-next-link" href="/en/for-authors/publication-ethics">Publication Ethics →︎</a></> },
            ],
          },
        ]}
      />
    </>
  );
}

function EnglishCopyrightTerms() {
  return (
    <>
      <EnglishHero kicker="For Authors" title="Copyright & Lisence Terms" intro="The copyright-transfer agreement, contributor responsibilities, and Creative Commons licence." />
      <EditorialLongform
        navigationTitle="On this page"
        className="for-authors-longform copyright-page"
        before={<div className="license-lead"><img src="/assets/cc-by.png" alt="Creative Commons BY 4.0" /><div><span>Licence</span><h2>Creative Commons Attribution 4.0 International</h2><p>CC BY 4.0</p></div></div>}
        sections={[
          {
            id: "transfer-of-rights",
            title: "Transfer of rights",
            subsections: [
              { id: "scope-of-agreement", title: "Scope of the agreement", content: <><p>The Corresponding Contributor and all co-authors of the Contribution are collectively referred to as “Contributors” and individually as a “Contributor.” Contributors transfer and assign to the owner of the Journal (hereinafter, the “Proprietor”), Proprietor for the full term of copyright and any extensions and renewals thereof, all right, title, and interest in copyright, and all of the rights comprised therein and all remedies afforded by law, throughout the world, exclusive of any copyrightable material (text or graphic) owned by others, and any revisions thereof prepared and submitted by Contributors, including without limitation the right to register copyright in the Article in the name of the Proprietor, and the exclusive right to reproduce, publish, republish, prepare all foreign language translations and other derivative works, distribute, sell, license, transfer, transmit, and publicly display copies of, and otherwise use the Article, in whole or in part, alone or in compilations, in all formats and media and by any method, device, or process, and through any channels, now known or later conceived or developed; and the exclusive right to license or otherwise authorize others to do all of the foregoing, and the right to assign and transfer the rights granted hereunder. To the extent that any right now or in the future existing under copyright is not specifically granted to the Proprietor by the terms of this Agreement, such right shall be deemed to have been granted hereunder.</p><p>With respect to the abstract of the Article (“Abstract”) and any Supplemental Materials, as defined in Section 2 of the Terms of the Agreement, provided by Contributors, Contributors hereby grant to Proprietor on a non-exclusive basis, all rights and licenses set forth above with respect to the Article. The Article, Abstract, and Supplemental Materials are collectively referenced herein as the “Contribution”.</p></> },
            ],
          },
          {
            id: "terms-of-agreement",
            title: "Terms of the agreement",
            subsections: [
              { id: "warranties-indemnification", title: "1. Warranties; Indemnification", content: <p>Contributors, jointly and severally, warrant and represent that (a) all Contributors have the full power and authority to enter into and execute this Agreement and to assign the rights granted herein, and that such rights are not now subject to prior assignment, transfer, or other encumbrance; (b) the Contribution is the original work of Contributors (except for copyrighted material owned by others for which written permission has been obtained), has not been previously published in any form (except for any previous public distribution of the Contribution, which has been disclosed in writing to the Editor), and has been submitted only to the Journal; (c) the Contribution does not infringe the copyright or violate any proprietary rights, rights of privacy or publicity, or any other rights of any third party, and do not contain any material that is libelous or otherwise contrary to law; (d) all statements and presentation of data in the Contribution asserted as factual are either true or based on generally accepted professional research practices, and no formula or procedure contained therein would cause injury if used in accordance with the instructions and/or warnings included in the Contribution. In the event that any of the foregoing warranties or representations are breached, Contributors, jointly and severally, shall indemnify and hold harmless Proprietor, the Journal’s Editor, and Proprietor’s affiliates, assigns, and licensees (expressly including BRIQ, if BRIQ is not the Proprietor), against any losses, liabilities, damages, costs and expenses (including legal costs and expenses) arising from or resulting out of any claim or demand of any kind relating to such breach.</p> },
              { id: "supplemental-materials", title: "2. Supplemental Materials", content: <p>Supplemental Materials, as used in this Agreement, means all materials related to the Article, but not considered part of the typeset Article as published in the Journal, provided by Contributors to Proprietor. Supplemental Materials may include, but are not limited to, data sets, audio-visual interviews and footage including podcasts (audio only) and vodcasts (audio and visual), appendices, and additional text, charts, figures, illustrations, photographs, computer graphics, and film footage. Contributors’ grant of a non- exclusive right and license to Proprietor for these materials in no way restricts re-publication of the Supplemental Materials by Contributors or anyone authorized by Contributors.</p> },
              { id: "copyediting-proofreading", title: "3. Copyediting; Proofreading; Color Images", content: <p>The Editor and/or Proprietor (and/or BRIQ, if different from Proprietor) may copyedit the Contribution and Supplemental Materials, if any, for clarity, brevity, accuracy, grammar, word usage, and style conformity and presentation as the Editor and/or Proprietor deems advisable for production and publication in the Journal. Corresponding Contributor shall proofread proofs of the Contribution and indicate any proposed corrections or other changes and their timely return to Proprietor as directed, with time being of the essence.</p> },
              { id: "publishing-ethics-legal", title: "4. Publishing Ethics & Legal Adherence", content: <p>Contributions found to be infringing this Agreement may be subject to withdrawal from publication (see Termination below) and/or be subject to corrective action. The Proprietor (and/or BRIQ if BRIQ is different than the Proprietor) reserves the right to take action including, but not limited to: publishing an erratum or corrigendum (correction); retracting the Contribution; taking up the matter with the head of department or dean of the author&apos;s institution and/or relevant academic bodies or societies; or taking appropriate legal action.</p> },
              { id: "termination", title: "5. Termination", content: <p>This Agreement must be signed by or on behalf of all the copyright holders in the Contribution as a condition of publication. Proprietor makes no guarantee that the Contribution will be published in the Journal. If for any reason the Contribution is not published in the Journal, then all rights in the Contribution granted to Proprietor shall revert to Contributors and this Agreement shall be of no further force and effect, and neither Proprietor (nor BRIQ if different from Proprietor) nor Contributors will have any obligation to the other with respect to the Contribution.</p> },
              { id: "general-provisions", title: "6. General Provisions", content: <><p>In the event a dispute arises out of or relating to this Agreement, the parties agree to first make a good-faith effort to resolve such dispute themselves. Upon failing, the parties shall engage in non-binding mediation with a mediator to be mutually agreed on by the parties. Any controversy or claim arising out of or relating to this Agreement, or the breach thereof, which the parties cannot settle themselves or through mediation, shall be settled by arbitration. In any legal action or other proceedings (including arbitration proceedings) between the parties, the prevailing party shall be entitled to recover from the non-prevailing party all reasonable costs and expenses incurred in such action or proceeding, including without limitation, reasonable attorneys’ fees and costs.</p><p>No amendment or modification of any provision of this Agreement shall be valid or binding unless made in writing and signed by all parties. This Agreement constitutes the entire agreement between the parties with respect to its subject matter, and supersedes all prior and contemporaneous agreements, understandings, and representations. The invalidity or unenforceability of any particular provision of this Agreement shall not affect the other provisions, and this Agreement shall be construed in all respects as if any invalid or unenforceable provision were omitted. This Agreement may be executed in counterparts, each of which shall be deemed the original, all of which together shall constitute one and the same instrument. A faxed copy or other electronic copy of this Agreement shall be deemed an original. The parties authorize that their electronic signatures act as their legal signatures of this Agreement.</p></> },
              { id: "conflicts-of-interest", title: "7. Declaration of Conflicts of Interest", content: <p>Contributors certify that all potential conflicts of interest have been acknowledged in the Contribution and covering letter accompanying the Contribution, including but not limited to, all forms of financial and commercial support, including any commercial or financial involvements that might present an appearance of a conflict of interest related to the Contribution and any other potential conflicts identified in the Journal’s manuscript submission guidelines.</p> },
              { id: "third-party-materials", title: "8. Contributor’s Responsibilities with Respect to Third Party Materials", content: <p>Contributors are responsible for: (i) including full attribution for any materials not original to the Contribution, (ii) securing and submitting with the Contribution written permissions for any third party materials allowing publication in all media and all languages throughout the world in perpetuity, (iii) making any payments due for such permissions.</p> },
            ],
          },
          {
            id: "contributor-approval-and-licence",
            title: "Contributor approval and licence",
            subsections: [
              { id: "implementation-and-signatures", title: "Implementation and signatures", content: <><p>• BRIQ will provide the Corresponding Contributor of the Contribution with an electronic copy of the Contribution.</p><p>If more than one copyright ownership applies to the Contribution, each Contributor should sign a hard copy of this agreement.</p><p>Please contact <a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a> with any questions or to receive a hard copy of this Agreement.</p><p>The copyright to the Work is owned by the Contributors. Contributor represents and warrants that the copyright to the Contribution is owned by the Contributor(s).</p><p>By signing this Agreement on behalf of all Contributors, the signing Contributor represents and warrants that he/she has received written permission from each Contributor to sign this Agreement on his or her behalf and to transfer the rights as set forth herein. Contributors understand that he/she each has the option of having each Contributor sign a separate copy of this Agreement by contacting the Editorial Office for a version of this Agreement to be signed by each Contributor and returned directly to the Editorial Office.</p></> },
              { id: "cc-by-licence", title: "Creative Commons Attribution 4.0", content: <p>The Journal uses Creative Commons Attribution 4.0 International License ( CC BY 4.0 ), which means that texts may be copied, downloaded, redistributed, and shared only if appropriate credit is given.</p> },
            ],
          },
        ]}
      />
    </>
  );
}

function EnglishEthicsPolicy() {
  return (
    <>
      <EnglishHero kicker="For Authors" title="Ethical Principles" intro="BRIQ’s publication ethics and the responsibilities of editors, authors, and reviewers." />
      <EditorialLongform
        navigationTitle="On this page"
        className="for-authors-longform ethics-page"
        sections={[
          {
            id: "ethical-principles",
            title: "Ethical Principles",
            subsections: [
              { id: "publication-ethics", title: "Publication Ethics", content: <><p>Belt &amp; Road Initiative Quarterly follows a publication policy that adheres to national and international academic principles and ethical values. The Journal adheres to the internationally valid COPE (Committee on Publication Ethics), Directory of Open Access Journals (DOAJ) and Open Access Scholarly Publishers Association (OASPA) publication standards and principles.</p><p>Before, during or at the end of the publication evaluation process carried out by the Belt &amp; Road Initiative Quarterly, publication requests those are objectively determined to be contrary to the principles and standards related to the ethical principles listed above, as well as the Publication Principles of the Belt &amp; Road Initiative Quarterly, are rejected. If such work is detected, the relevant work is removed from publication.</p></> },
            ],
          },
          {
            id: "duties-and-responsibilities",
            title: "Duties and responsibilities",
            subsections: [
              { id: "editors-duties", title: "Editors' Duties and Responsibilities", content: <><p>The editors and assistant editors of the Belt &amp; Road Initiative Quarterly are obliged to fulfill their duties in an objective and impartial manner, free from any prejudice.</p><p>The editors and assistant editors of the Belt and Road Initiative Quarterly should act confidentially to the extent required by their duties.</p><p>Editors and assistant editors of the Belt and Road Initiative Journal should cooperate in all activities related to the publication process. Fair distribution of tasks within the journal constitutes the essence of cooperation.</p></> },
              { id: "authors-responsibilities", title: "Ethical Responsibilities of Authors", content: <><p>Owners of works who want their works to be published in the Belt &amp; Road Initiative Quarterly must comply with the provisions of the “Law on Intellectual and Artistic Works No. 5846”, the principles set by YÖK in the Scientific Research and Publication Ethics Directive, the standards set forth by COPE and other principles adopted by the Belt and Road Initiative Quarterly.</p><p>The authors are deemed to have committed that they have prepared the works they sent to the Belt &amp; Road Initiative Quarterly for publication in accordance with the relevant principles and standards.</p></> },
              { id: "reviewers-responsibilities", title: "Ethical Responsibilities of Referees", content: <><p>Referees should carefully review the works sent to them by the Journal or the units authorized by the Journal; should make the evaluation of the work in an impartial and fair manner in accordance with their area of ​​expertise.</p><p>The referees are obliged to immediately inform the Editorial Board of the Journal if they find any contradictions with academic principles and ethical values, national or international principles or standards in the works they evaluate.</p><p>Reviewers should make the assessment in a constructive and courteous manner. Personal comments that are hostile, slanderous and insulting should not be made.</p><a className="editorial-next-link" href="/en/for-authors/copyright-and-licence">Copyright Terms and Licence →︎</a></> },
            ],
          },
        ]}
      />
    </>
  );
}

function EnglishBoards() {
  const groups = [
    ["Publication Board", editorialBoard],
    ["Advisory Board", advisoryBoard],
    ["Editorial production team", editors],
  ] as const;
  return (
    <>
      <EnglishHero kicker="Journal" title="Boards and editorial structure" intro="Academic decision-making, scholarly advice, and editorial production are presented as distinct responsibilities." />
      <div className="site-shell page-section">
        {groups.map(([title, people]) => (
          <PeopleDirectory title={title} people={people} locale="en" key={title} />
        ))}
      </div>
    </>
  );
}

function EnglishPeoplePage({ title, people, intro }: { title: string; people: string[][]; intro: string }) {
  return <><EnglishHero kicker="Journal" title={title} intro={intro} /><div className="site-shell page-section board-page-section"><PeopleDirectory title={title} people={people} locale="en" compact /></div></>;
}

function EnglishPublicationBoard() { return <EnglishPeoplePage title="Publication Board" people={editorialBoard} intro="The members guiding BRIQ’s publication work and their current affiliations." />; }
function EnglishAdvisoryBoard() { return <EnglishPeoplePage title="Advisory Board" people={advisoryBoard} intro="Scholars and experts from multiple countries and disciplines who advise BRIQ." />; }
function EnglishEditorialTeam() { return <EnglishPeoplePage title="Editorial Team" people={editors} intro="The team coordinating manuscripts, language work, translation, editing, and production." />; }

function EnglishIndexes() {
  return (
    <>
      <EnglishHero kicker="Journal" title="Indexes" intro="Verified indexing and repository records, identified by their actual function." />
      <div className="site-shell page-section">
        <IndexTicker locale="en" />
        <div className="index-detail-grid">
          <article><span>01</span><h2>ERIH PLUS</h2><p>European Reference Index for the Humanities and Social Sciences.</p><a className="underlined-link" href="https://erihplus.hkdir.no/">Search the official register ↗︎</a></article>
          <article><span>02</span><h2>EuroPub</h2><p>Academic index containing BRIQ’s journal and article records.</p><a className="underlined-link" href="https://europub.co.uk/journals/briq-belt-road-initiative-quarterly-J-33908">Open the BRIQ profile ↗︎</a></article>
          <article><span>03</span><h2>SSOAR</h2><p>Open social-science repository preserving full-text BRIQ publications; it is not presented as an index.</p><a className="underlined-link" href="https://www.ssoar.info/ssoar/">Open SSOAR ↗︎</a></article>
        </div>
      </div>
    </>
  );
}

function EnglishArchive() {
  return (
    <>
      <EnglishHero kicker="Archive" title="All issues" intro={`Explore ${archiveIssues.length} verified BRIQ issues by volume, issue, and publication season.`} />
      <div className="site-shell page-section">
        <div className="archive-tools"><p><b>{archiveIssues.length} issues</b> · 7 volumes · 2019-2026</p><a className="underlined-link" href="/en/current-issue">Go to current issue →︎</a></div>
        <ArchiveExplorer issues={archiveIssues} locale="en" />
      </div>
    </>
  );
}

function EnglishArticles() {
  return (
    <>
      <EnglishHero kicker="Publications" title="Article Search" intro="Search BRIQ articles, interviews, book reviews, and other contributions by title, author, abstract, DOI, year, and volume." />
      <div className="site-shell page-section">
        <ArticleExplorer articles={archiveArticles} locale="en" />
      </div>
    </>
  );
}

function EnglishCurrentIssue() {
  const publications = archiveArticles.filter((article) => article.volume === 7 && article.issue === 4);
  return (
    <div className="issue-page-themed" style={{ "--issue-tone": issueSurface(7, 4), "--issue-accent": issueAccent(7, 4) } as CSSProperties}>
      <section className="issue-masthead" data-issue="07 / 04">
        <div className="issue-masthead-rule" />
        <div className="site-shell issue-masthead-grid">
          <div className="issue-cover-column">
            <div className="issue-cover-frame"><img src="/assets/current-issue-en.jpg" alt="BRIQ Volume 7 Issue 4 cover" /></div>
            <CoverLightbox src="/assets/current-issue-en.jpg" alt="BRIQ Volume 7 Issue 4 cover" locale="en" />
          </div>
          <div className="issue-masthead-copy">
            <div className="page-breadcrumb issue-breadcrumb"><a href="/en">Home</a><span>/</span><span>Current Issue</span></div>
            <div className="issue-superline"><span>Volume 7 · Issue 4</span><span>Publication Date · September 2026</span></div>
            <h1>A New Era in West Asia</h1>
            <h2>Hegemonism Recedes, Regional Agency Grows</h2>
            <p className="issue-deck">The issue examines West Asia’s changing balance of power alongside Türkiye–China relations, the Digital Silk Road, and China’s global infrastructure strategy.</p>
            <div className="issue-actions"><a className="button button-light" href="#pdf-viewer">Read on site <span>↓︎</span></a><a href="/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf" download>Full issue PDF <span>↓︎</span></a></div>
            <dl className="issue-identity-row"><div><dt>Volume</dt><dd>7</dd></div><div><dt>Issue</dt><dd>4 <span>(Autumn)</span></dd></div></dl>
            <dl className="issue-facts"><div><dt>Publication date</dt><dd>September 2026</dd></div><div><dt>Pages</dt><dd>131</dd></div><div><dt>Languages</dt><dd>Turkish · English abstracts</dd></div><div><dt>Access</dt><dd>Open access · CC BY 4.0</dd></div></dl>
          </div>
        </div>
      </section>
      <section className="site-shell issue-contents-section" id="contents"><div className="issue-section-heading"><div><p className="section-kicker">Contents</p><h2>In this issue</h2></div></div><div className="issue-toc">{publications.map((article, index) => <a href={`/en/articles/${article.slug}`} key={article.slug}><span className="issue-toc-number">{String(index + 1).padStart(2, "0")}</span><span className="issue-toc-meta"><small>{publicationType(article, "en")}</small><b>{article.author}</b></span><span className="issue-toc-title">{article.title_en || article.title_tr}</span><span className="issue-toc-pages">{article.pages}</span><span className="issue-toc-arrow">↗︎</span></a>)}</div></section>
      <div className="site-shell issue-pdf-section"><PdfViewer title="BRIQ Volume 7 · Issue 4" turkishSrc="/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf" englishSrc="/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf" locale="en" /></div>
    </div>
  );
}

function EnglishContact() {
  return <div className="contact-page"><EnglishHero kicker="Contact" title="Contact BRIQ" intro="Contact BRIQ for editorial questions, publication processes, and institutional matters." /><div className="site-shell page-section contact-grid contact-grid-compact"><article><span>Email</span><h2><a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a></h2><p>Manuscripts should be submitted through DergiPark.</p></article><article><span>Office</span><h2>Üsküdar · Istanbul</h2><p>Ünalan Mahallesi, Libadiye Caddesi No:84, Üsküdar / Istanbul, Türkiye</p></article><article><span>Journal contact person</span><h2>İbrahim Fikret Akfırat</h2><p><a href="mailto:fikretakfirat@briqjournal.com">fikretakfirat@briqjournal.com</a></p></article><article><span>Manuscript submission</span><h2 className="dergipark-heading"><DergiParkLogo /></h2><a className="underlined-link" href="https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new">Open the submission page ↗︎</a></article></div><div className="site-shell contact-form-wrap contact-form-wrap-compact"><ContactForm locale="en" /></div></div>;
}

function EnglishSearch() { return <><EnglishHero kicker="Search" title="Search BRIQ" intro="Search articles, authors, issues, cover titles, DOI records, and calls for papers." /><div className="site-shell page-section"><SearchExplorer articles={archiveArticles} issues={archiveIssues} calls={[...calls, ...pastCalls]} locale="en" /></div></>; }

function EnglishCalls() {
  return <><EnglishHero kicker="Calls for Papers" title="Active and Past Calls" intro="BRIQ’s thematic issues, special sections, and continuously open call for book reviews." /><div className="site-shell page-section"><h2 className="page-section-title" id="active">Active calls</h2><div className="calls-page-grid">{calls.map((call) => <a href={call.urlEn} key={call.urlEn}>{call.image ? <img src={call.image} alt="" /> : <div className="call-fallback">BRIQ</div>}<div><span>{call.statusEn} · Deadline: {call.deadlineEn}</span><h2>{call.titleEn}</h2><p>{call.summaryEn}</p><b>View call ↗︎</b></div></a>)}</div><CallsExplorer calls={pastCalls} locale="en" /></div></>;
}

function EnglishAuthorProfile({ id }: { id: string }) {
  const profile = findAuthorProfile(id);
  if (!profile) return null;
  return (
    <>
      <section className="author-page-hero">
        <div className="site-shell author-page-hero-inner">
          <div className="page-breadcrumb"><a href="/en">Home</a><span>/</span><span>Author</span></div>
          <div className="author-page-identity">
            {profile.photo ? <img className="author-page-photo" src={profile.photo} alt={`${profile.name} portrait`} /> : <span className="author-page-monogram" aria-hidden="true">{profile.name.slice(0, 1)}</span>}
            <div><p className="section-kicker">{profile.rolesEn.length ? profile.rolesEn.join(" · ") : "Author"}</p><h1>{profile.name}</h1><p>{profile.affiliationEn}</p></div>
          </div>
          <div className="author-page-links" aria-label="Author external links">
            {profile.email && <a href={`mailto:${profile.email}`}>Email <span>↗︎</span></a>}
            <a href={profile.scholarUrl} target="_blank" rel="noreferrer">Search Google Scholar <span>↗︎</span></a>
            {profile.orcids.map((orcid) => <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noreferrer" key={orcid}>ORCID <span>↗︎</span></a>)}
            {profile.institutionUrl && <a href={profile.institutionUrl} target="_blank" rel="noreferrer">Institutional page <span>↗︎</span></a>}
          </div>
        </div>
      </section>
      <div className="site-shell author-page-layout">
        <aside><span>BRIQ publications</span><b>{profile.articles.length}</b><p>This page brings together all of the author’s work in the BRIQ archive.</p></aside>
        <div className="author-page-main">
          {profile.briqAppointments.length > 0 && (
            <section className="author-transparency" aria-label="Short biography and BRIQ appointments">
              <article className="author-profile-panel">
                <p className="section-kicker">Profile</p>
                <h2>Short biography</h2>
                <p>{profile.biographyEn}</p>
              </article>
              <article className="author-profile-panel author-role-panel">
                <p className="section-kicker">BRIQ</p>
                <h2>Roles and terms</h2>
                <dl className="author-role-list">
                  {profile.briqAppointments.map((appointment) => (
                    <div key={`${appointment.roleEn}-${appointment.termEn}`}><dt>{appointment.roleEn}</dt><dd>{appointment.termEn}</dd></div>
                  ))}
                </dl>
                <small>Terms reflect BRIQ’s published current board record for 2026.</small>
              </article>
            </section>
          )}
          <section className="author-page-publications">
            <div><p className="section-kicker">Archive</p><h2>Work published in BRIQ</h2></div>
            <div className="author-work-list">
              {profile.articles.map((article) => (
                <a href={`/en/articles/${article.slug}`} key={`${article.volume}-${article.issue}-${article.slug}`}>
                  <span className="author-work-issue" style={{ backgroundColor: issueAccent(article.volume, article.issue) }}>Volume {article.volume} · Issue {article.issue} · {article.year}</span>
                  <h3>{article.title_en || article.title_tr}</h3>
                  <p>{article.pages ? `pp. ${article.pages}` : article.season_en}{article.doi ? ` · DOI: ${article.doi}` : ""}</p>
                  <b aria-hidden="true">→︎</b>
                </a>
              ))}
              {profile.articles.length === 0 && <p className="author-work-empty">This board member does not yet have a signed work in the BRIQ archive.</p>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function EnglishReports() {
  return (
    <>
      <EnglishHero kicker="Journal" title="Annual reports" intro="Verified records of BRIQ’s publication activity, international reach, and institutional development." />
      <div className="site-shell page-section report-list">
        {annualReports.map((report) => (
          <a href={`/en/annual-reports/${report.number}`} key={report.number}>
            <span>{String(report.number).padStart(2, "0")}</span>
            <div><small>{report.dateEn}</small><h2>BRIQ {report.titleEn}</h2></div>
            <b>PDF ↗︎</b>
          </a>
        ))}
      </div>
    </>
  );
}

function EnglishReport({ number }: { number: number }) {
  const report = annualReports.find((item) => item.number === number);
  if (!report) return null;
  return (
    <>
      <EnglishHero kicker="Annual Report" title={`BRIQ ${report.titleEn}`} intro={`A verified record dated ${report.dateEn}.`} />
      <div className="site-shell reading-layout">
        <aside className="issue-record-number"><span>REPORT</span><b>{String(report.number).padStart(2, "0")}</b></aside>
        <div className="reading-content"><section><h2>Verified report record</h2><p>The original Turkish and English reports have been matched to BRIQ’s source archive and are available in the on-site viewer.</p></section><a className="underlined-link" href="/en/annual-reports">Back to all reports →︎</a></div>
      </div>
      <div className="site-shell issue-pdf-section"><PdfViewer title={`BRIQ ${report.titleEn}`} turkishSrc={report.pdfTrLocal} englishSrc={report.pdfEnLocal} locale="en" /></div>
    </>
  );
}

function EnglishIssue({ volume, issueNumber }: { volume: number; issueNumber: number }) {
  const record = findArchiveIssue(volume, issueNumber);
  if (!record) return null;
  const publications = record.articles.map(findArchiveArticle).filter((item) => item !== undefined);
  const trPdf = issuePdfUrl(record, "tr");
  const enPdf = issuePdfUrl(record, "en");
  return (
    <div className="issue-page-themed" style={{ "--issue-tone": issueSurface(volume, issueNumber), "--issue-accent": issueAccent(volume, issueNumber) } as CSSProperties}>
      <EnglishHero kicker="Archive" title={`Volume ${volume} · Issue ${issueNumber}`} intro={issueLabel(record, "en")} />
      <div className="site-shell page-section issue-detail">
        <aside className="issue-detail-cover"><img src={record.cover_en} alt={`BRIQ Volume ${volume} Issue ${issueNumber} English cover`} />{enPdf && <a className="button button-dark" href="#pdf-viewer">Read the full issue ↓︎</a>}</aside>
        <div className="issue-detail-content">
          <div className="fact-strip"><div><span>Publication season</span><b>{record.season_en} {record.year}</b></div><div><span>Contributions</span><b>{publications.length}</b></div><div><span>Access</span><b>Open access</b></div></div>
          <h2>Contents</h2>
          <div className="compact-article-list">
            {publications.map((publication) => (
              <a href={`/en/articles/${publication.slug}`} key={publication.slug}><small>{publication.pages ? `pp. ${publication.pages}` : "Publication record"}{publication.doi ? ` · DOI: ${publication.doi}` : ""}</small><h3>{publication.title_en || publication.title_tr}</h3><p>{publication.author}</p></a>
            ))}
          </div>
          <a className="underlined-link" href="/en/archive">Back to all issues →︎</a>
        </div>
      </div>
      {(trPdf || enPdf) && <div className="site-shell issue-pdf-section"><PdfViewer title={`BRIQ Volume ${volume} · Issue ${issueNumber}`} turkishSrc={trPdf} englishSrc={enPdf} locale="en" /></div>}
    </div>
  );
}

function EnglishArticle({ slug }: { slug: string }) {
  const article = findArchiveArticle(slug);
  if (!article) return null;
  return <ArticlePlatform article={article} locale="en" routeSlug={slug} />;
}

function EnglishArticlePdf({ slug }: { slug: string }) {
  const article = findArchiveArticle(slug);
  return article ? <ArticlePdfPage article={article} locale="en" routeSlug={slug} /> : null;
}

const englishCallEditorialCopy: Record<string, { paragraphs: string[]; topics?: [string, string[]][]; note?: string }> = {
  "transatlantic-relations": {
    paragraphs: [
      "The contemporary international system is undergoing a profound transformation shaped by overlapping crises, shifting balances of power, and the erosion of established institutions. The war in Ukraine, political change in the United States, and the conflict involving Iran have accelerated the reconfiguration of transatlantic relations.",
      "BRIQ invites critical and interdisciplinary contributions that examine US–European relations and NATO’s changing role together with structural transformations in the global system.",
    ],
    topics: [
      ["Transformation in transatlantic relations", ["US–European relations after the war in Ukraine", "Strategic divergences between Washington and European actors", "The effects of changes in US domestic politics on alliance relations"]],
      ["The changing security environment", ["NATO’s role amid conflicts on multiple fronts", "Burden-sharing, deterrence, and strategic autonomy", "Alternative security architectures in Europe"]],
      ["Multipolarity and the crisis of the Western alliance", ["The rise of alternative geopolitical platforms", "The role of BRICS, the SCO, and the Global South", "The transformation of global governance structures"]],
    ],
    note: "Original manuscripts of 5,000–9,000 words that are not under consideration elsewhere are accepted. BRIQ uses APA style, and scholarly articles undergo double-blind peer review.",
  },
  "artificial-intelligence-productive-forces": {
    paragraphs: [
      "At every major transformation from the industrial revolutions to the digital turn, humanity has reconsidered the relationship between productive forces and social organisation. Artificial intelligence is now one of the most important dimensions of that relationship.",
      "BRIQ welcomes critical, comparative, theoretical, and empirical studies on the effects of artificial intelligence on productive forces, labour, scientific production, public planning, international inequalities, and ethical governance.",
    ],
    topics: [
      ["Labour and production", ["Automation, the labour process, and productivity", "The transformation of white-collar cognitive labour", "Reskilling and the distribution of productivity gains"]],
      ["Public benefit and technological sovereignty", ["Artificial intelligence in health, education, agriculture, energy, and disaster management", "Data sovereignty, computing infrastructure, and open source", "Public-oriented applications in developing countries"]],
      ["Science and ethics", ["Scientific discovery and verification", "Academic authorship, originality, and citation", "Explainability, accountability, privacy, and security"]],
    ],
    note: "Original Turkish- or English-language manuscripts of 5,000–9,000 words that are not under consideration elsewhere are accepted. BRIQ uses APA 7, and scholarly articles undergo double-blind peer review.",
  },
  "book-reviews": {
    paragraphs: [
      "BRIQ continuously accepts proposals for critical reviews of recent scholarly books on international politics, economics, culture, Asia, the Belt and Road Initiative, and the developing world.",
      "Once a proposal is accepted, the review should concisely introduce the book’s main questions and perspective and assess its strengths, weaknesses, scholarly quality, and contribution to the field.",
    ],
    topics: [["Review file", ["No more than 1,000 words", "The book’s bibliographic record in APA style", "A short biography of the reviewer of no more than 150 words", "A critical, reasoned, and properly sourced assessment"]]],
    note: "Book proposals and submission questions may be sent to the BRIQ Publication Board at briq@briqjournal.com.",
  },
};

function EnglishCallDetail({ slug }: { slug: string }) {
  const active = calls.find((item) => item.urlEn.endsWith(`/${slug}`));
  const past = pastCalls.find((item) => item.slug === slug);
  const title = active?.titleEn || past?.titleEn;
  if (!title) return null;
  const deadline = active?.deadlineEn || past?.deadlineEn || "";
  const copy = englishCallEditorialCopy[slug];
  return (
    <>
      <EnglishHero kicker="Call for Papers" title={title} intro={`Deadline: ${deadline}`} />
      <div className="site-shell reading-layout call-detail-page">
        <aside className="reading-nav"><b>Call information</b><span>Deadline: {deadline}</span><span>{active ? "Active call" : "Past call"}</span></aside>
        <div className="reading-content">
          <section><h2>Scope of the call</h2>{copy ? copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>This thematic call was published to bring together international scholarly contributions for the relevant BRIQ issue.</p>}</section>
          {copy?.topics?.map(([heading, topics]) => <section key={heading}><h2>{heading}</h2><ul>{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></section>)}
          {copy?.note && <section><h2>Guidelines and submission</h2><p>{copy.note}</p></section>}
          {past && <section><h2>Outcome of the call</h2><p>{past.issueHrefEn ? <>The issue published following this call: <a className="inline-link" href={past.issueHrefEn}>{past.issueEn}</a>.</> : past.issueEn}</p></section>}
          {active && <section><h2>Submission</h2><p>Manuscripts may be prepared in Turkish or English. Authors should review the submission guidelines before submitting.</p><a className="button button-dark dergipark-button" href="https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new"><DergiParkLogo prefix="Submit via" /><span>↗︎</span></a></section>}
          <a className="underlined-link" href="/en/calls-for-papers">Back to all calls →︎</a>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/");
  const articlePdfMatch = key.match(/^articles\/(.+)\/pdf$/);
  if (articlePdfMatch) {
    const article = findArchiveArticle(articlePdfMatch[1]);
    if (article) {
      const title = article.title_en || article.title_tr;
      return {
        title: `${title} — PDF | BRIQ`,
        description: `Verified PDF viewer for ${title}.`,
        alternates: {
          canonical: `/en/articles/${article.slug}/pdf`,
          languages: { "tr-TR": `/makaleler/${article.slug}/pdf`, "en-US": `/en/articles/${article.slug}/pdf` },
        },
      };
    }
  }
  const articleMatch = key.match(/^articles\/(.+)$/);
  if (articleMatch) {
    const article = findArchiveArticle(articleMatch[1]);
    if (article) {
      const title = article.title_en || article.title_tr;
      const description = article.abstract_en?.split("\n").find(Boolean)?.slice(0, 300)
        || `${article.author}, BRIQ Volume ${article.volume}, Issue ${article.issue}.`;
      const firstPage = article.pages?.split(/[-–]/)[0];
      const lastPage = article.pages?.split(/[-–]/)[1];
      return {
        title: `${title} | BRIQ`,
        description,
        alternates: {
          canonical: `/en/articles/${article.slug}`,
          languages: {
            "tr-TR": `/makaleler/${article.slug}`,
            "en-US": `/en/articles/${article.slug}`,
          },
        },
        other: {
          citation_title: title,
          citation_author: article.author,
          citation_journal_title: "BRIQ Belt & Road Initiative Quarterly",
          citation_volume: String(article.volume),
          citation_issue: String(article.issue),
          citation_publication_date: article.year,
          citation_language: "en",
          ...(firstPage ? { citation_firstpage: firstPage } : {}),
          ...(lastPage ? { citation_lastpage: lastPage } : {}),
          ...(article.doi ? { citation_doi: article.doi } : {}),
          ...(articlePdfUrl(article, "en") ? { citation_pdf_url: `https://briq-academic-journal.iakfiratt.chatgpt.site${articlePdfUrl(article, "en")}` } : {}),
        },
      };
    }
  }
  const authorMatch = key.match(/^authors\/(.+)$/);
  if (authorMatch) {
    const profile = findAuthorProfile(authorMatch[1]);
    if (profile) {
      return {
        title: `${profile.name} | BRIQ`,
        description: `${profile.name}: ${profile.affiliationEn}. ${profile.articles.length} work(s) published in BRIQ.`,
        alternates: {
          canonical: `/en/authors/${profile.id}`,
          languages: { "tr-TR": `/yazar/${profile.id}`, "en-US": `/en/authors/${profile.id}` },
        },
      };
    }
  }

  const issueMatch = key.match(/^archive\/volume-(\d+)-issue-(\d+)$/);
  if (issueMatch) {
    const issue = findArchiveIssue(Number(issueMatch[1]), Number(issueMatch[2]));
    if (issue) {
      return {
        title: `${issueLabel(issue, "en")} | BRIQ`,
        description: `${issueLabel(issue, "en")} contents and bilingual full-issue PDF archive.`,
        alternates: {
          canonical: `/en/archive/volume-${issue.volume}-issue-${issue.issue}`,
          languages: {
            "tr-TR": `/arsiv/cilt-${issue.volume}-sayi-${issue.issue}`,
            "en-US": `/en/archive/volume-${issue.volume}-issue-${issue.issue}`,
          },
        },
      };
    }
  }
  const reportMatch = key.match(/^annual-reports\/(\d+)$/);
  if (reportMatch) {
    const report = annualReports.find((item) => item.number === Number(reportMatch[1]));
    if (report) {
      return {
        title: `BRIQ ${report.titleEn} | BRIQ`,
        description: `Verified BRIQ annual report dated ${report.dateEn}.`,
        alternates: {
          canonical: `/en/annual-reports/${report.number}`,
          languages: { "tr-TR": `/yillik-raporlar/${report.number}`, "en-US": `/en/annual-reports/${report.number}` },
        },
      };
    }
  }
  const callMatch = key.match(/^calls-for-papers\/(.+)$/);
  if (callMatch) {
    const callSlug = callMatch[1];
    const active = calls.find((item) => item.urlEn.endsWith(`/${callSlug}`));
    const past = pastCalls.find((item) => item.slug === callSlug);
    const title = active?.titleEn || past?.titleEn;
    if (title) {
      const turkishSlug = callSlug === "transatlantic-relations"
        ? "transatlantik-iliskilerin-yeniden-yapilanmasi"
        : callSlug === "artificial-intelligence-productive-forces"
          ? "yapay-zeka-uretici-gucler-ortak-refah"
          : callSlug === "book-reviews" ? "kitap-incelemesi" : callSlug;
      return {
        title: `${title} | BRIQ`,
        description: active?.summaryEn || `Archived BRIQ call for papers. Deadline: ${past?.deadlineEn}.`,
        alternates: {
          canonical: `/en/calls-for-papers/${callSlug}`,
          languages: { "tr-TR": `/makale-cagrilari/${turkishSlug}`, "en-US": `/en/calls-for-papers/${callSlug}` },
        },
      };
    }
  }
  const staticPage = englishPageMetadata[key];
  if (staticPage) {
    return {
      title: `${staticPage[0]} | BRIQ`,
      description: staticPage[1],
      alternates: {
        canonical: `/en/${key}`,
        languages: { "tr-TR": staticPage[2], "en-US": `/en/${key}` },
      },
    };
  }
  return { title: "BRIQ | Belt & Road Initiative Quarterly" };
}

export default async function EnglishContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug.join("/");
  const issueMatch = key.match(/^archive\/volume-(\d+)-issue-(\d+)$/);
  const articlePdfMatch = key.match(/^articles\/(.+)\/pdf$/);
  const articleMatch = key.match(/^articles\/(.+)$/);
  const authorMatch = key.match(/^authors\/(.+)$/);
  const reportMatch = key.match(/^annual-reports\/(\d+)$/);
  const page = pages[key];

  let content;
  if (key === "journal" || key === "journal/about-briq") content = <EnglishAboutBriq />;
  else if (key === "journal/publication-principles") content = <EnglishPublicationPrinciples />;
  else if (key === "journal/publication-board") content = <EnglishPublicationBoard />;
  else if (key === "journal/advisory-board") content = <EnglishAdvisoryBoard />;
  else if (key === "journal/indexes") content = <EnglishIndexes />;
  else if (key === "for-authors") content = <EnglishAuthorsHub />;
  else if (key === "for-authors/guidelines") content = <EnglishWritingRules />;
  else if (key === "for-authors/review-process") content = <EnglishReviewFlow />;
  else if (key === "for-authors/copyright-and-licence") content = <EnglishCopyrightTerms />;
  else if (key === "for-authors/publication-ethics") content = <EnglishEthicsPolicy />;
  else if (key === "current-issue") content = <EnglishCurrentIssue />;
  else if (key === "archive") content = <EnglishArchive />;
  else if (key === "articles") content = <EnglishArticles />;
  else if (key === "calls-for-papers") content = <EnglishCalls />;
  else if (key === "contact") content = <EnglishContact />;
  else if (key === "search") content = <EnglishSearch />;
  else if (key === "annual-reports") content = <EnglishReports />;
  else if (issueMatch) content = <EnglishIssue volume={Number(issueMatch[1])} issueNumber={Number(issueMatch[2])} />;
  else if (articlePdfMatch) content = <EnglishArticlePdf slug={articlePdfMatch[1]} />;
  else if (articleMatch) content = <EnglishArticle slug={articleMatch[1]} />;
  else if (authorMatch) content = <EnglishAuthorProfile id={authorMatch[1]} />;
  else if (reportMatch) content = <EnglishReport number={Number(reportMatch[1])} />;
  else if (key.startsWith("calls-for-papers/")) content = <EnglishCallDetail slug={key.split("/").pop() || ""} />;
  else if (page) content = <EnglishStandardPage page={page} />;
  else notFound();

  if (content === null) notFound();

  return (
    <main lang="en">
      <SiteHeader locale="en" />
      {content}
      <SiteFooter locale="en" />
    </main>
  );
}
