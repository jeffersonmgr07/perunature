class PeruNatureSearchBar {
  constructor() {
    this.form = document.getElementById("pnSearchForm");
    this.tabs = document.querySelectorAll(".pn-tab");
    this.currentTab = "tours";

    this.init();
  }

  init() {
    if (!this.form) return;

    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.currentTab = tab.dataset.tab;

        this.tabs.forEach((item) => item.classList.remove("is-active"));
        tab.classList.add("is-active");
      });
    });

    this.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const destino = document.getElementById("pnDestino").value;
      const fecha = document.getElementById("pnFecha").value;
      const viajeros = document.getElementById("pnViajeros").value;

      const params = new URLSearchParams({
        tipo: this.currentTab,
        destino,
        fecha,
        viajeros
      });

      window.location.href = `./all-experiences.html?${params.toString()}`;
    });
  }
}

window.PeruNatureSearchBar = PeruNatureSearchBar;
