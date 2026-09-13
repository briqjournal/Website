export function CallDeadline({ value }: { value: string }) {
  const match = value.match(/^(.*?)\s+(\d{4})$/);
  return (
    <strong>
      <span>{match?.[1] || value}</span>
      {match?.[2] && <span>{match[2]}</span>}
    </strong>
  );
}
