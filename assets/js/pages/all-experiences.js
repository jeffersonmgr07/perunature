/* =========================================================
   ALL EXPERIENCES | Peru Nature
   Carga múltiple + filtros nacionales + cards minimalistas
========================================================= */

class PeruNatureExperiencesPage {
  constructor() {
    this.params = new URLSearchParams(window.location.search);

    this.sources = [
      "./assets/data/tours.json",
      "./assets/data/tours-peru-catalog.json",
      "./assets/data/tours-peru-batch-01.json",
      "./assets/data/tours-peru-batch-02.json",
      "./assets/data/tours-reservas-peru.json",
      "./assets/data/packages-peru.json",
      "./assets/data/documentary-tours.json"
    ];

    this.products = [];
    this.categories = new Map();
    this.destinations = new Map();
    this.departments = new Map();

    this.filters = {
      search: this.params.get("q") || this.params.get("search") || "",
      region: this.normalizeValue(this.params.get("region") || ""),
      productKind: this.normalizeProductKind(this.params.get("tipo") || this.params.get("kind") || ""),
      destination: this.normalizeValue(this.params.get("destino") || this.params.get("destination") || ""),
      category: this.normalizeValue(this.params.get("categoria") || this.params.get("category") || ""),
      duration: this.normalizeValue(this.params.get("duracion") || this.params.get("duration") || ""),
      difficulty: this.normalizeValue(this.params.get("dificultad") || this.params.get("difficulty") || ""),
      sort: this.params.get("orden") || this.params.get("sort") || "recommended"
    };

    this.init();
  }

  async init() {
    this.cacheDom();
    this.setLoadingState();
    await this.loadCatalogs();
    this.populateFilters();
    this.applyInitialFiltersToUI();
    this.bindEvents();
    this.render();
  }

  cacheDom() {
    this.grid = document.getElementById("experiencesGrid");
    this.emptyState = document.getElementById("emptyState");
    this.resultsCount = document.getElementById("resultsCount");
    this.resultsTitle = document.getElementById("resultsTitle");
    this.resultsEyebrow = document.getElementById("resultsEyebrow");
    this.listingSummary = document.getElementById("listingSummary");
    this.activeFilters = document.getElementById("activeFilters");

    this.filterSearch = document.getElementById("filterSearch");
    this.filterRegion = document.getElementById("filterRegion");
    this.filterProductKind = document.getElementById("filterProductKind");
    this.filterDestination = document.getElementById("filterDestination");
    this.filterCategory = document.getElementById("filterCategory");
    this.filterDuration = document.getElementById("filterDuration");
    this.filterDifficulty = document.getElementById("filterDifficulty");
    this.filterSort = document.getElementById("filterSort");
    this.clearBtn = document.getElementById("clearFiltersBtn");
    this.emptyClearBtn = document.getElementById("emptyClearBtn");
  }

  setLoadingState() {
    if (this.grid) {
      this.grid.innerHTML = Array.from({ length: 6 }).map(() => `
        <article class="experience-card" aria-hidden="true">
          <div class="experience-card__image"></div>
          <div class="experience-card__content">
            <div class="experience-card__meta"><span>Cargando...</span></div>
            <h3>Cargando experiencia</h3>
            <p>Preparando la vitrina de Peru Nature...</p>
          </div>
        </article>
      `).join("");
    }
  }

  async loadCatalogs() {
    const loaded = await Promise.allSettled(
      this.sources.map((path) => this.fetchJson(path))
    );

    const productsBySlug = new Map();

    loaded.forEach((result, index) => {
      if (result.status !== "fulfilled" || !result.value) return;

      const data = result.value;
      const source = this.sources[index];

      this.registerCategories(data.categories);
      this.registerDestinations(data.destinations);

      const items = this.extractProducts(data, source);

      items.forEach((item) => {
        const product = this.normalizeProduct(item, source);
        if (!product.slug || !product.title) return;

        if (!productsBySlug.has(product.slug)) {
          productsBySlug.set(product.slug, product);
        } else {
          const current = productsBySlug.get(product.slug);
          productsBySlug.set(product.slug, this.mergeProduct(current, product));
        }
      });
    });

    this.products = Array.from(productsBySlug.values());
    this.registerFromProducts(this.products);
  }

