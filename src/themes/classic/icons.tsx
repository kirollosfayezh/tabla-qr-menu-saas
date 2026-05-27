type IconProps = { size?: number; className?: string };

export function SearchIcon({ size = 16, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function CloseIcon({ size = 16, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronStartIcon({ size = 18, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function WhatsappIcon({ size = 20, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.92.55 3.78 1.6 5.4L2 22l4.84-1.27a9.86 9.86 0 0 0 5.2 1.5h.01c5.46 0 9.89-4.43 9.89-9.89S17.5 2 12.04 2Zm5.81 14.05c-.25.7-1.44 1.31-2.02 1.4-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.71-.64-3.01-1.3-4.98-4.33-5.13-4.53-.15-.2-1.23-1.63-1.23-3.11 0-1.48.77-2.2 1.05-2.5.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.18.01.43-.07.67.51.25.6.85 2.08.93 2.23.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.48.13.66-.08.18-.2.76-.88.96-1.19.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.22.58.35.07.13.07.74-.18 1.45Z" />
    </svg>
  );
}

export function StarIcon({ size = 11, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="m12 2 3.09 6.26 6.91 1-5 4.87L18.18 21 12 17.77 5.82 21 7 14.13l-5-4.87 6.91-1L12 2Z" />
    </svg>
  );
}

export function CheckIcon({ size = 12, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
