/* =========================================================
   QUOTE BUILDER (Cotizador) | Peru Nature
   Permite armar una cotización combinando tours y hoteles por
   destino (con acomodación calculada según cantidad de
   viajeros) y deja la sección de vuelos visible pero inactiva
   hasta que se carguen tarifas reales.
========================================================= */

function pnT(key, fallback) {
  const lang = window.PeruNatureI18n?.getLang?.() || "es";
  const dict = window.PeruNatureI18n?.translations?.[lang];
  return dict?.[key] || fallback;
}

const PN_ROOM_TYPES = [
  { key: "familiar_5", capacity: 5, get label() { return pnT("quote.roomFamiliar5", "Habitación familiar (5 pax)"); } },
  { key: "quadruple", capacity: 4, get label() { return pnT("quote.roomQuadruple", "Habitación cuádruple"); } },
  { key: "triple", capacity: 3, get label() { return pnT("quote.roomTriple", "Habitación triple"); } },
  { key: "matri_adicional", capacity: 3, get label() { return pnT("quote.roomMatriAdicional", "Matrimonial + cama adicional"); } },
  { key: "matrimonial", capacity: 2, get label() { return pnT("quote.roomMatrimonial", "Habitación matrimonial"); } },
  { key: "double", capacity: 2, get label() { return pnT("quote.roomDouble", "Habitación doble (2 camas)"); } },
  { key: "single", capacity: 1, get label() { return pnT("quote.roomSingle", "Habitación simple"); } }
];

// Combinaciones preferidas por cantidad exacta de pasajeros, siguiendo
// el pedido original: 2 pax -> matrimonial/doble/2 simples; 3 pax ->
// triple/doble+simple/matrimonial+simple/3 simples; etc.
const PN_PREFERRED_COMBOS = {
  1: [["single"], ["matrimonial"], ["double"]],
  2: [["matrimonial"], ["double"], ["single", "single"]],
  3: [["triple"], ["matri_adicional"], ["double", "single"], ["matrimonial", "single"], ["single", "single", "single"]],
  4: [["quadruple"], ["double", "double"], ["matrimonial", "matrimonial"], ["triple", "single"], ["single", "single", "single", "single"]],
  5: [["familiar_5"], ["triple", "double"], ["triple", "matrimonial"], ["quadruple", "single"], ["double", "double", "single"]]
};

