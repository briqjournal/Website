export function DergiParkLogo({ prefix, suffix }: { prefix?: string; suffix?: string }) {
  return (
    <span className="dergipark-lockup">
      {prefix && <span>{prefix}</span>}
      <img src="/assets/dergipark-logo.png" alt="DergiPark" width={414} height={114} />
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
