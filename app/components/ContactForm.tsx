"use client";

import { FormEvent, useState } from "react";

export function ContactForm({ locale = "tr" }: { locale?: "tr" | "en" }) {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const subject = String(data.get("subject") || "BRIQ web sitesi iletişim formu");
    const message = String(data.get("message") || "");
    const body = `${locale === "en" ? "Name" : "Ad Soyad"}: ${name}\n${locale === "en" ? "Email" : "E-posta"}: ${email}\n\n${message}`;
    window.location.href = `mailto:briq@briqjournal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return (
    <form className="contact-form" onSubmit={submit}>
      <div><p className="section-kicker">{locale === "en" ? "Write to us" : "Bize yazın"}</p><h2>{locale === "en" ? "Contact form" : "İletişim formu"}</h2><p>{locale === "en" ? "Your message is prepared for briq@briqjournal.com in your email application." : "Mesajınız, e-posta uygulamanızda briq@briqjournal.com adresine gönderilmek üzere hazırlanır."}</p></div>
      <div className="contact-form-grid">
        <label><span>{locale === "en" ? "Full name" : "Ad Soyad"}</span><input name="name" required /></label>
        <label><span>{locale === "en" ? "Email" : "E-posta"}</span><input name="email" type="email" required /></label>
        <label className="full"><span>{locale === "en" ? "Subject" : "Konu"}</span><input name="subject" required /></label>
        <label className="full"><span>{locale === "en" ? "Message" : "Mesaj"}</span><textarea name="message" rows={5} required /></label>
      </div>
      <button className="button button-dark" type="submit">{locale === "en" ? "Prepare email" : "E-postayı hazırla"} <span>→︎</span></button>
      {sent && <p className="form-note" role="status">{locale === "en" ? "Your email application has been opened with the recipient and message filled in." : "E-posta uygulamanız alıcı ve mesaj doldurulmuş olarak açıldı."}</p>}
    </form>
  );
}