class PeruNatureQuoteBuilder {
  constructor() {
    this.tours = [];
    this.destinationGroups = [];
    this.activeTab = "tours";
    this.pendingHotel = null; // { group, hotel }
    this.selectedRoomCombo = null;

    this.state = this.loadState();

    this.cacheDom();
    this.init();
  }

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("pn_quote_state") || "null");
      if (saved && typeof saved === "object") {
        return {
          adults: Number(saved.adults) || 2,
          children: Number(saved.children) || 0,
          destination: saved.destination || "",
          tours: Array.isArray(saved.tours) ? saved.tours : [],
          hotels: saved.hotels && typeof saved.hotels === "object" ? saved.hotels : {}
        };
      }
    } catch (_error) { /* ignore corrupted state */ }

    return { adults: 2, children: 0, destination: "", tours: [], hotels: {} };
  }

  saveState() {
    localStorage.setItem("pn_quote_state", JSON.stringify(this.state));
  }

  cacheDom() {
    this.el = {
      destinationSelect: document.getElementById("quoteDestination"),
      adultsCount: document.getElementById("quoteAdultsCount"),
      childrenCount: document.getElementById("quoteChildrenCount"),
      tabs: document.querySelectorAll(".quote-tab"),
      panels: {
        tours: document.getElementById("panel-tours"),
        hotels: document.getElementById("panel-hotels"),
        flights: document.getElementById("panel-flights")
      },
      tourSearch: document.getElementById("quoteTourSearch"),
      toursGrid: document.getElementById("quoteToursGrid"),
      toursCount: document.getElementById("quoteToursCount"),
      hotelsGrid: document.getElementById("quoteHotelsGrid"),
      summaryMeta: document.getElementById("quoteSummaryMeta"),
      summaryItems: document.getElementById("quoteSummaryItems"),
      summaryTotals: document.getElementById("quoteSummaryTotals"),
      whatsappBtn: document.getElementById("quoteWhatsappBtn"),
      printBtn: document.getElementById("quotePrintBtn"),
      clearBtn: document.getElementById("quoteClearBtn"),
      modal: document.getElementById("quoteHotelModal"),
      modalTitle: document.getElementById("quoteHotelModalTitle"),
      modalSubtitle: document.getElementById("quoteHotelModalSubtitle"),
      nightsInput: document.getElementById("quoteHotelNights"),
      roomOptions: document.getElementById("quoteRoomOptions"),
      confirmRoomBtn: document.getElementById("quoteConfirmRoomBtn")
    };
  }

  async init() {
    await Promise.all([this.loadTours(), this.loadHotels()]);
    this.populateDestinationSelect();
    this.bindEvents();
    this.renderAll();
  }

  /* ---------------- DATA LOADING ---------------- */

  async fetchJson(path) {
    return window.PeruNatureData.fetchLocalizedJson(path);
  }

  async loadTours() {
    const sources = ["./assets/data/tours.json", "./assets/data/tours-peru-catalog.json"];
    const results = await Promise.allSettled(sources.map((path) => this.fetchJson(path)));
    const bySlug = new Map();

    results.forEach((result) => {
      if (result.status !== "fulfilled" || !result.value) return;
      const items = Array.isArray(result.value.tours) ? result.value.tours : [];
      items.forEach((item) => {
        const kind = String(item.productKind || item.kind || "tour").toLowerCase();
        if (kind === "documentary") return; // salidas documentales tienen su propio flujo
        if (!item.slug) return;
        if (!bySlug.has(item.slug)) bySlug.set(item.slug, this.normalizeTour(item));
      });
    });

    this.tours = Array.from(bySlug.values());
  }

  normalizeTour(item) {
    const pricing = item.pricing || {};
    const amount = Number(pricing.basePrice || pricing.from || pricing.amount || pricing.total || pricing.price || 0);
    const image = this.getTourImage(item);

    return {
      slug: item.slug,
      title: item.title || item.name || "Experiencia Peru Nature",
      productKind: String(item.productKind || item.kind || "tour").toLowerCase(),
      destination: this.slugify(item.destination || ""),
      department: this.slugify(item.department || ""),
      searchDestinations: Array.isArray(item.search?.destinations) ? item.search.destinations.map((d) => this.slugify(d)) : [],
      durationLabel: item.duration?.label || "",
      pricePerPerson: amount,
      currency: pricing.currency || "USD",
      image
    };
  }

  getTourImage(item) {
    if (typeof item.image === "string") return item.image;
    const images = item.images;
    if (Array.isArray(images) && images[0]) return typeof images[0] === "string" ? images[0] : (images[0].src || images[0].url || "");
    if (images && typeof images === "object") {
      if (typeof images.cover === "string") return images.cover;
      if (Array.isArray(images.gallery) && images.gallery[0]) return images.gallery[0];
    }
    return "./assets/img/tour-placeholder.jpg";
  }

  async loadHotels() {
    const data = await this.fetchJson("./assets/data/package-hotels.json");
    const destinations = data?.destinations || {};
    this.destinationGroups = this.buildDestinationGroups(destinations);
  }

  // El dataset de hoteles repite las mismas 39 entradas de destino con
  // varias claves para el mismo lugar (ej. "huaraz", "huaraz-ancash" y
  // "huascaran" son la misma zona con los mismos 3 hoteles). Probamos
  // primero fusionar detectando nombres de hotel en común, pero esa
  // heurística resultó incorrecta: el dataset también reutiliza los
  // mismos 3 nombres de hotel "genéricos" en destinos amazónicos que NO
  // son el mismo lugar (ej. Manu, Tambopata y Bahuaja-Sonene comparten
  // "Libélula Hotel" aunque son reservas distintas). Por eso usamos una
  // lista explícita y verificada a mano solo para los alias confirmados;
  // cualquier otra clave queda como su propio destino, sin fusionar.
  static DESTINATION_ALIASES = [
    ["arequipa", "arequipa-colca"],
    ["puno", "puno-titicaca"],
    ["huaraz", "huaraz-ancash", "huascaran"],
    ["paracas", "paracas-ica"],
    ["iquitos", "iquitos-loreto"],
    ["tarapoto", "tarapoto-san-martin"],
    ["tambopata", "tambopata-madre-de-dios"]
  ];

  buildDestinationGroups(destinations) {
    const keyToAliasGroup = new Map();
    PeruNatureQuoteBuilder.DESTINATION_ALIASES.forEach((keys) => {
      keys.forEach((key) => keyToAliasGroup.set(key, keys));
    });

    const groups = [];
    const handled = new Set();

    Object.keys(destinations).forEach((key) => {
      if (handled.has(key)) return;
      const aliasKeys = (keyToAliasGroup.get(key) || [key]).filter((k) => destinations[k]);
      aliasKeys.forEach((k) => handled.add(k));

      const hotelNames = new Set();
      const hotels = [];
      let label = "";
      let region = "";

      aliasKeys.forEach((k) => {
        const data = destinations[k];
        if ((data.label || "").length > label.length) label = data.label;
        region = region || data.region || "";
        (data.hotels || []).forEach((hotel) => {
          if (!hotelNames.has(hotel.name)) {
            hotelNames.add(hotel.name);
            hotels.push(hotel);
          }
        });
      });

      groups.push({
        id: aliasKeys.slice().sort((a, b) => b.length - a.length)[0],
        keys: aliasKeys,
        tokens: new Set(aliasKeys.flatMap((k) => k.split("-"))),
        label: label || key,
        hotels,
        region
      });
    });

    return groups.sort((a, b) => a.label.localeCompare(b.label, "es"));
  }

  populateDestinationSelect() {
    if (!this.el.destinationSelect) return;
    const options = this.destinationGroups
      .map((group) => `<option value="${this.escapeHtml(group.id)}">${this.escapeHtml(group.label)}</option>`)
      .join("");
    this.el.destinationSelect.innerHTML = `<option value="">${pnT("quote.allDestinations", "Todos los destinos")}</option>${options}`;
    this.el.destinationSelect.value = this.state.destination || "";
  }

  /* ---------------- MATCHING HELPERS ---------------- */

  slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  getGroupById(id) {
    return this.destinationGroups.find((g) => g.id === id) || null;
  }

  tourMatchesGroup(tour, group) {
    if (!group) return true;
    const tourTokens = new Set([
      ...tour.destination.split("-"),
      ...tour.department.split("-"),
      ...tour.searchDestinations.flatMap((d) => d.split("-"))
    ].filter(Boolean));
    for (const token of tourTokens) {
      if (group.tokens.has(token)) return true;
    }
    return false;
  }

  /* ---------------- EVENTS ---------------- */

  bindEvents() {
    this.el.destinationSelect?.addEventListener("change", () => {
      this.state.destination = this.el.destinationSelect.value;
      this.saveState();
      this.renderTours();
      this.renderHotels();
    });

    document.querySelectorAll(".qty-control").forEach((control) => {
      const type = control.dataset.qty;
      control.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const delta = button.dataset.action === "plus" ? 1 : -1;
          const min = type === "adults" ? 1 : 0;
          this.state[type] = Math.max(min, Math.min(20, (this.state[type] || 0) + delta));
          this.saveState();
          this.renderBasics();
          this.renderSummary();
        });
      });
    });

    this.el.tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.setActiveTab(tab.dataset.tab));
    });

    this.el.tourSearch?.addEventListener("input", () => this.renderTours());

    this.el.whatsappBtn?.addEventListener("click", () => this.sendWhatsApp());
    this.el.printBtn?.addEventListener("click", () => window.print());
    this.el.clearBtn?.addEventListener("click", () => this.clearQuote());

    document.querySelectorAll("[data-close-quote-modal]").forEach((btn) => {
      btn.addEventListener("click", () => this.closeHotelModal());
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.closeHotelModal();
    });

    this.el.nightsInput?.addEventListener("input", () => this.renderRoomOptions());
    this.el.confirmRoomBtn?.addEventListener("click", () => this.confirmRoomSelection());
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    this.el.tabs.forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    Object.entries(this.el.panels).forEach(([key, panel]) => {
      if (panel) panel.hidden = key !== tab;
    });
  }

  /* ---------------- RENDER: BASICS ---------------- */

  renderAll() {
    this.renderBasics();
    this.renderTours();
    this.renderHotels();
    this.renderSummary();
  }

  renderBasics() {
    if (this.el.adultsCount) this.el.adultsCount.textContent = this.state.adults;
    if (this.el.childrenCount) this.el.childrenCount.textContent = this.state.children;
  }

  getPaxCount() {
    return Math.max(1, Number(this.state.adults || 0) + Number(this.state.children || 0));
  }

  /* ---------------- RENDER: TOURS ---------------- */

  renderTours() {
    if (!this.el.toursGrid) return;
    const group = this.getGroupById(this.state.destination);
    const query = this.slugify(this.el.tourSearch?.value || "").replace(/-/g, " ");

    const filtered = this.tours.filter((tour) => {
      const matchesDestination = !group || this.tourMatchesGroup(tour, group);
      const matchesQuery = !query || tour.title.toLowerCase().includes(query);
      return matchesDestination && matchesQuery;
    });

    if (this.el.toursCount) {
      this.el.toursCount.textContent = `${filtered.length} experiencia${filtered.length === 1 ? "" : "s"}`;
    }

    if (!filtered.length) {
      this.el.toursGrid.innerHTML = `
        <div class="quote-empty-state">
          <i class="fa-solid fa-magnifying-glass" style="font-size:26px;color:#9fb3a6;margin-bottom:10px;"></i>
          <p>No encontramos tours para este destino o búsqueda. Prueba con otro filtro.</p>
        </div>
      `;
      return;
    }

    this.el.toursGrid.innerHTML = filtered.map((tour) => this.tourCardTemplate(tour)).join("");

    this.el.toursGrid.querySelectorAll("[data-add-tour]").forEach((button) => {
      button.addEventListener("click", () => this.toggleTour(button.dataset.addTour));
    });
  }

  tourCardTemplate(tour) {
    const isAdded = this.state.tours.some((t) => t.slug === tour.slug);
    const kindLabel = tour.productKind === "package" ? pnT("quote.kindPackage", "Paquete") : pnT("quote.kindTour", "Tour");

    return `
      <article class="quote-tour-card">
        <div class="quote-tour-card__image">
          <img src="${this.escapeHtml(tour.image)}" alt="${this.escapeHtml(tour.title)}" loading="lazy" onerror="this.src='./assets/img/tour-placeholder.jpg'">
          <span class="quote-tour-card__badge">${this.escapeHtml(kindLabel)}</span>
        </div>
        <div class="quote-tour-card__body">
          <h3>${this.escapeHtml(tour.title)}</h3>
          <div class="quote-tour-card__meta">
            ${tour.durationLabel ? `<span><i class="fa-regular fa-clock"></i> ${this.escapeHtml(tour.durationLabel)}</span>` : ""}
          </div>
          <div class="quote-tour-card__price">
            ${tour.pricePerPerson ? `${this.currencySymbol(tour.currency)}${tour.pricePerPerson} <small>${pnT("quote.perPerson", "por persona")}</small>` : `<small>${pnT("quote.priceOnRequest", "Consultar precio")}</small>`}
          </div>
          <button type="button" class="quote-add-btn ${isAdded ? "is-added" : ""}" data-add-tour="${this.escapeHtml(tour.slug)}">
            <i class="fa-solid ${isAdded ? "fa-check" : "fa-plus"}"></i> ${isAdded ? pnT("quote.added", "Agregado") : pnT("quote.add", "Agregar")}
          </button>
        </div>
      </article>
    `;
  }

  toggleTour(slug) {
    const exists = this.state.tours.some((t) => t.slug === slug);
    if (exists) {
      this.state.tours = this.state.tours.filter((t) => t.slug !== slug);
    } else {
      const tour = this.tours.find((t) => t.slug === slug);
      if (tour) this.state.tours.push(tour);
    }
    this.saveState();
    this.renderTours();
    this.renderSummary();
  }

  /* ---------------- RENDER: HOTELS ---------------- */

  renderHotels() {
    if (!this.el.hotelsGrid) return;
    const group = this.getGroupById(this.state.destination);

    if (!group) {
      this.el.hotelsGrid.innerHTML = `
        <div class="quote-empty-state">
          <i class="fa-solid fa-hotel" style="font-size:26px;color:#9fb3a6;margin-bottom:10px;"></i>
          <p>${pnT("quote.chooseDestinationForHotels", "Elige un destino específico arriba para ver los hoteles disponibles.")}</p>
        </div>
      `;
      return;
    }

    if (!group.hotels.length) {
      this.el.hotelsGrid.innerHTML = `<div class="quote-empty-state"><p>${pnT("quote.noHotelsYetPre", "Aún no tenemos hoteles cargados para")} ${this.escapeHtml(group.label)}. ${pnT("quote.noHotelsYetPost", "Escríbenos y te ayudamos con opciones.")}</p></div>`;
      return;
    }

    this.el.hotelsGrid.innerHTML = group.hotels.map((hotel) => this.hotelCardTemplate(hotel, group)).join("");

    this.el.hotelsGrid.querySelectorAll("[data-hotel-id]").forEach((card) => {
      const hotelId = card.dataset.hotelId;
      const hotel = group.hotels.find((h) => h.id === hotelId);
      card.querySelector("[data-choose-hotel]")?.addEventListener("click", () => this.openHotelModal(group, hotel));
    });
  }

  hotelCardTemplate(hotel, group) {
    const rates = hotel.roomRates || {};
    const cheapest = Math.min(...Object.values(rates).filter((v) => typeof v === "number"));
    const image = hotel.image || (Array.isArray(hotel.images) ? hotel.images[0] : "") || "./assets/img/tour-placeholder.jpg";
    const isSelected = this.state.hotels[group.id]?.hotelId === hotel.id;

    return `
      <article class="quote-hotel-card" data-hotel-id="${this.escapeHtml(hotel.id)}">
        <div class="quote-hotel-card__image">
          <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(hotel.name)}" loading="lazy" onerror="this.src='./assets/img/tour-placeholder.jpg'">
        </div>
        <div class="quote-hotel-card__body">
          <h3>${this.escapeHtml(hotel.name)}</h3>
          <span class="quote-hotel-card__category">${this.escapeHtml(hotel.category || "Hotel")} · ${this.escapeHtml(hotel.tier || "")}</span>
          <div class="quote-hotel-card__price">${Number.isFinite(cheapest) ? `${pnT("quote.from", "Desde")} $${cheapest.toFixed(0)} <small>${pnT("quote.perRoomNight", "por habitación / noche")}</small>` : `<small>${pnT("quote.rateOnRequest", "Consultar tarifa")}</small>`}</div>
          <button type="button" class="quote-add-btn ${isSelected ? "is-added" : ""}" data-choose-hotel>
            <i class="fa-solid ${isSelected ? "fa-check" : "fa-bed"}"></i> ${isSelected ? pnT("quote.roomChosen", "Habitación elegida") : pnT("quote.chooseRoom", "Elegir habitación")}
          </button>
        </div>
      </article>
    `;
  }

  /* ---------------- ROOM MODAL ---------------- */

  openHotelModal(group, hotel) {
    if (!hotel || !this.el.modal) return;
    this.pendingHotel = { group, hotel };
    this.selectedRoomCombo = null;

    const existing = this.state.hotels[group.id];
    this.el.nightsInput.value = existing?.nights || 3;

    this.el.modalTitle.textContent = hotel.name;
    const paxLabel = this.getPaxCount() === 1 ? pnT("quote.traveler", "viajero") : pnT("quote.travelers", "viajeros");
    this.el.modalSubtitle.textContent = `${group.label} · ${this.getPaxCount()} ${paxLabel} · ${pnT("quote.ratesPerRoomPerNight", "tarifas por habitación y por noche en USD")}`;

    this.renderRoomOptions();

    this.el.modal.hidden = false;
    this.el.modal.setAttribute("aria-hidden", "false");
  }

  closeHotelModal() {
    if (!this.el.modal) return;
    this.el.modal.hidden = true;
    this.el.modal.setAttribute("aria-hidden", "true");
    this.pendingHotel = null;
  }

  buildRoomCombinations(hotel, pax) {
    const rates = hotel.roomRates || {};
    const available = PN_ROOM_TYPES.filter((rt) => typeof rates[rt.key] === "number");
    const availableKeys = new Set(available.map((rt) => rt.key));
    const combos = [];
    const seen = new Set();

    const addCombo = (roomKeys) => {
      if (!roomKeys.every((k) => availableKeys.has(k))) return;
      const capacity = roomKeys.reduce((sum, k) => sum + PN_ROOM_TYPES.find((rt) => rt.key === k).capacity, 0);
      if (capacity < pax) return;
      const signature = roomKeys.slice().sort().join("+");
      if (seen.has(signature)) return;
      seen.add(signature);
      const price = roomKeys.reduce((sum, k) => sum + Number(rates[k] || 0), 0);
      combos.push({ rooms: roomKeys, capacity, pricePerNight: price, roomCount: roomKeys.length });
    };

    (PN_PREFERRED_COMBOS[pax] || []).forEach(addCombo);

    // Respaldo genérico (también cubre 6+ pasajeros): combina de mayor a
    // menor capacidad hasta cubrir a todo el grupo.
    let remaining = pax;
    const greedy = [];
    const byCapacityDesc = available.slice().sort((a, b) => b.capacity - a.capacity);
    let guard = 0;
    while (remaining > 0 && byCapacityDesc.length && guard < 20) {
      guard += 1;
      const room = byCapacityDesc.find((rt) => rt.capacity <= remaining) || byCapacityDesc[byCapacityDesc.length - 1];
      greedy.push(room.key);
      remaining -= room.capacity;
    }
    if (greedy.length) addCombo(greedy);

    if (availableKeys.has("single")) addCombo(Array(pax).fill("single"));

    return combos.sort((a, b) => a.roomCount - b.roomCount || a.pricePerNight - b.pricePerNight);
  }

  roomComboLabel(roomKeys) {
    const counts = new Map();
    roomKeys.forEach((key) => counts.set(key, (counts.get(key) || 0) + 1));
    return Array.from(counts.entries())
      .map(([key, count]) => {
        const type = PN_ROOM_TYPES.find((rt) => rt.key === key);
        return `${count} × ${type ? type.label : key}`;
      })
      .join(" + ");
  }

  renderRoomOptions() {
    if (!this.pendingHotel || !this.el.roomOptions) return;
    const { hotel } = this.pendingHotel;
    const pax = this.getPaxCount();
    const nights = Math.max(1, Number(this.el.nightsInput.value) || 1);
    const combos = this.buildRoomCombinations(hotel, pax);

    if (!combos.length) {
      const paxLabel = pax === 1 ? pnT("quote.traveler", "viajero") : pnT("quote.travelers", "viajeros");
      this.el.roomOptions.innerHTML = `<p style="color:#65736b;">${pnT("quote.noRoomComboPre", "Este hotel no tiene combinaciones de habitación configuradas para")} ${pax} ${paxLabel}. ${pnT("quote.noRoomComboPost", "Escríbenos y te ayudamos a encontrar una alternativa.")}</p>`;
      this.el.confirmRoomBtn.disabled = true;
      return;
    }

    if (!this.selectedRoomCombo || !combos.some((c) => c.rooms.join("+") === this.selectedRoomCombo.rooms.join("+"))) {
      this.selectedRoomCombo = combos[0];
    }

    this.el.roomOptions.innerHTML = combos.map((combo) => {
      const checked = combo.rooms.join("+") === this.selectedRoomCombo.rooms.join("+");
      const total = combo.pricePerNight * nights;
      return `
        <label class="quote-room-option">
          <input type="radio" name="quoteRoomCombo" value="${this.escapeHtml(combo.rooms.join("+"))}" ${checked ? "checked" : ""}>
          <span>
            <strong>${this.escapeHtml(this.roomComboLabel(combo.rooms))}</strong>
            <small>${pnT("quote.capacity", "Capacidad")} ${combo.capacity} · $${combo.pricePerNight.toFixed(0)}/${pnT("quote.nightAbbrev", "noche")}</small>
          </span>
          <em>$${total.toFixed(0)}</em>
        </label>
      `;
    }).join("");

    this.el.roomOptions.querySelectorAll("input[name='quoteRoomCombo']").forEach((input) => {
      input.addEventListener("change", () => {
        this.selectedRoomCombo = combos.find((c) => c.rooms.join("+") === input.value) || combos[0];
        this.renderRoomOptions();
      });
    });

    this.el.confirmRoomBtn.disabled = false;
  }

  confirmRoomSelection() {
    if (!this.pendingHotel || !this.selectedRoomCombo) return;
    const { group, hotel } = this.pendingHotel;
    const nights = Math.max(1, Number(this.el.nightsInput.value) || 1);
    const combo = this.selectedRoomCombo;

    this.state.hotels[group.id] = {
      destinationLabel: group.label,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.image || "",
      rooms: combo.rooms,
      roomLabel: this.roomComboLabel(combo.rooms),
      nights,
      pricePerNight: combo.pricePerNight,
      totalPrice: combo.pricePerNight * nights,
      currency: "USD"
    };

    this.saveState();
    this.closeHotelModal();
    this.renderHotels();
    this.renderSummary();
  }

  removeHotel(groupId) {
    delete this.state.hotels[groupId];
    this.saveState();
    this.renderHotels();
    this.renderSummary();
  }

  /* ---------------- SUMMARY ---------------- */

  renderSummary() {
    const pax = this.getPaxCount();
    if (this.el.summaryMeta) {
      const adultsLabel = this.state.adults === 1 ? pnT("quote.adult", "adulto") : pnT("quote.adultsPlural", "adultos");
      const parts = [`${this.state.adults} ${adultsLabel}`];
      if (this.state.children) {
        const childrenLabel = this.state.children === 1 ? pnT("quote.child", "niño") : pnT("quote.childrenPlural", "niños");
        parts.push(`${this.state.children} ${childrenLabel}`);
      }
      this.el.summaryMeta.textContent = parts.join(" · ");
    }

    const tourItems = this.state.tours.map((tour) => `
      <div class="quote-summary-item">
        <strong>${this.escapeHtml(tour.title)}</strong>
        <span class="quote-summary-item__price">${this.currencySymbol(tour.currency)}${(tour.pricePerPerson * pax).toFixed(0)}</span>
        <small>${this.currencySymbol(tour.currency)}${tour.pricePerPerson} × ${pax} pax</small>
        <button type="button" class="quote-summary-item__remove" data-remove-tour="${this.escapeHtml(tour.slug)}">${pnT("quote.remove", "Quitar")}</button>
      </div>
    `);

    const hotelItems = Object.entries(this.state.hotels).map(([groupId, hotel]) => `
      <div class="quote-summary-item">
        <strong>${this.escapeHtml(hotel.hotelName)}</strong>
        <span class="quote-summary-item__price">$${hotel.totalPrice.toFixed(0)}</span>
        <small>${this.escapeHtml(hotel.destinationLabel)} · ${this.escapeHtml(hotel.roomLabel)} · ${hotel.nights} ${hotel.nights === 1 ? pnT("quote.night", "noche") : pnT("quote.nightsPlural", "noches")}</small>
        <button type="button" class="quote-summary-item__remove" data-remove-hotel="${this.escapeHtml(groupId)}">${pnT("quote.remove", "Quitar")}</button>
      </div>
    `);

    const allItems = [...tourItems, ...hotelItems];

    if (this.el.summaryItems) {
      this.el.summaryItems.innerHTML = allItems.length
        ? allItems.join("")
        : `<p class="quote-summary-empty">${pnT("quote.summaryEmpty", "Aún no agregaste tours ni hoteles. Explora el catálogo y toca \"Agregar\" para empezar a armar tu viaje.")}</p>`;

      this.el.summaryItems.querySelectorAll("[data-remove-tour]").forEach((btn) => {
        btn.addEventListener("click", () => this.toggleTour(btn.dataset.removeTour));
      });
      this.el.summaryItems.querySelectorAll("[data-remove-hotel]").forEach((btn) => {
        btn.addEventListener("click", () => this.removeHotel(btn.dataset.removeHotel));
      });
    }

    this.renderTotals();
  }

  computeTotalsByCurrency() {
    const pax = this.getPaxCount();
    const totals = {};
    this.state.tours.forEach((tour) => {
      totals[tour.currency] = (totals[tour.currency] || 0) + tour.pricePerPerson * pax;
    });
    Object.values(this.state.hotels).forEach((hotel) => {
      totals[hotel.currency || "USD"] = (totals[hotel.currency || "USD"] || 0) + hotel.totalPrice;
    });
    return totals;
  }

  renderTotals() {
    if (!this.el.summaryTotals) return;
    const totals = this.computeTotalsByCurrency();
    const currencies = Object.keys(totals);

    if (!currencies.length) {
      this.el.summaryTotals.innerHTML = "";
      return;
    }

    this.el.summaryTotals.innerHTML = currencies.map((currency) => `
      <div class="quote-total-line">
        <span>${pnT("quote.total", "Total")} ${currency === "USD" ? "" : currency}</span>
        <span>${this.currencySymbol(currency)}${totals[currency].toFixed(0)} <small>${currency}</small></span>
      </div>
    `).join("");
  }

  clearQuote() {
    if (!this.state.tours.length && !Object.keys(this.state.hotels).length) return;
    if (!window.confirm(pnT("quote.clearConfirm", "¿Vaciar toda la cotización actual?"))) return;
    this.state.tours = [];
    this.state.hotels = {};
    this.saveState();
    this.renderTours();
    this.renderHotels();
    this.renderSummary();
  }

  /* ---------------- EXPORT ---------------- */

  sendWhatsApp() {
    const pax = this.getPaxCount();
    const totals = this.computeTotalsByCurrency();
    const lines = ["Hola Peru Nature, quiero cotizar este viaje:", ""];
    lines.push(`Viajeros: ${this.state.adults} adulto(s)${this.state.children ? ` + ${this.state.children} niño(s)` : ""}`);

    if (this.state.tours.length) {
      lines.push("", "Tours / paquetes:");
      this.state.tours.forEach((tour) => {
        lines.push(`- ${tour.title} (${this.currencySymbol(tour.currency)}${(tour.pricePerPerson * pax).toFixed(0)})`);
      });
    }

    const hotelEntries = Object.values(this.state.hotels);
    if (hotelEntries.length) {
      lines.push("", "Hoteles:");
      hotelEntries.forEach((hotel) => {
        lines.push(`- ${hotel.hotelName} (${hotel.destinationLabel}): ${hotel.roomLabel}, ${hotel.nights} noche(s) - $${hotel.totalPrice.toFixed(0)}`);
      });
    }

    if (Object.keys(totals).length) {
      lines.push("", "Total estimado:");
      Object.entries(totals).forEach(([currency, amount]) => {
        lines.push(`${this.currencySymbol(currency)}${amount.toFixed(0)} ${currency}`);
      });
    }

    lines.push("", "(Vuelos: a coordinar directamente con un asesor)");

    const url = `https://wa.me/51929715296?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  }

  /* ---------------- UTILS ---------------- */

  currencySymbol(currency) {
    const value = String(currency || "USD").toUpperCase();
    if (value === "USD") return "$";
    if (value === "PEN" || value === "SOLES") return "S/ ";
    if (value === "EUR") return "€";
    return `${currency} `;
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.peruNatureQuoteBuilder = new PeruNatureQuoteBuilder();
});

document.addEventListener("peruNature:languageChanged", () => {
  window.location.reload();
});
