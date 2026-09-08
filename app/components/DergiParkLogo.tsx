export function DergiParkLogo({ prefix, suffix }: { prefix?: string; suffix?: string }) {
  return (
    <span className="dergipark-lockup">
      {prefix && <span>{prefix}</span>}
      <img src="/assets/dergipark-logo.png" alt="DergiPark" />
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
