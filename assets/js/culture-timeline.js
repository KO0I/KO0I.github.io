(() => {
  "use strict";

  const root = document.getElementById("culture-history");
  if (!root || root.dataset.initialized === "true") return;
  root.dataset.initialized = "true";

  const timeline = root.querySelector("#culture-timeline");
  const searchInput = root.querySelector("#culture-search");
  const eraSelect = root.querySelector("#culture-era");
  const sourceSelect = root.querySelector("#culture-source");
  const datingSelect = root.querySelector("#culture-dating");
  const resetButton = root.querySelector("#culture-reset");
  const resultsText = root.querySelector("#culture-results");
  const wallpaperLayers = root.querySelector("#culture-wallpaper-layers");
  const wallpaperEra = root.querySelector("#culture-wallpaper-era");

  let dataset = null;
  let activeEra = "";
  let scrollFrame = 0;

  const normalize = (value) =>
    String(value ?? "")
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "");

  const formatGap = (years) => {
    const rounded = Math.round(years);
    if (rounded >= 1000) return `≈ ${rounded.toLocaleString()} years`;
    return `≈ ${rounded} years`;
  };

  const eraDefinitions = () =>
    (dataset?.eras || []).map((era) =>
      typeof era === "string" ? { name: era } : era
    );

  const eraName = (era) => (typeof era === "string" ? era : era?.name || "");

  const getEra = (name) =>
    eraDefinitions().find((era) => era.name === name) || { name };

  const getSource = (id) => dataset?.sources?.[id] ?? { work: id, locator: "" };

  const uniqueSourceWorks = () => {
    const works = new Set();
    Object.values(dataset.sources || {}).forEach((source) => {
      if (source.work !== "Supplied chronology") works.add(source.work);
    });
    return [...works].sort((a, b) => a.localeCompare(b));
  };

  const fillFilters = () => {
    eraDefinitions().forEach((era) => {
      const opt = document.createElement("option");
      opt.value = era.name;
      opt.textContent = era.name;
      eraSelect.appendChild(opt);
    });

    uniqueSourceWorks().forEach((work) => {
      const opt = document.createElement("option");
      opt.value = work;
      opt.textContent = work;
      sourceSelect.appendChild(opt);
    });
  };

  const renderWallpaperLayers = () => {
    if (!wallpaperLayers) return;
    wallpaperLayers.replaceChildren();

    eraDefinitions().forEach((era, index) => {
      if (!era.wallpaper) return;

      const layer = document.createElement("div");
      layer.className = "culture-wallpaper-layer";
      layer.dataset.era = era.name;

      const image = document.createElement("img");
      image.src = era.wallpaper;
      image.alt = "";
      image.decoding = "async";
      image.loading = index < 2 ? "eager" : "lazy";
      if (era.wallpaperPosition) image.style.objectPosition = era.wallpaperPosition;

      layer.appendChild(image);
      wallpaperLayers.appendChild(layer);
    });

    const firstEra = eraDefinitions()[0]?.name;
    if (firstEra) setActiveEra(firstEra, true);
  };

  const setActiveEra = (name, force = false) => {
    if (!name || (!force && name === activeEra)) return;
    activeEra = name;

    wallpaperLayers?.querySelectorAll(".culture-wallpaper-layer").forEach((layer) => {
      layer.classList.toggle("is-active", layer.dataset.era === name);
    });

    if (wallpaperEra) wallpaperEra.textContent = name;
    root.dataset.activeEra = name;
  };

  const syncWallpaperToScroll = () => {
    scrollFrame = 0;
    const sections = [...timeline.querySelectorAll(".culture-era-section")];
    if (!sections.length) return;

    const focusY = window.innerHeight * 0.48;
    let bestSection = sections[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();

      if (rect.top <= focusY && rect.bottom >= focusY) {
        bestSection = section;
        bestDistance = 0;
        break;
      }

      const distance = focusY < rect.top ? rect.top - focusY : focusY - rect.bottom;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSection = section;
      }
    }

    setActiveEra(bestSection.dataset.era);
  };

  const scheduleWallpaperSync = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(syncWallpaperToScroll);
  };

  const eventHaystack = (event) => {
    const sourceText = (event.sources || [])
      .map((id) => {
        const source = getSource(id);
        return `${source.work} ${source.locator}`;
      })
      .join(" ");

    return normalize([
      event.date,
      event.era,
      event.title,
      event.description,
      event.basis,
      event.uncertainty,
      ...(event.tags || []),
      sourceText,
    ].join(" "));
  };

  const filteredEvents = () => {
    const q = normalize(searchInput.value.trim());
    const era = eraSelect.value;
    const sourceWork = sourceSelect.value;
    const dating = datingSelect.value;

    return dataset.events.filter((event) => {
      if (q && !eventHaystack(event).includes(q)) return false;
      if (era && event.era !== era) return false;
      if (dating && event.dating !== dating) return false;

      if (sourceWork) {
        const works = (event.sources || []).map((id) => getSource(id).work);
        if (!works.includes(sourceWork)) return false;
      }

      return true;
    });
  };

  const createEra = (name) => {
    const divider = document.createElement("div");
    divider.className = "culture-era";
    divider.setAttribute("aria-label", `${name} era`);

    const label = document.createElement("span");
    label.textContent = name;
    divider.appendChild(label);
    return divider;
  };

  const createEraSection = (name) => {
    const section = document.createElement("section");
    section.className = "culture-era-section";
    section.dataset.era = name;
    section.setAttribute("aria-label", `${name} chronology`);
    section.appendChild(createEra(name));
    return section;
  };

  const createGap = (years) => {
    const gap = document.createElement("div");
    gap.className = "culture-gap";
    gap.setAttribute("aria-label", formatGap(years));

    const label = document.createElement("span");
    label.textContent = formatGap(years);
    gap.appendChild(label);
    return gap;
  };

  const createSourceList = (event) => {
    const ul = document.createElement("ul");
    ul.className = "culture-card__source";

    if (!event.sources?.length) {
      const li = document.createElement("li");
      li.textContent = "No source entry supplied.";
      ul.appendChild(li);
      return ul;
    }

    event.sources.forEach((id) => {
      const source = getSource(id);
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = source.work;
      li.appendChild(strong);
      if (source.locator) li.append(` — ${source.locator}`);
      ul.appendChild(li);
    });
    return ul;
  };

  const createDetailsSection = (heading, content, extraClass = "") => {
    const section = document.createElement("div");
    section.className = `culture-card__section ${extraClass}`.trim();

    const h3 = document.createElement("h3");
    h3.textContent = heading;
    section.appendChild(h3);

    if (content instanceof Node) {
      section.appendChild(content);
    } else {
      const p = document.createElement("p");
      p.textContent = content;
      section.appendChild(p);
    }
    return section;
  };

  const createEvent = (event, index) => {
    const item = document.createElement("div");
    item.className = `culture-entry ${index % 2 === 0 ? "culture-entry--left" : "culture-entry--right"}`;
    item.setAttribute("role", "listitem");
    item.dataset.dating = event.dating || "explicit";
    item.dataset.importance = event.importance || "normal";
    item.id = event.id;

    const marker = document.createElement("span");
    marker.className = "culture-entry__marker";
    marker.setAttribute("aria-hidden", "true");

    const card = document.createElement("article");
    card.className = "culture-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-label", `${event.date}: ${event.title}`);

    const detailImage = event.detailImage || event.image;
    const detailImageAlt = event.detailImageAlt || event.imageAlt || "";

    if (detailImage) {
      const figure = document.createElement("div");
      figure.className = "culture-card__image";

      const img = document.createElement("img");
      img.src = detailImage;
      img.alt = detailImageAlt;
      img.loading = "lazy";
      img.decoding = "async";
      figure.appendChild(img);
      card.appendChild(figure);
    } else {
      card.classList.add("culture-card--no-image");
    }

    const body = document.createElement("div");
    body.className = "culture-card__body";

    const date = document.createElement("p");
    date.className = "culture-card__date";
    const dateText = document.createElement("span");
    dateText.textContent = event.date;
    date.appendChild(dateText);

    const dating = document.createElement("span");
    dating.className = "culture-card__approx";
    if (event.dating === "inferred") dating.textContent = "inferred";
    else if (event.dating === "local-calendar") dating.textContent = "local calendar";
    else dating.textContent = "dated";
    date.appendChild(dating);

    const title = document.createElement("h2");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.className = "culture-card__description";
    description.textContent = event.description;

    body.append(date, title, description);

    if (event.tags?.length) {
      const tags = document.createElement("div");
      tags.className = "culture-card__tags";
      event.tags.forEach((tagName) => {
        const tag = document.createElement("span");
        tag.className = "culture-card__tag";
        tag.textContent = tagName;
        tags.appendChild(tag);
      });
      body.appendChild(tags);
    }

    const expand = document.createElement("span");
    expand.className = "culture-card__expand";
    expand.textContent = "Sources & dating";
    body.appendChild(expand);
    card.appendChild(body);

    const details = document.createElement("div");
    details.className = "culture-card__details";

    if (event.basis) {
      details.appendChild(createDetailsSection("Dating basis", event.basis));
    }

    if (event.uncertainty) {
      details.appendChild(
        createDetailsSection("Chronology note", event.uncertainty, "culture-card__uncertainty")
      );
    }

    details.appendChild(createDetailsSection("Sources", createSourceList(event)));
    card.appendChild(details);

    const toggle = () => {
      const expanded = card.classList.toggle("is-expanded");
      card.setAttribute("aria-expanded", String(expanded));
    };

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (eventObject) => {
      if (eventObject.key === "Enter" || eventObject.key === " ") {
        eventObject.preventDefault();
        toggle();
      }
    });

    item.append(marker, card);
    return item;
  };

  const render = () => {
    const events = filteredEvents();
    timeline.replaceChildren();

    resultsText.textContent =
      `${events.length} event${events.length === 1 ? "" : "s"} shown · ` +
      `${dataset.events.length} in chronology`;

    if (!events.length) {
      const empty = document.createElement("div");
      empty.className = "culture-empty";
      empty.textContent = "No Culture-history events match those filters.";
      timeline.appendChild(empty);
      return;
    }

    let previous = null;
    let previousEra = null;
    let currentEraSection = null;
    let eventIndex = 0;

    events.forEach((event) => {
      if (event.era !== previousEra) {
        currentEraSection = createEraSection(event.era);
        timeline.appendChild(currentEraSection);
        previousEra = event.era;
      }

      if (previous) {
        const previousEnd = previous.endYear ?? previous.startYear;
        const gap = event.startYear - previousEnd;
        if (gap >= 250) currentEraSection.appendChild(createGap(gap));
      }

      currentEraSection.appendChild(createEvent(event, eventIndex));
      eventIndex += 1;
      previous = event;
    });

    window.requestAnimationFrame(syncWallpaperToScroll);
  };

  const reset = () => {
    searchInput.value = "";
    eraSelect.value = "";
    sourceSelect.value = "";
    datingSelect.value = "";
    render();
    searchInput.focus();
  };

  const debounce = (fn, delay = 120) => {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  const load = async () => {
    try {
      const response = await fetch(root.dataset.source, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      dataset = await response.json();

      dataset.events = [...(dataset.events || [])]
        .filter((event) => Number.isFinite(event.startYear))
        .sort((a, b) => a.startYear - b.startYear);

      fillFilters();
      renderWallpaperLayers();
      render();

      timeline.setAttribute("aria-busy", "false");
      searchInput.addEventListener("input", debounce(render));
      eraSelect.addEventListener("change", render);
      sourceSelect.addEventListener("change", render);
      datingSelect.addEventListener("change", render);
      resetButton.addEventListener("click", reset);
      window.addEventListener("scroll", scheduleWallpaperSync, { passive: true });
      window.addEventListener("resize", scheduleWallpaperSync, { passive: true });

      if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        target?.scrollIntoView({ block: "center" });
        window.requestAnimationFrame(syncWallpaperToScroll);
      }
    } catch (error) {
      console.error("Culture timeline:", error);
      timeline.setAttribute("aria-busy", "false");
      const message = document.createElement("div");
      message.className = "culture-error";
      message.textContent =
        "The Culture chronology could not be loaded. Check assets/data/culture-history.json.";
      timeline.replaceChildren(message);
      resultsText.textContent = "Chronology unavailable";
    }
  };

  load();
})();
