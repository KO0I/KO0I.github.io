/*
 * Orbitals & habitats reference tab.
 * Curated reference entries are separate from origin clues. No model guesses
 * about source name types; data is read from the site JSON at runtime.
 */
(function () {
  'use strict';

  function init() {
    const root = document.getElementById('culture-orbitals');
    if (!root) return;

    const lookup = id => root.querySelector('#' + id);
    const search = lookup('culture-orbitals-search');
    const filter = lookup('culture-orbital-status-filter');
    const known = Array.from(root.querySelectorAll('#culture-orbital-confirmed li'));
    const resultStatus = lookup('culture-orbital-search-count');
    const originCount = lookup('culture-orbital-origin-count');
    const tbody = lookup('culture-orbital-origin-rows');
    let originClues = null;

    const labels = {
      identified: 'Identified in supplied reference',
      partial: 'Partly identified',
      unresolved: 'Type not established',
      speculative: 'User hypothesis',
      variant: 'Alternate name order',
      exception: 'Not Orbital evidence'
    };

    function create(tag, value, className) {
      const element = document.createElement(tag);
      element.textContent = value == null ? '' : String(value);
      if (className) element.className = className;
      return element;
    }

    function addComponent(tr, name, type) {
      const td = document.createElement('td');
      if (name) td.append(create('strong', name));
      if (type) td.append(create('span', type, 'culture-origin-type'));
      if (!name && !type) td.textContent = 'Not identified';
      tr.append(td);
    }

    function displayRow(clue) {
      const tr = document.createElement('tr');
      const source = document.createElement('td');
      source.append(create('strong', clue.origin_form || 'No origin form supplied'));
      if (clue.resident) source.append(create('span', clue.resident, 'culture-origin-person'));
      if (clue.example) source.append(create('span', 'Source note: ' + clue.example, 'culture-origin-source'));
      if (clue.reference) source.append(create('span', clue.reference, 'culture-origin-reference'));
      if (clue.author_full_name) source.append(create('span',
        'Author’s full example: ' + clue.author_full_name, 'culture-origin-source'));
      tr.append(source);

      addComponent(tr, clue.first, clue.first_type);
      addComponent(tr, clue.second, clue.second_type);

      const classification = document.createElement('td');
      classification.append(create('strong', labels[clue.category] || 'Unclassified'));
      if (clue.note) classification.append(create('p', clue.note, 'culture-origin-note'));
      tr.append(classification);
      return tr;
    }

    function haystack(clue) {
      return [clue.origin_form, clue.first, clue.second, clue.resident, clue.example,
        clue.author_full_name, clue.reference, clue.note, clue.first_type,
        clue.second_type, clue.category].filter(Boolean).join(' ').toLocaleLowerCase();
    }

    function render() {
      const term = search.value.trim().toLocaleLowerCase();
      let shownNames = 0;
      for (const li of known) {
        const matches = li.textContent.toLocaleLowerCase().includes(term);
        li.hidden = !matches;
        if (matches) shownNames += 1;
      }
      resultStatus.textContent = shownNames + ' of ' + known.length +
        ' source-listed Orbital/habitat entries match.';

      if (!originClues) return;
      const category = filter.value;
      const matches = originClues.filter(clue => {
        return (category === 'all' || clue.category === category) &&
          (!term || haystack(clue).includes(term));
      });
      tbody.replaceChildren(...matches.map(displayRow));
      if (!matches.length) {
        const tr = document.createElement('tr');
        const td = create('td', 'No origin clues match these filters.');
        td.colSpan = 4;
        tr.append(td);
        tbody.append(tr);
      }
      originCount.textContent = matches.length + ' of ' + originClues.length +
        ' research examples shown. Origin clues do not add names to the confirmed set.';
    }

    search.addEventListener('input', render);
    filter.addEventListener('change', render);
    render();
    fetch(root.dataset.orbitalDataUrl, {credentials: 'same-origin'})
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.origin_clues)) throw new Error('Missing origin records');
        originClues = data.origin_clues;
        render();
      })
      .catch(error => {
        const tr = document.createElement('tr');
        const td = create('td', 'Origin-clue data could not be loaded. Use the JSON link below to read the evidence.');
        td.colSpan = 4;
        tr.append(td);
        tbody.replaceChildren(tr);
        originCount.textContent = 'The source-listed habitat names above remain available.';
        console.warn('Unable to load Culture origin clues:', error);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
