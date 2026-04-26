class PeruNatureSearchBar {
  constructor() {
    this.input = document.getElementById("pnDestinoInput");
    this.autocomplete = document.getElementById("pnAutocomplete");

    this.destinations = [];
    this.selectedDestination = "";

    this.init();
  }

  async init() {
    if (!this.input) return;

    await this.loadDestinations();
    this.bindEvents();
  }

  async loadDestinations() {
    try {
      const res = await fetch("./assets/data/destinations.json");
      const data = await res.json();
      this.destinations = data.destinations || [];
    } catch (e) {
      console.error("Error cargando destinos", e);
    }
  }

  bindEvents() {
    this.input.addEventListener("input", () => {
      const value = this.input.value.toLowerCase();

      if (!value) {
        this.autocomplete.classList.remove("is-active");
        return;
      }

      const results = this.destinations.filter(d =>
        d.name.toLowerCase().includes(value)
      );

      this.renderAutocomplete(results);
    });

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
}

window.PeruNatureSearchBar = PeruNatureSearchBar;
