class PeruNatureSearchBar {
  constructor() {
    // ELEMENTOS
    this.form = document.getElementById("pnSearchForm");
    this.input = document.getElementById("pnDestinoInput");
    this.autocomplete = document.getElementById("pnAutocomplete");
    this.tabs = document.querySelectorAll(".pn-tab");

    // DATA
    this.destinations = [];
    this.selectedDestination = "";
    this.currentTab = "tours";

    this.init();
  }

  async init() {
    if (!this.input) return;

    await this.loadDestinations();
    this.bindEvents();
  }

  async loadDestinations() {
    try {
      const data = await window.PeruNatureData.fetchLocalizedJson("./assets/data/destinations.json");
      this.destinations = data?.destinations || [];
    } catch (e) {
      console.error("Error cargando destinos", e);
    }
  }

  bindEvents() {
    // 🔎 AUTOCOMPLETE
    this.input.addEventListener("input", () => {
      const value = this.input.value.toLowerCase().trim();

      if (!value) {
        this.selectedDestination = "";
        this.autocomplete.classList.remove("is-active");
        return;
      }

      const results = this.destinations.filter(d =>
        d.name.toLowerCase().includes(value)
      );

      this.renderAutocomplete(results);
    });

    // ⌨️ ENTER = BUSCAR
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submitSearch();
      }
    });

    // 🧭 TABS
    this.tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        this.currentTab = tab.dataset.tab;

        this.tabs.forEach(t => t.classList.remove("is-active"));
        tab.classList.add("is-active");
      });
    });

    // 📤 SUBMIT FORM
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitSearch();
    });

    // ❌ CERRAR AUTOCOMPLETE
    document.addEventListener("click", (e) => {
      if (!this.input.contains(e.target) && !this.autocomplete.contains(e.target)) {
        this.autocomplete.classList.remove("is-active");
      }
    });
  }

  renderAutocomplete(results) {
    if (!results.length) {
      this.autocomplete.classList.remove("is-active");
      return;
    }

    this.autocomplete.innerHTML = results.map(d => `
      <div class="pn-autocomplete-item" data-code="${d.code}">
        ${d.name}
      </div>
    `).join("");

    this.autocomplete.classList.add("is-active");

    this.autocomplete.querySelectorAll(".pn-autocomplete-item").forEach(item => {
      item.addEventListener("click", () => {
        const code = item.dataset.code;
        const destination = this.destinations.find(d => d.code === code);

        this.input.value = destination.name;
        this.selectedDestination = code;

        this.autocomplete.classList.remove("is-active");
      });
    });
  }

  submitSearch() {
    const fecha = document.getElementById("pnFecha")?.value || "";
    const viajeros = document.getElementById("pnViajeros")?.value || "";
    const typed = this.input.value.trim();

    // Si el usuario escribió un destino pero nunca hizo clic en una sugerencia
    // del autocompletado, selectedDestination queda vacío y el texto se
    // perdía por completo. Intentamos resolverlo a un código conocido; si no
    // hay coincidencia exacta, lo mandamos como búsqueda libre (q=) en vez de
    // descartarlo.
    if (!this.selectedDestination && typed) {
      const match = this.destinations.find(
        (d) => d.name.toLowerCase() === typed.toLowerCase()
      );
      if (match) this.selectedDestination = match.code;
    }

    const params = new URLSearchParams();

    if (this.selectedDestination) params.set("destino", this.selectedDestination);
    else if (typed) params.set("q", typed);

    if (fecha) params.set("fecha", fecha);
    if (viajeros) params.set("viajeros", viajeros);

    // El tab "Hoteles" no tiene catálogo propio: los hoteles solo existen
    // como acomodación dentro de un paquete/cotización, así que lo enviamos
    // directo al cotizador en vez de a una búsqueda que siempre da 0 resultados.
    if (this.currentTab === "hoteles") {
      params.set("foco", "hoteles");
      window.location.href = `./quote-packages.html?${params.toString()}`;
      return;
    }

    if (this.currentTab) params.set("tipo", this.currentTab);

    // 🔥 REDIRECCIÓN PRINCIPAL
    window.location.href = `./all-experiences.html?${params.toString()}`;
  }
}

window.PeruNatureSearchBar = PeruNatureSearchBar;

document.addEventListener("peruNature:languageChanged", () => {
  window.peruNatureSearchBarInstance?.loadDestinations?.();
});
