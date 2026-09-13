"use client";

import { FormEvent, useRef, useState } from "react";

export function AuthorUpdateForm({ authorName, locale = "tr" }: { authorName: string; locale?: "tr" | "en" }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [prepared, setPrepared] = useState(false);
  const isEnglish = locale === "en";

  const close = () => {
    dialogRef.current?.close();
    setPrepared(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const file = data.get("attachment");
    const fileName = file instanceof File && file.name ? file.name : "";
    const subject = isEnglish ? `Author profile update — ${authorName}` : `Yazar profili güncelleme — ${authorName}`;
    const body = isEnglish
      ? `Profile: ${authorName}\nFull name: ${name}\nEmail: ${email}\n${fileName ? `Selected file: ${fileName} (please attach this file to the email)\n` : ""}\nRequested changes:\n${message}`
      : `Profil: ${authorName}\nAd Soyad: ${name}\nE-posta: ${email}\n${fileName ? `Seçilen dosya: ${fileName} (lütfen bu dosyayı e-postaya ekleyin)\n` : ""}\nTalep edilen güncellemeler:\n${message}`;
    window.location.href = `mailto:briq@briqjournal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  };

  return (
    <>
      <button className="author-update-trigger" type="button" onClick={() => dialogRef.current?.showModal()}>
        <svg className="author-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10.8-10.8a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4"/></svg>
        <span>{isEnglish ? "Update profile" : "Güncelle"}</span>
      </button>
      <dialog className="author-update-dialog" ref={dialogRef} onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}>
        <form className="author-update-form" onSubmit={submit}>
          <button className="author-update-close" type="button" onClick={close} aria-label={isEnglish ? "Close" : "Kapat"}>×</button>
          <p className="section-kicker">{isEnglish ? "Author record" : "Yazar kaydı"}</p>
          <h2>{isEnglish ? "Request a profile update" : "Profil güncelleme talebi"}</h2>
          <p>{isEnglish ? `Send updated biographical or institutional information for ${authorName}.` : `${authorName} için güncel biyografi veya kurum bilgilerini iletin.`}</p>
          <div className="author-update-fields">
            <label><span>{isEnglish ? "Full name" : "Ad Soyad"}</span><input name="name" autoComplete="name" required /></label>
            <label><span>{isEnglish ? "Email" : "E-posta"}</span><input name="email" type="email" autoComplete="email" required /></label>
            <label className="full"><span>{isEnglish ? "Requested changes" : "Güncelleme metni"}</span><textarea name="message" rows={8} required /></label>
            <label className="full file-field"><span>{isEnglish ? "Supporting file" : "Destekleyici dosya"}</span><input name="attachment" type="file" accept=".pdf,.doc,.docx,.odt,.rtf,.jpg,.jpeg,.png" /><small>{isEnglish ? "PDF, Word, ODT or image. Your email application will open; attach the selected file before sending." : "PDF, Word, ODT veya görsel. E-posta uygulamanız açıldığında seçtiğiniz dosyayı gönderiye ekleyin."}</small></label>
          </div>
          <div className="author-update-actions"><button className="button button-dark" type="submit">{isEnglish ? "Prepare email" : "E-postayı hazırla"} <span>→︎</span></button><button type="button" onClick={close}>{isEnglish ? "Cancel" : "Vazgeç"}</button></div>
          {prepared && <p className="form-note" role="status">{isEnglish ? "The message has been prepared for briq@briqjournal.com in your email application." : "Mesaj briq@briqjournal.com adresine gönderilmek üzere e-posta uygulamanızda hazırlandı."}</p>}
        </form>
      </dialog>
    </>
  );
}
