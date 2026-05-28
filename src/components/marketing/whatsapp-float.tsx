/** Floating WhatsApp contact button — bottom-right corner of the landing page. */
export function WhatsAppFloat(): React.JSX.Element {
  return (
    <a
      href="https://wa.me/201500099671"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-110 hover:shadow-xl active:scale-95"
    >
      <WhatsAppSvg />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}

function WhatsAppSvg(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9s-.5-.1-.7.1-.7.9-.9 1.1-.3.2-.6 0c-1.7-.8-2.8-1.5-3.9-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-1-2.3c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.9 4.2 2.2.9 2.6.7 3 .6.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z" />
    </svg>
  );
}
