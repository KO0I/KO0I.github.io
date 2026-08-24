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
  const timelineChoices = root.querySelector("#culture-timeline-choices");
  const timelineSummary = root.querySelector("#culture-timeline-summary");

  let manifest = null;
  const datasets = new Map();
  let dataset = null;
  let selectedTimelineId = "";
  let activeEra = "";
  let scrollFrame = 0;
  let railFrame = 0;

  const normalize = (value) =>
    String(value ?? "")
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "");

  const escapeSelector = (value) => {
    if (window.CSS?.escape) return window.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  };

  const formatGap = (years) => {
    const rounded = Math.round(years);
    if (rounded >= 1000) return `≈ ${rounded.toLocaleString()} years`;
    return `≈ ${rounded} years`;
  };

  const formatYear = (year) => {
    if (!Number.isFinite(year)) return "undated fork";
    if (year < 0) return `c. ${Math.abs(Math.round(year)).toLocaleString()} BCE`;
    return `c. ${Math.round(year).toLocaleString()} CE`;
  };

  const timelineDefinitions = () => manifest?.timelines || [];

  const timelineDefinition = (id) =>
    timelineDefinitions().find((definition) => definition.id === id) || null;

  const trunkDefinition = () =>
    timelineDefinitions().find((definition) => definition.kind === "trunk") ||
    timelineDefinitions()[0] ||
    null;

  const activeDefinition = () => timelineDefinition(selectedTimelineId) || trunkDefinition();

  const trunkId = () => trunkDefinition()?.id || "culture";

  const timelineDataset = (id) => datasets.get(id) || { eras: [], sources: {}, events: [] };

  const eraName = (era) => (typeof era === "string" ? era : era?.name || "");

  const normalizedEras = (sourceDataset) =>
    (sourceDataset?.eras || []).map((era) =>
      typeof era === "string" ? { name: era } : { ...era }
    );

  const mergedEraDefinitions = () => {
    const order = [];
    const map = new Map();

    const addEras = (sourceDataset) => {
      normalizedEras(sourceDataset).forEach((era) => {
        if (!era.name) return;
        if (!map.has(era.name)) order.push(era.name);
        map.set(era.name, { ...(map.get(era.name) || {}), ...era });
      });
    };

    addEras(timelineDataset(trunkId()));
    if (selectedTimelineId !== trunkId()) addEras(timelineDataset(selectedTimelineId));

    return order.map((name) => map.get(name));
  };

  const mergedSources = () => ({
    ...(timelineDataset(trunkId()).sources || {}),
    ...(selectedTimelineId === trunkId()
      ? {}
      : timelineDataset(selectedTimelineId).sources || {}),
  });

  const getSource = (id) => dataset?.sources?.[id] ?? { work: id, locator: "" };

  const resolveForkYear = (definition) => {
    if (!definition || definition.kind === "trunk") return null;
    const branchDataset = timelineDataset(definition.id);
    const declared = definition.forkYear ?? branchDataset.forkYear;

    // A branch has no historical existence until its attachment point is
    // explicitly declared. Do not infer a backwards-extending branch from
    // whatever happens to be the earliest event in its file.
    return Number.isFinite(declared) ? declared : null;
  };

  const timelineIsSelectable = (definition) =>
    Boolean(definition) &&
    (definition.kind === "trunk" || Number.isFinite(resolveForkYear(definition)));

  const resolveForkLabel = (definition) => {
    if (!definition || definition.kind === "trunk") return "";
    const branchDataset = timelineDataset(definition.id);
    if (branchDataset.forkLabel) return branchDataset.forkLabel;
    const year = resolveForkYear(definition);
    return Number.isFinite(year) ? formatYear(year) : "Fork date not set";
  };

  const prepareActiveDataset = () => {
    const trunk = timelineDataset(trunkId());
    const active = timelineDataset(selectedTimelineId);
    const definition = activeDefinition();
    let events = [];

    if (!definition || definition.kind === "trunk") {
      events = (trunk.events || []).map((event) => ({
        ...event,
        _timelineId: trunkId(),
        _timelineLabel: trunkDefinition()?.label || "Culture",
        _shared: false,
      }));
    } else {
      const forkYear = resolveForkYear(definition);
      const shared = (trunk.events || [])
        .filter((event) => forkYear === null || event.startYear <= forkYear)
        .map((event) => ({
          ...event,
          _timelineId: trunkId(),
          _timelineLabel: trunkDefinition()?.label || "Culture",
          _shared: true,
        }));

      const branch = (active.events || [])
        // The fork is a hard lower bound. Branch-specific history cannot
        // leak backward onto the shared trunk.
        .filter((event) => Number.isFinite(forkYear) && event.startYear >= forkYear)
        .map((event) => ({
          ...event,
          _timelineId: selectedTimelineId,
          _timelineLabel: definition.label,
          _shared: false,
        }));

      events = [...shared, ...branch];
    }

    events = events
      .filter((event) => Number.isFinite(event.startYear))
      .sort((a, b) => a.startYear - b.startYear || String(a.id).localeCompare(String(b.id)));

    dataset = {
      ...trunk,
      ...active,
      title: active.title || trunk.title,
      eras: mergedEraDefinitions(),
      sources: mergedSources(),
      events,
    };
  };

  const eraDefinitions = () => dataset?.eras || [];

  const uniqueSourceWorks = () => {
    const works = new Set();
    Object.values(dataset.sources || {}).forEach((source) => {
      if (source.work !== "Supplied chronology") works.add(source.work);
    });
    return [...works].sort((a, b) => a.localeCompare(b));
  };

  const clearGeneratedOptions = (select) => {
    while (select.options.length > 1) select.remove(1);
  };

  const fillFilters = ({ preserve = false } = {}) => {
    const previousEra = preserve ? eraSelect.value : "";
    const previousSource = preserve ? sourceSelect.value : "";

    clearGeneratedOptions(eraSelect);
    clearGeneratedOptions(sourceSelect);

    eraDefinitions().forEach((era) => {
      const opt = document.createElement("option");
      opt.value = eraName(era);
      opt.textContent = eraName(era);
      eraSelect.appendChild(opt);
    });

    uniqueSourceWorks().forEach((work) => {
      const opt = document.createElement("option");
      opt.value = work;
      opt.textContent = work;
      sourceSelect.appendChild(opt);
    });

    if ([...eraSelect.options].some((option) => option.value === previousEra)) {
      eraSelect.value = previousEra;
    }
    if ([...sourceSelect.options].some((option) => option.value === previousSource)) {
      sourceSelect.value = previousSource;
    }
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
      if (Number.isFinite(era.wallpaperHue)) {
        image.style.setProperty("--culture-wallpaper-hue", `${era.wallpaperHue}deg`);
      }

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
      event._timelineLabel,
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

    const era = eraDefinitions().find((candidate) => eraName(candidate) === name);
    if (era?.wallpaperSourceUrl) {
      const source = document.createElement("a");
      source.className = "culture-era__image-source";
      source.href = era.wallpaperSourceUrl;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = era.wallpaperSource || "APOD wallpaper";
      if (era.wallpaperCredit) source.title = era.wallpaperCredit;
      divider.appendChild(source);
    }

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

  const eventDomId = (event) => {
    if (event._timelineId === trunkId()) return event.id;
    return `${event._timelineId}-${event.id}`;
  };

  const createEvent = (event, index) => {
    const item = document.createElement("div");
    item.className = `culture-entry ${index % 2 === 0 ? "culture-entry--left" : "culture-entry--right"}`;
    item.setAttribute("role", "listitem");
    item.dataset.dating = event.dating || "explicit";
    item.dataset.importance = event.importance || "normal";
    item.dataset.startYear = String(event.startYear);
    item.dataset.timeline = event._timelineId || trunkId();
    item.dataset.shared = String(Boolean(event._shared));
    item.id = eventDomId(event);

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
      if (Number.isFinite(event.detailImageHue)) {
        img.style.setProperty("--culture-image-hue", `${event.detailImageHue}deg`);
      }
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

    if (selectedTimelineId !== trunkId()) {
      const lineage = document.createElement("span");
      lineage.className = `culture-card__lineage ${event._shared ? "is-shared" : "is-branch"}`;
      lineage.textContent = event._shared ? "shared trunk" : event._timelineLabel;
      date.appendChild(lineage);
    }

    const title = document.createElement("h2");
    title.textContent = event.title;

    body.append(date, title);

    if (event.description) {
      const description = document.createElement("p");
      description.className = "culture-card__description";
      description.textContent = event.description;
      body.appendChild(description);
    }

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

    if (event.detailImageCredit || event.detailImageSourceUrl) {
      const imageSource = document.createElement("p");
      if (event.detailImageSourceUrl) {
        const link = document.createElement("a");
        link.href = event.detailImageSourceUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = event.detailImageSource || "Image source";
        imageSource.appendChild(link);
      } else {
        imageSource.append(event.detailImageSource || "Image source");
      }
      if (event.detailImageCredit) imageSource.append(` — ${event.detailImageCredit}`);
      if (Number.isFinite(event.detailImageHue) && event.detailImageHue !== 0) {
        imageSource.append(` · presentation hue-shifted ${event.detailImageHue}°`);
      }
      details.appendChild(createDetailsSection("Image", imageSource));
    }

    details.appendChild(createDetailsSection("Sources", createSourceList(event)));
    card.appendChild(details);

    const toggle = () => {
      const expanded = card.classList.toggle("is-expanded");
      card.setAttribute("aria-expanded", String(expanded));
      scheduleRailPosition();
      window.setTimeout(scheduleRailPosition, 380);
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

  const viewportFocusYear = () => {
    const entries = [...timeline.querySelectorAll(".culture-entry")];
    if (!entries.length) return null;

    const focusY = window.innerHeight * 0.5;
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    entries.forEach((entry) => {
      const rect = entry.getBoundingClientRect();
      const center = rect.top + Math.min(rect.height, 180) * 0.5;
      const distance = Math.abs(center - focusY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = Number(entry.dataset.startYear);
      }
    });

    return Number.isFinite(best) ? best : null;
  };

  const scrollToNearestYear = (year) => {
    if (!Number.isFinite(year)) return;
    const entries = [...timeline.querySelectorAll(".culture-entry")];
    if (!entries.length) return;

    let best = entries[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    entries.forEach((entry) => {
      const entryYear = Number(entry.dataset.startYear);
      const distance = Math.abs(entryYear - year);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = entry;
      }
    });

    best.scrollIntoView({ block: "center", behavior: "auto" });
  };

  const timelineYForYear = (year) => {
    if (!Number.isFinite(year)) return null;
    const entries = [...timeline.querySelectorAll(".culture-entry")]
      .map((entry) => ({ entry, year: Number(entry.dataset.startYear) }))
      .filter((record) => Number.isFinite(record.year))
      .sort((a, b) => a.year - b.year);

    if (!entries.length) return null;

    const timelineRect = timeline.getBoundingClientRect();
    const yOf = (record) => {
      const rect = record.entry.getBoundingClientRect();
      return rect.top - timelineRect.top + 30;
    };

    if (year <= entries[0].year) return yOf(entries[0]);
    if (year >= entries[entries.length - 1].year) return yOf(entries[entries.length - 1]);

    for (let index = 1; index < entries.length; index += 1) {
      const before = entries[index - 1];
      const after = entries[index];
      if (year <= after.year) {
        const span = after.year - before.year;
        const ratio = span > 0 ? Math.max(0, Math.min(1, (year - before.year) / span)) : 0;
        return yOf(before) + (yOf(after) - yOf(before)) * ratio;
      }
    }

    return yOf(entries[entries.length - 1]);
  };

  const inactiveRailDefinitions = () => {
    const active = activeDefinition();
    if (!active) return [];

    const all = timelineDefinitions().filter((definition) => definition.id !== selectedTimelineId);
    if (active.kind === "trunk") return all.filter((definition) => definition.parent === active.id);

    const parent = all.filter((definition) => definition.id === active.parent);
    const siblings = all.filter(
      (definition) => definition.kind === "branch" &&
        definition.parent === active.parent &&
        definition.id !== active.id
    );
    return [...parent, ...siblings];
  };

  const positionSecondaryRails = () => {
    railFrame = 0;
    timeline.querySelectorAll(".culture-secondary-rail").forEach((rail) => rail.remove());

    const active = activeDefinition();
    if (!active) return;

    const rails = inactiveRailDefinitions();
    if (!rails.length) return;

    let rightIndex = 0;

    rails.forEach((definition) => {
      let forkYear = null;
      let side = "right";
      let offset = 46;

      if (active.kind === "branch" && definition.id === active.parent) {
        forkYear = resolveForkYear(active);
        side = "left";
        offset = -18;
      } else {
        forkYear = resolveForkYear(definition);
        rightIndex += 1;
        offset = 6 + rightIndex * 12;
      }

      if (!Number.isFinite(forkYear)) return;

      const top = timelineYForYear(forkYear);
      if (!Number.isFinite(top)) return;

      const rail = document.createElement("div");
      rail.className = `culture-secondary-rail culture-secondary-rail--${side}`;
      rail.dataset.timeline = definition.id;
      rail.style.top = `${Math.max(48, top)}px`;
      rail.style.left = `calc(50% + ${offset}px)`;
      rail.style.setProperty("--culture-rail-connector", `${Math.abs(offset)}px`);

      const connector = document.createElement("span");
      connector.className = "culture-secondary-rail__connector";

      const origin = document.createElement("span");
      origin.className = "culture-secondary-rail__origin";

      const fork = document.createElement("span");
      fork.className = "culture-secondary-rail__fork";

      const label = document.createElement("span");
      label.className = "culture-secondary-rail__label";
      label.textContent = definition.label;

      rail.append(connector, origin, fork, label);
      timeline.appendChild(rail);
    });
  };

  const scheduleRailPosition = () => {
    if (railFrame) return;
    railFrame = window.requestAnimationFrame(positionSecondaryRails);
  };

  const renderTimelineSwitcher = () => {
    timelineChoices.replaceChildren();
    const active = activeDefinition();

    timelineDefinitions().forEach((definition) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "culture-branch-choice";
      const selectable = timelineIsSelectable(definition);
      button.dataset.timeline = definition.id;
      button.dataset.kind = definition.kind || "branch";
      button.setAttribute("aria-pressed", String(definition.id === selectedTimelineId));
      button.classList.toggle("is-active", definition.id === selectedTimelineId);
      button.disabled = !selectable;
      if (!selectable) button.title = "Set forkYear before this branch can be selected";

      const kind = document.createElement("span");
      kind.className = "culture-branch-choice__kind";
      kind.textContent = definition.kind === "trunk"
        ? "TRUNK"
        : selectable ? "BRANCH" : "SET FORK";

      const label = document.createElement("strong");
      label.textContent = definition.label;

      button.append(kind, label);
      button.addEventListener("click", () => switchTimeline(definition.id));
      timelineChoices.appendChild(button);
    });

    if (!active) {
      timelineSummary.textContent = "";
      return;
    }

    if (active.kind === "trunk") {
      const branches = timelineDefinitions().filter((definition) => definition.parent === active.id).length;
      timelineSummary.textContent = `${active.description || "Canonical trunk."} ${branches ? `${branches} branch${branches === 1 ? "" : "es"} attached.` : ""}`.trim();
    } else {
      const parent = timelineDefinition(active.parent);
      const branchData = timelineDataset(active.id);
      const forkYear = resolveForkYear(active);
      const branchCount = branchData.events?.length || 0;
      const forkText = Number.isFinite(forkYear)
        ? `Begins at ${resolveForkLabel(active)}, branching from ${parent?.label || "the trunk"}; it has no branch rail before that point.`
        : `Fork date not set; this branch is unavailable until forkYear is defined.`;
      const eventText = branchCount
        ? `${branchCount} branch-specific event${branchCount === 1 ? "" : "s"}.`
        : "No branch-specific events have been added yet.";
      timelineSummary.textContent = `${forkText} ${eventText}`;
    }
  };

  const updateTimelineURL = () => {
    const url = new URL(window.location.href);
    if (selectedTimelineId === (manifest.defaultTimeline || trunkId())) {
      url.searchParams.delete("timeline");
    } else {
      url.searchParams.set("timeline", selectedTimelineId);
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const render = ({ preserveYear = null } = {}) => {
    const events = filteredEvents();
    timeline.replaceChildren();
    timeline.dataset.focusTimeline = selectedTimelineId;
    root.dataset.focusTimeline = selectedTimelineId;

    const active = activeDefinition();
    const sharedCount = events.filter((event) => event._shared).length;
    const branchCount = events.filter((event) => !event._shared && event._timelineId !== trunkId()).length;

    if (active?.kind === "branch") {
      resultsText.textContent =
        `${events.length} event${events.length === 1 ? "" : "s"} shown · ` +
        `${sharedCount} shared trunk · ${branchCount} ${active.label} branch`;
    } else {
      resultsText.textContent =
        `${events.length} event${events.length === 1 ? "" : "s"} shown · ` +
        `${dataset.events.length} in ${active?.label || "chronology"} trunk`;
    }

    if (!events.length) {
      const empty = document.createElement("div");
      empty.className = "culture-empty";
      empty.textContent = "No events match those filters on the selected timeline.";
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

    window.requestAnimationFrame(() => {
      syncWallpaperToScroll();
      positionSecondaryRails();
      if (Number.isFinite(preserveYear)) scrollToNearestYear(preserveYear);
    });
  };

  const switchTimeline = (id) => {
    const target = timelineDefinition(id);
    if (id === selectedTimelineId || !timelineIsSelectable(target)) return;

    const focusYear = viewportFocusYear();
    const forkYear = resolveForkYear(target);
    // If the reader selects a branch while looking at a time before it exists,
    // move to the attachment point instead of implying a pre-fork branch.
    const preserveYear = target.kind === "branch" && Number.isFinite(forkYear)
      ? Math.max(focusYear, forkYear)
      : focusYear;

    selectedTimelineId = id;
    activeEra = "";
    prepareActiveDataset();
    fillFilters({ preserve: true });
    renderTimelineSwitcher();
    renderWallpaperLayers();
    render({ preserveYear });
    updateTimelineURL();
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

  const loadJson = async (source) => {
    const response = await fetch(source, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
    return response.json();
  };

  const normalizeSource = (source) => {
    if (!source) return source;
    if (/^(?:https?:)?\/\//.test(source) || source.startsWith("/")) return source;
    return `/${source.replace(/^\.\//, "")}`;
  };

  const loadManifest = async () => {
    if (root.dataset.manifest) return loadJson(root.dataset.manifest);

    return {
      defaultTimeline: "culture",
      timelines: [
        {
          id: "culture",
          label: "Culture",
          kind: "trunk",
          source: root.dataset.source,
        },
      ],
    };
  };

  const load = async () => {
    try {
      manifest = await loadManifest();
      if (!manifest.timelines?.length) throw new Error("Timeline manifest has no timelines.");

      await Promise.all(
        manifest.timelines.map(async (definition) => {
          const source = normalizeSource(definition.source);
          const loaded = await loadJson(source);
          loaded.events = [...(loaded.events || [])]
            .filter((event) => Number.isFinite(event.startYear))
            .sort((a, b) => a.startYear - b.startYear);
          datasets.set(definition.id, loaded);
        })
      );

      const requested = new URL(window.location.href).searchParams.get("timeline");
      const requestedDefinition = timelineDefinition(requested);
      selectedTimelineId = timelineIsSelectable(requestedDefinition)
        ? requested
        : manifest.defaultTimeline || trunkId();

      prepareActiveDataset();
      fillFilters();
      renderTimelineSwitcher();
      renderWallpaperLayers();
      const initialFork = resolveForkYear(activeDefinition());
      render({
        preserveYear: selectedTimelineId !== trunkId() && Number.isFinite(initialFork) && !window.location.hash
          ? initialFork
          : null,
      });

      timeline.setAttribute("aria-busy", "false");
      searchInput.addEventListener("input", debounce(render));
      eraSelect.addEventListener("change", render);
      sourceSelect.addEventListener("change", render);
      datingSelect.addEventListener("change", render);
      resetButton.addEventListener("click", reset);
      window.addEventListener("scroll", scheduleWallpaperSync, { passive: true });
      window.addEventListener("resize", () => {
        scheduleWallpaperSync();
        scheduleRailPosition();
      }, { passive: true });

      if (window.location.hash) {
        const rawId = window.location.hash.slice(1);
        let target = document.getElementById(rawId);

        if (!target && selectedTimelineId !== trunkId()) {
          target = document.getElementById(`${selectedTimelineId}-${rawId}`);
        }

        if (target) {
          target.scrollIntoView({ block: "center" });
          window.requestAnimationFrame(() => {
            syncWallpaperToScroll();
            positionSecondaryRails();
          });
        }
      }
    } catch (error) {
      console.error("Culture timeline:", error);
      timeline.setAttribute("aria-busy", "false");
      const message = document.createElement("div");
      message.className = "culture-error";
      message.textContent =
        "The timeline data could not be loaded. Check assets/data/culture-timelines.json and its timeline sources.";
      timeline.replaceChildren(message);
      resultsText.textContent = "Chronology unavailable";
    }
  };

  load();
})();
