class PeruNatureExperiencesPage {
  constructor() {
    this.params = new URLSearchParams(window.location.search);

    this.tours = [];
    this.categories = [];
    this.destinations = [];

    this.filters = {
      search: this.params.get("q") || "",
      destination: this.params.get("destino") || "",
      category: this.params.get("categoria") || this.params.get("tipo") || "",
      difficulty: this.params.get("dificultad") || "",
      sort: this.params.get("orden") || "recommended"
    };

    this.init();
  }

  async init() {
    await this.loadToursData();
    this.cacheDom();
    this.populateFilters();
    this.applyInitialFiltersToUI();
    this.bindEvents();
    this.render();
  }

  async loadToursData() {
    try {
      const response = await fetch("./assets/data/tours.json", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("No se pudo cargar tours.json");
      }

      const data = await response.json();

      this.tours = Array.isArray(data.tours) ? data.tours : [];
      this.categories = Array.isArray(data.categories) ? data.categories : [];
      this.destinations = Array.isArray(data.destinations) ? data.destinations : [];
    } catch (error) {
      console.error(error);
      this.tours = [];
    }
  }

  cacheDom() {
    this.grid = document.getElementById("experiencesGrid");
    this.emptyState = document.getElementById("emptyState");
    this.resultsCount = document.getElementById("resultsCount");
    this.resultsTitle = document.getElementById("resultsTitle");
    this.listingSummary = document.getElementById("listingSummary");

    this.filterSearch = document.getElementById("filterSearch");
    this.filterDestination = document.getElementById("filterDestination");
    this.filterCategory = document.getElementById("filterCategory");
    this.filterDifficulty = document.getElementById("filterDifficulty");
    this.filterSort = document.getElementById("filterSort");
    this.clearBtn = document.getElementById("clearFiltersBtn");
  }

  populateFilters() {
    if (this.filterDestination) {
      this.filterDestination.innerHTML = `
        <option value="">Todos los destinos</option>
        ${this.destinations.map((destination) => `
          <option value="${this.escapeHtml(destination.code)}">
            ${this.escapeHtml(destination.name)}
          </option>
        `).join("")}
      `;
    }

    if (this.filterCategory) {
      this.filterCategory.innerHTML = `
        <option value="">Todas</option>
        ${this.categories.map((category) => `
          <option value="${this.escapeHtml(category.code)}">
            ${this.escapeHtml(category.label)}
          </option>
        `).join("")}
      `;
    }
  }

  applyInitialFiltersToUI() {
    if (this.filterSearch) this.filterSearch.value = this.filters.search;
    if (this.filterDestination) this.filterDestination.value = this.filters.destination;
    if (this.filterCategory) this.filterCategory.value = this.filters.category;
    if (this.filterDifficulty) this.filterDifficulty.value = this.filters.difficulty;
    if (this.filterSort) this.filterSort.value = this.filters.sort;
  }

  bindEvents() {
    this.filterSearch?.addEventListener("input", () => {
      this.filters.search = this.filterSearch.value.trim();
      this.render();
    });

    this.filterDestination?.addEventListener("change", () => {
      this.filters.destination = this.filterDestination.value;
      this.render();
    });

    this.filterCategory?.addEventListener("change", () => {
      this.filters.category = this.filterCategory.value;
      this.render();
    });

    this.filterDifficulty?.addEventListener("change", () => {
      this.filters.difficulty = this.filterDifficulty.value;
      this.render();
    });

    this.filterSort?.addEventListener("change", () => {
      this.filters.sort = this.filterSort.value;
      this.render();
    });

    this.clearBtn?.addEventListener("click", () => {
      this.filters = {
        search: "",
        destination: "",
        category: "",
        difficulty: "",
        sort: "recommended"
      };

      this.applyInitialFiltersToUI();
      this.render();
    });
  }

  render() {
    const filtered = this.getFilteredTours();
    const sorted = this.sortTours(filtered);

    this.renderHeader(sorted.length);
    this.renderCards(sorted);
  }