  async fetchJson(path) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn(`[Peru Nature] No se pudo cargar ${path}`, error);
      return null;
    }
  }

  extractProducts(data, source) {
    if (!data || typeof data !== "object") return [];

    if (Array.isArray(data.tours)) {
      if (source.includes("documentary-tours")) {
        return data.tours.map((tour) => ({
          ...tour,
          productKind: "documentary",
          productFamily: "documentary-tour",
          categories: ["documentary", tour.type || "nature"].filter(Boolean),
          shortDescription: tour.route || "Expedición documental programada por Peru Nature.",
          description: tour.route || "Expedición documental programada por Peru Nature.",
          location: tour.destination || "Perú",
          destination: this.slugify(tour.destination || "peru"),
          duration: { days: tour.duration, label: `${tour.duration} días`, type: "multi_day" },
          pricing: {
            basePrice: tour.pricing?.total || 0,
            currency: tour.pricing?.currency || data.currency || "USD",
            priceLabel: tour.pricing?.total ? `Desde $${tour.pricing.total} por persona` : "Consultar"
          },
          images: { cover: Array.isArray(tour.images) ? tour.images[0] : "./assets/img/placeholder/tour-placeholder.jpg", gallery: Array.isArray(tour.images) ? tour.images : [] },
          badge: "Tour documental",
          rankScore: 88
        }));
      }

      return data.tours;
    }

    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.packageCards)) return data.packageCards;
    if (Array.isArray(data.packages)) return data.packages;

    return [];
  }

  registerCategories(categories = []) {
    if (!Array.isArray(categories)) return;

    categories.forEach((category) => {
      const code = this.normalizeValue(category.code || category.id || category.slug || category);
      const label = category.label || category.name || this.formatLabel(code);
      if (code && !this.categories.has(code)) {
        this.categories.set(code, label);
      }
    });
  }

  registerDestinations(destinations = []) {
    if (!Array.isArray(destinations)) return;

    destinations.forEach((destination) => {
      const code = this.normalizeValue(destination.code || destination.id || destination.slug || destination);
      const label = destination.name || destination.label || this.formatLabel(code);
      if (code && !this.destinations.has(code)) {
        this.destinations.set(code, label);
      }
    });
  }

  registerFromProducts(products) {
    products.forEach((product) => {
      if (product.destination && !this.destinations.has(product.destination)) {
        this.destinations.set(product.destination, this.humanizeDestination(product.destination));
      }

      if (product.department && !this.departments.has(product.department)) {
        this.departments.set(product.department, this.humanizeDestination(product.department));
      }

      (product.categories || []).forEach((category) => {
        if (category && !this.categories.has(category)) {
          this.categories.set(category, this.formatLabel(category));
        }
      });
    });
  }

  normalizeProduct(item, source) {
    const productKind = this.normalizeProductKind(item.productKind || item.kind || item.type || "tour");
    const duration = this.normalizeDuration(item.duration, item.days, item.nights);
    const categories = this.normalizeArray(item.categories || item.category || item.themes);
    const destination = this.normalizeValue(item.destination || item.destinationCode || item.locationKey || "peru");
    const department = this.normalizeValue(item.department || item.regionDepartment || "");
    const region = this.normalizeRegion(item.region || item.macroRegion || "");
    const pricing = this.normalizePricing(item.pricing || item.price || item.basePricing);
    const image = this.getImage(item);

    return {
      id: item.id || item.code || item.slug,
      slug: item.slug || this.slugify(item.title || item.name || item.id),
      title: item.title || item.name || "Experiencia Peru Nature",
      productKind,
      productFamily: item.productFamily || item.family || (productKind === "package" ? "flat-package" : "flat-tour"),
      shortDescription: item.shortDescription || item.summary || item.route || "Experiencia seleccionada por Peru Nature.",
      description: item.description || item.shortDescription || item.summary || "Experiencia seleccionada por Peru Nature.",
      destination,
      department,
      region,
      location: item.location || item.route || this.humanizeDestination(destination),
      categories,
      tags: this.normalizeArray(item.tags),
      duration,
      difficulty: this.normalizeValue(item.difficulty || "low"),
      pricing,
      rating: this.normalizeRating(item.rating),
      images: item.images,
      image,
      badge: item.badge || this.getDefaultBadge(productKind, categories),
      rankScore: Number(item.rankScore || item.featuredOrder || 0),
      featured: Boolean(item.featured),
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
      search: this.normalizeSearch(item.search, item),
      source,
      raw: item
    };
  }

  normalizeDuration(duration, days, nights) {
    if (typeof duration === "string") {
      return { label: duration, type: this.detectDurationType(duration) };
    }

    if (typeof duration === "number") {
      return { hours: duration, label: `${duration} horas`, type: duration > 12 ? "full_day" : "half_day" };
    }

    const data = duration && typeof duration === "object" ? { ...duration } : {};

    if (days && !data.days) data.days = Number(days);
    if (nights && !data.nights) data.nights = Number(nights);

    if (!data.label) {
      if (data.days && data.nights) data.label = `${data.days}D/${data.nights}N`;
      else if (data.days) data.label = `${data.days} día${data.days > 1 ? "s" : ""}`;
      else if (data.hours) data.label = data.hours >= 8 ? "Full Day" : "Medio día";
      else data.label = "Duración por confirmar";
    }

    if (!data.type) {
      if (data.days && data.days >= 2) data.type = "multi_day";
      else if (data.type === "full_day" || data.hours >= 8 || /full/i.test(data.label)) data.type = "full_day";
      else data.type = "half_day";
    }

    return data;
  }

  normalizePricing(pricing) {
    if (typeof pricing === "number") {
      return { basePrice: pricing, currency: "USD", priceLabel: `Desde $${pricing} por persona` };
    }

    const data = pricing && typeof pricing === "object" ? { ...pricing } : {};
    const amount = Number(data.basePrice || data.from || data.amount || data.total || data.price || 0);
    const currency = data.currency || "USD";

    return {
      ...data,
      basePrice: amount,
      currency,
      priceLabel: data.priceLabel || (amount ? `Desde ${this.currencySymbol(currency)}${amount} por persona` : "Consultar")
    };
  }

  normalizeRating(rating) {
    if (typeof rating === "number") return { score: rating, reviewsCount: 0 };
    if (!rating || typeof rating !== "object") return { score: 4.8, reviewsCount: 0 };

    return {
      score: Number(rating.score || rating.average || 4.8),
      reviewsCount: Number(rating.reviewsCount || rating.reviews || rating.count || 0)
    };
  }

  normalizeSearch(search, item) {
    const data = search && typeof search === "object" ? search : {};

    return {
      destinations: this.normalizeArray(data.destinations || item.destination || item.department || []),
      durationKeys: this.normalizeArray(data.durationKeys || item.duration?.type || []),
      includedTags: this.normalizeArray(data.includedTags || item.tags || []),
      keywords: this.normalizeArray(data.keywords || []),
      themes: this.normalizeArray(data.themes || item.categories || [])
    };
  }

  mergeProduct(current, next) {
    return {
      ...current,
      ...next,
      categories: Array.from(new Set([...(current.categories || []), ...(next.categories || [])])),
      tags: Array.from(new Set([...(current.tags || []), ...(next.tags || [])])),
      highlights: current.highlights?.length ? current.highlights : next.highlights,
      rankScore: Math.max(Number(current.rankScore || 0), Number(next.rankScore || 0)),
      featured: Boolean(current.featured || next.featured)
    };
  }

  populateFilters() {
    this.populateSelect(this.filterDestination, this.getDestinationOptions(), "Todos los destinos");
    this.populateSelect(this.filterCategory, this.getCategoryOptions(), "Todas");
  }

  populateSelect(select, options, defaultLabel) {
    if (!select) return;

    select.innerHTML = `
      <option value="">${this.escapeHtml(defaultLabel)}</option>
      ${options.map((option) => `
        <option value="${this.escapeHtml(option.value)}">${this.escapeHtml(option.label)}</option>
      `).join("")}
    `;
  }

  getDestinationOptions() {
    const merged = new Map([...this.destinations, ...this.departments]);

    return Array.from(merged.entries())
      .filter(([value]) => value && value !== "peru")
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }

  getCategoryOptions() {
    const preferred = [
      "full_day", "half_day", "multi_day", "nature", "reserve", "trekking",
      "adventure", "cultural", "wildlife", "marine", "documentary"
    ];

    const options = Array.from(this.categories.entries()).map(([value, label]) => ({ value, label }));

    return options.sort((a, b) => {
      const ia = preferred.indexOf(a.value);
      const ib = preferred.indexOf(b.value);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return a.label.localeCompare(b.label, "es");
    });
  }

  applyInitialFiltersToUI() {
    if (this.filterSearch) this.filterSearch.value = this.filters.search;
    if (this.filterRegion) this.filterRegion.value = this.filters.region;
    if (this.filterProductKind) this.filterProductKind.value = this.filters.productKind;
    if (this.filterDestination) this.filterDestination.value = this.filters.destination;
    if (this.filterCategory) this.filterCategory.value = this.filters.category;
    if (this.filterDuration) this.filterDuration.value = this.filters.duration;
    if (this.filterDifficulty) this.filterDifficulty.value = this.filters.difficulty;
    if (this.filterSort) this.filterSort.value = this.filters.sort;
  }

  bindEvents() {
    this.filterSearch?.addEventListener("input", () => {
      this.filters.search = this.filterSearch.value.trim();
      this.renderAndUpdateUrl();
    });

    [
      [this.filterRegion, "region"],
      [this.filterProductKind, "productKind"],
      [this.filterDestination, "destination"],
      [this.filterCategory, "category"],
      [this.filterDuration, "duration"],
      [this.filterDifficulty, "difficulty"],
      [this.filterSort, "sort"]
    ].forEach(([element, key]) => {
      element?.addEventListener("change", () => {
        this.filters[key] = element.value;
        this.renderAndUpdateUrl();
      });
    });

    this.clearBtn?.addEventListener("click", () => this.clearFilters());
    this.emptyClearBtn?.addEventListener("click", () => this.clearFilters());
  }

  clearFilters() {
    this.filters = {
      search: "",
      region: "",
      productKind: "",
      destination: "",
      category: "",
      duration: "",
      difficulty: "",
      sort: "recommended"
    };

    this.applyInitialFiltersToUI();
    this.renderAndUpdateUrl();
  }

  renderAndUpdateUrl() {
    this.render();
    this.updateUrl();
  }

  render() {
    const filtered = this.getFilteredProducts();
    const sorted = this.sortProducts(filtered);

    this.renderHeader(sorted.length);
    this.renderActiveFilters();
    this.renderCards(sorted);
  }

  getFilteredProducts() {
    return this.products.filter((product) => {
      const matchesSearch = this.matchesTextSearch(product, this.filters.search);
      const matchesRegion = !this.filters.region || product.region === this.filters.region;
      const matchesKind = !this.filters.productKind || product.productKind === this.filters.productKind;
      const matchesDestination = !this.filters.destination || this.matchesDestination(product, this.filters.destination);
      const matchesCategory = !this.filters.category || (product.categories || []).includes(this.filters.category);
      const matchesDuration = !this.filters.duration || this.matchesDuration(product, this.filters.duration);
      const matchesDifficulty = !this.filters.difficulty || product.difficulty === this.filters.difficulty;

      return matchesSearch && matchesRegion && matchesKind && matchesDestination && matchesCategory && matchesDuration && matchesDifficulty;
    });
  }

  matchesTextSearch(product, query) {
    if (!query) return true;

    const q = this.normalizeText(query);
    const search = product.search || {};

    const safeFields = [
      product.title,
      product.location,
      product.badge,
      product.productFamily,
      product.destination,
      product.department,
      product.region,
      product.duration?.label,
      ...(product.tags || []),
      ...(search.destinations || []),
      ...(search.durationKeys || []),
      ...(search.includedTags || []),
      ...(search.keywords || []),
      ...(search.themes || [])
    ].join(" ");

    return this.normalizeText(safeFields).includes(q);
  }

  matchesDestination(product, destination) {
    const value = this.normalizeValue(destination);
    const values = [
      product.destination,
      product.department,
      ...(product.search?.destinations || [])
    ].map((item) => this.normalizeValue(item));

    return values.includes(value);
  }

  matchesDuration(product, duration) {
    const type = this.normalizeValue(product.duration?.type || "");
    if (duration === "multi_day") return type === "multi_day" || Number(product.duration?.days || 0) >= 2;
    return type === duration;
  }

  sortProducts(items) {
    const products = [...items];

    if (this.filters.sort === "price_asc") return products.sort((a, b) => this.getPrice(a) - this.getPrice(b));
    if (this.filters.sort === "price_desc") return products.sort((a, b) => this.getPrice(b) - this.getPrice(a));
    if (this.filters.sort === "duration_asc") return products.sort((a, b) => this.getDurationWeight(a) - this.getDurationWeight(b));
    if (this.filters.sort === "name_asc") return products.sort((a, b) => a.title.localeCompare(b.title, "es"));
    if (this.filters.sort === "rank_desc") return products.sort((a, b) => this.getRank(b) - this.getRank(a));

    return products.sort((a, b) => {
      const featuredDiff = Number(b.featured) - Number(a.featured);
      if (featuredDiff) return featuredDiff;

      const rankDiff = this.getRank(b) - this.getRank(a);
      if (rankDiff) return rankDiff;

      const kindDiff = this.kindWeight(a) - this.kindWeight(b);
      if (kindDiff) return kindDiff;

      return this.getPrice(a) - this.getPrice(b);
    });
  }

  renderHeader(count) {
    const title = this.getDynamicTitle();

    if (this.resultsCount) {
      this.resultsCount.textContent = `${count} experiencia${count === 1 ? "" : "s"} encontrada${count === 1 ? "" : "s"}`;
    }

    if (this.resultsTitle) this.resultsTitle.textContent = title;

    if (this.listingSummary) {
      this.listingSummary.textContent = this.filters.destination
        ? `Tours, paquetes y experiencias seleccionadas para ${this.getDestinationLabel(this.filters.destination)}.`
        : "Explora experiencias seleccionadas en costa, Andes, Amazonía y norte del Perú. Encuentra tours planos, paquetes por destino, trekkings, reservas naturales y próximas salidas documentales.";
    }
  }

  renderActiveFilters() {
    if (!this.activeFilters) return;

    const labels = [];
    if (this.filters.search) labels.push(`Búsqueda: ${this.filters.search}`);
    if (this.filters.region) labels.push(`Región: ${this.formatLabel(this.filters.region)}`);
    if (this.filters.productKind) labels.push(`Tipo: ${this.formatKind(this.filters.productKind)}`);
    if (this.filters.destination) labels.push(`Destino: ${this.getDestinationLabel(this.filters.destination)}`);
    if (this.filters.category) labels.push(`Categoría: ${this.getCategoryLabel(this.filters.category)}`);
    if (this.filters.duration) labels.push(`Duración: ${this.formatLabel(this.filters.duration)}`);
    if (this.filters.difficulty) labels.push(`Dificultad: ${this.formatDifficulty(this.filters.difficulty)}`);

    this.activeFilters.hidden = labels.length === 0;
    this.activeFilters.innerHTML = labels.map((label) => `<span class="active-filter-pill">${this.escapeHtml(label)}</span>`).join("");
  }

  renderCards(products) {
    if (!this.grid || !this.emptyState) return;

    if (!products.length) {
      this.grid.innerHTML = "";
      this.emptyState.hidden = false;
      return;
    }

    this.emptyState.hidden = true;
    this.grid.innerHTML = products.map((product) => this.cardTemplate(product)).join("");
  }

  cardTemplate(product) {
    const image = product.image || "./assets/img/placeholder/tour-placeholder.jpg";
    const badge = product.badge || this.getDefaultBadge(product.productKind, product.categories);
    const price = product.pricing?.priceLabel || this.formatPrice(product.pricing);
    const duration = product.duration?.label || "Duración por confirmar";
    const location = product.location || this.getDestinationLabel(product.destination) || "Perú";
    const region = product.region ? this.formatLabel(product.region) : "Perú";
    const shortDescription = product.shortDescription || product.description || "Experiencia seleccionada por Peru Nature.";
    const tags = this.getCardTags(product);
    const url = this.getProductUrl(product);

    return `
      <article class="experience-card" data-kind="${this.escapeHtml(product.productKind)}" data-region="${this.escapeHtml(product.region)}">
        <div class="experience-card__image">
          <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(product.title)}" loading="lazy" onerror="this.src='./assets/img/placeholder/tour-placeholder.jpg'">
          <span class="experience-card__badge">${this.escapeHtml(badge)}</span>
          <span class="experience-card__region">${this.escapeHtml(region)}</span>
        </div>

        <div class="experience-card__content">
          <div class="experience-card__meta">
            <span><i class="fa-regular fa-clock"></i> ${this.escapeHtml(duration)}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${this.escapeHtml(location)}</span>
          </div>

          <h3>${this.escapeHtml(product.title)}</h3>
          <p>${this.escapeHtml(shortDescription)}</p>

          <div class="experience-card__tags">
            ${tags.map((tag) => `<span>${this.escapeHtml(tag)}</span>`).join("")}
          </div>

          <div class="experience-card__footer">
            <div class="experience-price">
              <span>Desde</span>
              <strong>${this.escapeHtml(price.replace(/^Desde\s*/i, ""))}</strong>
            </div>

            <a class="experience-card__link" href="${this.escapeHtml(url)}">
              Ver experiencia
            </a>
          </div>
        </div>
      </article>
    `;
  }

  getProductUrl(product) {
    if (product.productKind === "documentary") {
      return `./documentary-tours.html#documentaryToursSection`;
    }

    return `./product.html?slug=${encodeURIComponent(product.slug)}`;
  }

  getCardTags(product) {
    const tags = [];

    if (product.productKind) tags.push(this.formatKind(product.productKind));
    if (product.categories?.[0]) tags.push(this.getCategoryLabel(product.categories[0]));
    if (product.difficulty) tags.push(this.formatDifficulty(product.difficulty));

    return Array.from(new Set(tags)).slice(0, 3);
  }

  updateUrl() {
    const params = new URLSearchParams();

    if (this.filters.search) params.set("q", this.filters.search);
    if (this.filters.region) params.set("region", this.filters.region);
    if (this.filters.productKind) params.set("tipo", this.filters.productKind);
    if (this.filters.destination) params.set("destino", this.filters.destination);
    if (this.filters.category) params.set("categoria", this.filters.category);
    if (this.filters.duration) params.set("duracion", this.filters.duration);
    if (this.filters.difficulty) params.set("dificultad", this.filters.difficulty);
    if (this.filters.sort && this.filters.sort !== "recommended") params.set("orden", this.filters.sort);

    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", url);
  }

  getDynamicTitle() {
    if (this.filters.destination) return `Experiencias en ${this.getDestinationLabel(this.filters.destination)}`;
    if (this.filters.region) return `Experiencias en ${this.formatLabel(this.filters.region)}`;
    if (this.filters.productKind) return `${this.formatKind(this.filters.productKind)} disponibles`;
    if (this.filters.category) return `${this.getCategoryLabel(this.filters.category)} en Perú`;
    return "Experiencias disponibles";
  }

  getImage(item) {
    const images = item.images;

    if (typeof item.image === "string") return item.image;
    if (typeof item.cover === "string") return item.cover;

    if (Array.isArray(images)) {
      const first = images[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") return first.src || first.url || first.image || "";
    }

    if (images && typeof images === "object") {
      if (typeof images.cover === "string") return images.cover;
      if (Array.isArray(images.gallery) && images.gallery[0]) return images.gallery[0];
    }

    return "./assets/img/placeholder/tour-placeholder.jpg";
  }

  getPrice(product) {
    return Number(product.pricing?.basePrice || 0);
  }

  getRank(product) {
    return Number(product.rankScore || 0) + (product.featured ? 10 : 0);
  }

  kindWeight(product) {
    const order = { tour: 1, package: 2, documentary: 3 };
    return order[product.productKind] || 9;
  }

  getDurationWeight(product) {
    const d = product.duration || {};
    if (d.days) return Number(d.days) * 24;
    if (d.hours) return Number(d.hours);
    if (d.type === "half_day") return 4;
    if (d.type === "full_day") return 10;
    if (d.type === "multi_day") return 48;
    return 999;
  }

  getDefaultBadge(kind, categories = []) {
    if (kind === "documentary") return "Tour documental";
    if (kind === "package") return "Paquete";
    if (categories.includes("reserve")) return "Reserva natural";
    if (categories.includes("trekking")) return "Trekking";
    if (categories.includes("full_day")) return "Full Day";
    return "Experiencia";
  }

  getDestinationLabel(value) {
    const key = this.normalizeValue(value);
    return this.destinations.get(key) || this.departments.get(key) || this.humanizeDestination(key);
  }

  getCategoryLabel(value) {
    const key = this.normalizeValue(value);
    return this.categories.get(key) || this.formatLabel(key);
  }

  formatKind(value) {
    const labels = {
      tour: "Tour",
      package: "Paquete",
      documentary: "Documental"
    };

    return labels[value] || this.formatLabel(value);
  }

  formatDifficulty(value) {
    const labels = {
      low: "Fácil",
      medium: "Moderada",
      high: "Alta",
      very_high: "Muy alta"
    };

    return labels[value] || this.formatLabel(value);
  }

  formatPrice(pricing = {}) {
    const amount = Number(pricing.basePrice || pricing.amount || pricing.price || 0);
    if (!amount) return "Consultar";
    return `Desde ${this.currencySymbol(pricing.currency || "USD")}${amount} por persona`;
  }

  currencySymbol(currency) {
    const value = String(currency || "USD").toUpperCase();
    if (value === "USD") return "$";
    if (value === "PEN" || value === "SOLES") return "S/";
    if (value === "EUR") return "€";
    return `${currency} `;
  }

  normalizeProductKind(value) {
    const key = this.normalizeValue(value);
    if (["paquete", "paquetes", "packages", "multi_day", "multi-day"].includes(key)) return "package";
    if (["tours", "tour", "flat-tour", "full_day", "half_day"].includes(key)) return "tour";
    if (["documental", "documentales", "documentary", "documentary-tour"].includes(key)) return "documentary";
    return key || "tour";
  }

  normalizeRegion(value) {
    const key = this.normalizeValue(value);
    if (["amazonas", "selva", "amazonica", "amazonia-peruana"].includes(key)) return "amazonia";
    if (["andino", "sierra", "andes-peruanos"].includes(key)) return "andes";
    if (["costa-peruana", "marino"].includes(key)) return "costa";
    return key;
  }

  detectDurationType(value) {
    const text = this.normalizeText(value);
    if (text.includes("4d") || text.includes("3d") || text.includes("dias") || text.includes("noches")) return "multi_day";
    if (text.includes("full")) return "full_day";
    if (text.includes("medio")) return "half_day";
    return "full_day";
  }

  normalizeArray(value) {
    if (Array.isArray(value)) return value.map((item) => this.normalizeValue(item)).filter(Boolean);
    if (typeof value === "string") return value.split(",").map((item) => this.normalizeValue(item)).filter(Boolean);
    return [];
  }

  normalizeValue(value) {
    return this.slugify(String(value || "").trim());
  }

  slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " y ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  formatLabel(value) {
    return String(value || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .replace("Full Day", "Full Day")
      .replace("Half Day", "Medio día")
      .replace("Multi Day", "Paquete");
  }

  humanizeDestination(value) {
    const labels = {
      "paracas-ica": "Paracas e Ica",
      "huaraz-ancash": "Huaraz / Áncash",
      "tarapoto-san-martin": "Tarapoto / San Martín",
      "puerto-maldonado-madre-de-dios": "Puerto Maldonado / Madre de Dios",
      "iquitos-loreto": "Iquitos / Loreto",
      "chachapoyas-amazonas": "Chachapoyas / Amazonas",
      "lima": "Lima",
      "callao": "Callao"
    };

    return labels[value] || this.formatLabel(value);
  }

  escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.peruNatureExperiencesPage = new PeruNatureExperiencesPage();
});
