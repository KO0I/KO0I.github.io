(() => {
  'use strict';
  const root = document.querySelector('[data-roadmap]');
  if (!root) return;
  const board = root.dataset.board;
  if (!/^[a-zA-Z0-9]{8}$/.test(board)) return;
  const content = root.querySelector('[data-roadmap-lists]');
  const status = root.querySelector('[data-roadmap-status]');
  const refresh = root.querySelector('[data-roadmap-refresh]');
  const endpoint = `https://trello.com/b/${board}.json`;
  let busy = false;
  const refreshInterval = 60 * 1000;
  let lastAttempt = 0;
  let lastSuccess = null;
  let lastSnapshot = '';
  const node = (tag, text, cls) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (cls) element.className = cls;
    return element;
  };
  const position = (a, b) => Number(a.pos) - Number(b.pos);
  function normalize(data) {
    if (data.shortLink !== board || data.prefs?.permissionLevel !== 'public' ||
        !Array.isArray(data.lists) || !Array.isArray(data.cards)) {
      throw new Error('Unexpected board data');
    }
    const lists = data.lists.filter(list => !list.closed).sort(position);
    return lists.map(list => {
      if (typeof list.name !== 'string') throw new Error('Invalid list');
      return { name: list.name, cards: data.cards
        .filter(card => !card.closed && card.idList === list.id).sort(position)
        .map(card => {
          if (typeof card.name !== 'string' || !/^[a-zA-Z0-9]{8}$/.test(card.shortLink)) {
            throw new Error('Invalid card');
          }
          return {
            name: card.name, url: `https://trello.com/c/${card.shortLink}`,
            description: typeof card.desc === 'string' ? card.desc : '',
            complete: card.dueComplete === true,
            due: card.due,
            labels: (card.labels || []).map(label => label.name || label.color).filter(Boolean),
            checklistTotal: card.badges?.checkItems || 0,
            checklistDone: card.badges?.checkItemsChecked || 0
          };
        }) };
    });
  }
  function render(lists) {
    const fragment = document.createDocumentFragment();
    lists.forEach(list => {
      const section = node('section');
      section.append(node('h2', `${list.name} (${list.cards.length})`));
      const cards = node('ul', undefined, 'roadmap__cards');
      list.cards.forEach(card => {
        const item = node('li', undefined, 'roadmap__card');
        const title = node('h3');
        const link = node('a', card.name);
        link.href = card.url;
        title.append(link);
        item.append(title);
        const meta = node('div', undefined, 'roadmap__meta');
        meta.append(node('span', card.complete ? 'Complete' : 'Open', 'roadmap__tag'));
        card.labels.forEach(label => meta.append(node('span', label, 'roadmap__tag')));
        if (card.checklistTotal) meta.append(node('span', `Checklist ${card.checklistDone}/${card.checklistTotal}`, 'roadmap__tag'));
        if (card.due && Number.isFinite(Date.parse(card.due))) {
          const due = node('time', `Due ${new Date(card.due).toLocaleDateString()}`, 'roadmap__tag');
          due.dateTime = card.due;
          meta.append(due);
        }
        item.append(meta);
        if (card.description) {
          const details = node('details');
          details.append(node('summary', 'Details'), node('div', card.description, 'roadmap__description'));
          item.append(details);
        }
        cards.append(item);
      });
      section.append(list.cards.length ? cards : node('p', 'No open cards in this list.'));
      fragment.append(section);
    });
    if (!lists.length) fragment.append(node('p', 'No open lists on this board.'));
    content.replaceChildren(fragment);
  }
  async function update() {
    if (busy) return;
    busy = true;
    lastAttempt = Date.now();
    refresh.disabled = true;
    status.textContent = 'Checking Trello…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        mode: 'cors', credentials: 'omit', cache: 'no-store', signal: controller.signal
      });
      if (!response.ok) throw new Error('Trello unavailable');
      const lists = normalize(await response.json());
      const snapshot = JSON.stringify(lists);
      // Preserve expanded descriptions and keyboard focus if nothing changed.
      if (snapshot !== lastSnapshot) { render(lists); lastSnapshot = snapshot; }
      lastSuccess = new Date();
      status.textContent = `Updated ${lastSuccess.toLocaleString()}. Refreshes every minute.`;
    } catch (_) {
      status.textContent = lastSuccess
        ? `Trello unavailable. Showing the last update from ${lastSuccess.toLocaleTimeString()}.`
        : 'Trello unavailable. Showing the saved roadmap; use the board link for current tasks.';
    } finally {
      clearTimeout(timer);
      busy = false;
      refresh.disabled = false;
    }
  }
  refresh.hidden = false;
  refresh.addEventListener('click', update);
  const refreshIfDue = () => {
    if (!document.hidden && Date.now() - lastAttempt >= refreshInterval) update();
  };
  document.addEventListener('visibilitychange', refreshIfDue);
  setInterval(refreshIfDue, refreshInterval);
  update();
})();