  getFilteredTours() {
    return this.tours.filter((tour) => {
      const searchText = [
        tour.title,
        tour.shortDescription,
        tour.description,
        tour.location,
        ...(tour.tags || [])
      ].join(" ").toLowerCase();

      const matchesSearch = !this.filters.search
        || searchText.includes(this.filters.search.toLowerCase());

      const matchesDestination = !this.filters.destination
        || tour.destination === this.filters.destination;

      const matchesCategory = !this.filters.category
        || (Array.isArray(tour.categories) && tour.categories.includes(this.filters.category));

      const matchesDifficulty = !this.filters.difficulty
        || tour.difficulty === this.filters.difficulty;

      return matchesSearch && matchesDestination && matchesCategory && matchesDifficulty;
    });
  }

  sortTours(items) {
    const tours = [...items];

    if (this.filters.sort === "price_asc") {
      return tours.sort((a, b) => this.getPrice(a) - this.getPrice(b));
    }

    if (this.filters.sort === "price_desc") {
      return tours.sort((a, b) => this.getPrice(b) - this.getPrice(a));
    }

    if (this.filters.sort === "rating_desc") {
      return tours.sort((a, b) => this.getRating(b) - this.getRating(a));
    }

    return tours.sort((a, b) => Number(b.featured || false) - Number(a.featured || false));
  }

  renderHeader(count) {
    const destinationName = this.getDestinationName(this.filters.destination);

    if (this.resultsCount) {
      this.resultsCount.textContent = `${count} experiencia${count === 1 ? "" : "s"} encontrada${count === 1 ? "" : "s"}`;
    }

    if (this.resultsTitle) {
      this.resultsTitle.textContent = destinationName
        ? `Experiencias en ${destinationName}`
        : "Experiencias disponibles";
    }

    if (this.listingSummary) {
      this.listingSummary.textContent = destinationName
        ? `Tours, actividades y paquetes seleccionados para ${destinationName}.`
        : "Encuentra tours, actividades y paquetes seleccionados por destino.";
    }
  }

  renderCards(tours) {
    if (!this.grid || !this.emptyState) return;

    if (!tours.length) {
      this.grid.innerHTML = "";
      this.emptyState.hidden = false;
      return;
    }

    this.emptyState.hidden = true;

    this.grid.innerHTML = tours.map((tour) => this.cardTemplate(tour)).join("");
  }

  cardTemplate(tour) {
    const image = tour.images?.cover || "./assets/img/hero/hero-1.jpg";
    const badge = tour.featured ? "Recomendado" : this.getCategoryLabel(tour.categories?.[0]);
    const rating = this.getRating(tour);
    const reviews = tour.rating?.reviewsCount || 0;
    const price = tour.pricing?.priceLabel || `Desde ${tour.pricing?.currency || "USD"} ${this.getPrice(tour)}`;
    const duration = tour.duration?.label || "Duración por confirmar";

    return `
      <article class="experience-card">
        <div class="experience-card__image">
          <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(tour.title)}" loading="lazy">
          <span class="experience-card__badge">${this.escapeHtml(badge)}</span>
        </div>

        <div class="experience-card__content">
          <div class="experience-card__meta">
            <span><i class="fa-regular fa-clock"></i> ${this.escapeHtml(duration)}</span>
            <span><i class="fa-solid fa-star"></i> ${rating.toFixed(1)} (${reviews})</span>
          </div>

          <h3>${this.escapeHtml(tour.title)}</h3>
          <p>${this.escapeHtml(tour.shortDescription || tour.description || "")}</p>

          <div class="experience-card__footer">
            <div class="experience-price">
              <span>Precio</span>
              <strong>${this.escapeHtml(price)}</strong>
            </div>

            <a class="experience-card__link" href="./product.html?slug=${encodeURIComponent(tour.slug)}">
              Ver experiencia
            </a>
          </div>
        </div>
      </article>
    `;
  }

  getPrice(tour) {
    return Number(tour.pricing?.basePrice || 0);
  }

  getRating(tour) {
    return Number(tour.rating?.score || 0);
  }

  getDestinationName(code) {
    if (!code) return "";
    return this.destinations.find((item) => item.code === code)?.name || code;
  }

  getCategoryLabel(code) {
    if (!code) return "Experiencia";
    return this.categories.find((item) => item.code === code)?.label || "Experiencia";
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
  new PeruNatureExperiencesPage();
});
