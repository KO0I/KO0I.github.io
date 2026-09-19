/* Dictionary is the default. Move existing DOM nodes to preserve input and listeners. */
(function () {
  'use strict';
  function init() {
    const root = document.querySelector('.marain-page');
    if (!root || root.querySelector('[data-marain-tabs]')) return;
    const dictionary = root.querySelector('#dictionary');
    const phrases = root.querySelector('#phrase-translator');
    // Leave the existing page usable if the phrase update has not been installed.
    if (!dictionary || !phrases) return;
    const words = root.querySelector('#english-to-marain');
    const rules = root.querySelector('.marain-rules');
    const introduction = dictionary.previousElementSibling;
    // Jekyll renders the Markdown symbol table outside .marain-page.
    // Search only within this page's containing element and match its heading.
    const alphabetHeading = Array.from(root.parentElement.querySelectorAll('h2, h3'))
      .find(heading => /marain\s*[-–—]?\s*latin\s+symbol\s+table/i.test(heading.textContent));
    let alphabetContent = null;
    if (alphabetHeading) {
      const next = alphabetHeading.nextElementSibling;
      if (next && next.tagName === 'TABLE') alphabetContent = next;
      else if (next && next !== root && next.querySelector('table')) alphabetContent = next;
    }
    const list = document.createElement('div');
    list.className = 'marain-tabs';
    list.dataset.marainTabs = '';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Marain tools');
    const panels = [], tabs = [];
    ['Dictionary', 'Phrases', 'Alphabet'].forEach((name, i) => {
      const slug = name.toLowerCase();
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = 'marain-tab-' + slug;
      tab.textContent = name;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'marain-panel-' + slug);
      const panel = document.createElement('div');
      panel.id = 'marain-panel-' + slug;
      panel.className = 'marain-tab-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tabs.push(tab); panels.push(panel); list.append(tab);
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault(); select(next, true);
      });
    });
    function select(index, focus) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }
    if (introduction && introduction.tagName === 'P' &&
        /^Look up Marain words\s*$/i.test(introduction.textContent.trim())) {
      panels[0].append(introduction);
    }
    panels[0].append(dictionary);
    if (words) panels[0].append(words);
    panels[1].append(phrases);
    if (rules) panels[1].append(rules);
    if (alphabetHeading && alphabetContent) {
      const scroll = document.createElement('div');
      scroll.className = 'marain-alphabet-scroll';
      scroll.append(alphabetContent);
      panels[2].append(alphabetHeading, scroll);
    } else {
      const message = document.createElement('p');
      message.textContent = 'The symbol table could not be located on this page.';
      panels[2].append(message);
    }
    const style = document.createElement('style');
    style.textContent = `
      .marain-tabs { display:flex; gap:.5rem; flex-wrap:wrap; margin:0 0 1rem; border-bottom:1px solid #595165; padding-bottom:.65rem; }
      .marain-tabs [role="tab"] { font:inherit; cursor:pointer; padding:.6rem 1.1rem; border:1px solid #8771af; border-radius:.4rem; background:#201d2b; color:#f3efe4; }
      .marain-tabs [role="tab"][aria-selected="true"] { background:#d8c7ff; color:#17121f; font-weight:700; border-color:#d8c7ff; }
      .marain-tabs [role="tab"]:focus-visible, .marain-tab-panel:focus-visible { outline:2px solid #c3a7ff; outline-offset:3px; }
      .marain-alphabet-scroll { overflow-x:auto; }
      .marain-alphabet-scroll table { width:100%; border-collapse:collapse; }
      .marain-alphabet-scroll th, .marain-alphabet-scroll td { text-align:center; padding:.5rem; }
      .marain-tab-panel[hidden] { display:none !important; }
      .marain-tab-panel > #dictionary, .marain-tab-panel > #phrase-translator { margin-top:0; }
    `;
    document.head.append(style);
    select(0, false);
    root.prepend(list, ...panels);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
