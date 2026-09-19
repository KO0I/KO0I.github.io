/* Display-only correction. Never change the case-sensitive Marain glyph keys. */
(function (root) {
  'use strict';
  function formatRoman(value) {
    let start = true;
    return String(value || '').split(/(<\?\?>)/g).map(part => {
      if (part === '<??>') { start = false; return part; }
      part = part.replace(/\b(marayn|raybihn|raymuhrer)(yuh|uh|va|vihl|sa|li|ye)?\b/gi,
        word => word[0].toUpperCase() + word.slice(1).toLowerCase());
      return part.replace(/[A-Za-z]+|[.!?]+/g, token => {
        if (/^[.!?]/.test(token)) { start = true; return token; }
        if (start) { start = false; return token[0].toUpperCase() + token.slice(1); }
        return token;
      });
    }).join('');
  }
  if (typeof module === 'object' && module.exports) {
    module.exports = { formatRoman }; return;
  }
  const document = root.document;
  const scriptURL = document.currentScript && document.currentScript.src;
  if (!scriptURL) return;
  // Resolve relative to this JS file; respects a Jekyll baseurl and local previews.
  const woff = new URL('../../fonts/marain.woff', scriptURL).href;
  const ttf = new URL('../../fonts/Marain.ttf', scriptURL).href;
  function init() {
    const style = document.createElement('style');
    style.textContent = `
      .marain-page .marain, #englishMarainGlyphs, #dictmarain {
        font-family: "MarainDisplayFixed", serif !important;
        font-weight: normal !important;
        font-style: normal !important;
        font-variant: normal !important;
        font-synthesis: none;
        text-transform: none !important;
      }
      #englishMarainRoman, #marainPhraseRoman {
        font-family: inherit !important;
        font-variant: normal !important;
        text-transform: none !important;
      }
      .marain-page .marain-unknown, .marain-page .marain-punctuation {
        font-family: system-ui, sans-serif !important;
      }
      .marain-font-notice { font-family: system-ui, sans-serif; font-size: .9rem; }
    `;
    document.head.append(style);
    ['englishMarainRoman', 'marainPhraseRoman'].forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      function update() {
        const old = element.textContent, formatted = formatRoman(old);
        if (old !== formatted) element.textContent = formatted;
      }
      new MutationObserver(update).observe(element, {childList:true, characterData:true, subtree:true});
      update();
    });
    const displays = ['englishMarainGlyphs', 'marainPhraseGlyphs', 'dictmarain']
      .map(id => document.getElementById(id)).filter(Boolean);
    const notices = displays.map(element => {
      element.style.visibility = 'hidden';
      element.setAttribute('aria-busy', 'true');
      const notice = document.createElement('p');
      notice.className = 'marain-font-notice';
      notice.setAttribute('role', 'status');
      notice.textContent = 'Loading Marain glyphs…';
      element.after(notice);
      return notice;
    });
    function failed() {
      displays.forEach(element => element.setAttribute('aria-busy', 'false'));
      notices.forEach(notice => {
        notice.textContent = 'The Marain font could not load. Romanised text is still available; check that assets/fonts/marain.woff or assets/fonts/Marain.ttf exists.';
      });
    }
    if (!root.FontFace || !document.fonts) { failed(); return; }
    const font = new FontFace('MarainDisplayFixed',
      'url(' + JSON.stringify(woff) + ') format("woff"), url(' + JSON.stringify(ttf) + ') format("truetype")');
    document.fonts.add(font);
    const timer = root.setTimeout(failed, 10000);
    font.load().then(() => {
      root.clearTimeout(timer);
      displays.forEach(element => {
        element.style.visibility = '';
        element.setAttribute('aria-busy', 'false');
      });
      notices.forEach(notice => notice.remove());
    }).catch(() => { root.clearTimeout(timer); failed(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}(typeof window === 'undefined' ? globalThis : window));
