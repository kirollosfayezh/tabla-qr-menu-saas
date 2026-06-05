/**
 * Client helpers for opening a Paymob checkout in a popup window.
 *
 * The popup must be opened synchronously inside the click handler (before any
 * `await`) to dodge popup blockers; `openBlankPopup` reserves the window and
 * `openCheckout` later points it at the real URL once the action returns.
 */

const POPUP_NAME = 'tabla-paymob';
const POPUP_FEATURES = 'width=460,height=720,noopener,noreferrer';

export function openBlankPopup(): Window | null {
  return window.open('', POPUP_NAME, POPUP_FEATURES);
}

export function openCheckout(url: string, popup: Window | null): void {
  if (popup) {
    popup.location.href = url;
    popup.focus();
    return;
  }
  const opened = window.open(url, POPUP_NAME, POPUP_FEATURES);
  if (!opened) window.location.href = url;
}
