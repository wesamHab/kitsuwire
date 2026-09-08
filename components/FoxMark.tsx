type FoxMarkProps = { size?: number; className?: string };

export function FoxMark({ size = 34, className = "" }: FoxMarkProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 17L25 22L32 12L39 22L52 17L47 38C45 47 39 53 32 55C25 53 19 47 17 38L12 17Z" fill="currentColor"/>
      <path d="M20 27L27 31L23 36L20 27Z" fill="#C9FF42"/>
      <path d="M44 27L37 31L41 36L44 27Z" fill="#C9FF42"/>
      <path d="M27 42L32 46L37 42L32 50L27 42Z" fill="#C9FF42"/>
    </svg>
  );
}
