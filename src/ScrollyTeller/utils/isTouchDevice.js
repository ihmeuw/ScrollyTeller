/* global window */

/* refactored from: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent */
export default function isTouchDevice() {
  const { navigator, matchMedia } = window;
  let hasTouchScreen = false;
  if (
    ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0)
    || ('msMaxTouchPoints' in navigator && navigator.msMaxTouchPoints > 0)
  ) {
    hasTouchScreen = true;
  } else {
    const mQ = matchMedia && matchMedia('(pointer:coarse)');
    if (mQ && mQ.media === '(pointer:coarse)') {
      hasTouchScreen = !!mQ.matches;
    } else if ('orientation' in window) {
      hasTouchScreen = true; // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      const UA = navigator.userAgent;
      hasTouchScreen = (
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA)
        || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
      );
    }
  }
  return hasTouchScreen;
}
