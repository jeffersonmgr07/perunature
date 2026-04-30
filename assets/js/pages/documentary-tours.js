/* =========================================================
   DOCUMENTARY TOURS | Peru Nature
   Cards dinámicas para tours documentales programados
========================================================= */

class PeruNatureDocumentaryTours {
  constructor() {
    this.tours = [];
    this.whatsappNumber = "51900608980";

    this.elements = {
      container: document.getElementById("documentaryToursContainer"),
      loading: document.getElementById("documentaryToursLoading"),
      empty: document.getElementById("documentaryToursEmpty")
    };

    this.init();
  }

  async init() {
    await this.loadTours();

    if (!this.tours.length) {
      this.showEmpty();
      return;
    }

    this.renderTours();
    this.hideLoading();
  }

  async loadTours() {
    try {
      const response = await fetch("./assets/data/documentary-tours.json");

      if (!response.ok) {
        throw new Error("No se pudo cargar documentary-tours.json");
      }

      const data = await response.json();
      this.tours = Array.isArray(data.tours) ? data.tours : [];

      this.tours.sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
      });
    } catch (error) {
      console.error("Error cargando tours documentales:", error);
      this.tours = [];
    }
  }

  renderTours() {
    if (!this.elements.container) return;

    this.elements.container.innerHTML = this.tours
      .map((tour) => this.createTourCard(tour))
      .join("");
  }

  createTourCard(tour) {
    const availableSeats = this.getAvailableSeats(tour);
    const status = this.getTourStatus(availableSeats);
    const image = this.getMainImage(tour);
    const dateRange = this.formatDateRange(tour.startDate, tour.endDate);
    const price = this.formatPrice(tour.pricing?.total, tour.pricing?.currency);
    const deposit = this.formatPrice(tour.pricing?.deposit, tour.pricing?.currency);
    const whatsappURL = this.createWhatsAppURL(tour, availableSeats);

    return `
      <article class="documentary-card ${status.className}">
        <div class="documentary-card-image">
          <img
            src="${this.escapeHTML(image)}"
            alt="${this.escapeHTML(tour.title)}"
            loading="lazy"
          />

          <span class="documentary-status ${status.className}">
            ${status.label}
          </span>
        </div>

        <div class="documentary-card-content">
          <div class="documentary-card-top">
            <span class="documentary-date">
              <i class="fa-regular fa-calendar"></i>
              ${this.escapeHTML(dateRange)}
            </span>

            <span class="documentary-duration">
              <i class="fa-regular fa-clock"></i>
              ${this.escapeHTML(this.formatDuration(tour.duration))}
            </span>
          </div>

          <h2>${this.escapeHTML(tour.title)}</h2>

          <p class="documentary-route">
            <i class="fa-solid fa-route"></i>
            ${this.escapeHTML(tour.route || tour.destination || "Perú")}
          </p>

          <div class="documentary-meta">
            <span>
              <i class="fa-solid fa-location-dot"></i>
              ${this.escapeHTML(tour.destination || "Perú")}
            </span>

            <span>
              <i class="fa-solid fa-person-hiking"></i>
              Dificultad ${this.escapeHTML(this.formatText(tour.difficulty || "Por confirmar"))}
            </span>
          </div>

          <div class="documentary-highlights">
            ${this.renderHighlights(tour.highlights)}
          </div>

          <div class="documentary-seats">
            <div class="seats-info">
              <strong>${availableSeats}</strong>
              <span>cupos disponibles de ${tour.maxGroupSize || 20}</span>
            </div>

            <div class="seats-bar">
              <span style="width: ${this.getSeatsPercentage(tour)}%"></span>
            </div>
          </div>

          <div class="documentary-card-bottom">
            <div class="documentary-price">
              <span>Precio total</span>
              <strong>${price}</strong>
              <small>Anticipo: ${deposit}</small>
            </div>

            <div class="documentary-actions">
              <a
                href="./documentary-product.html?slug=${encodeURIComponent(tour.slug)}"
                class="documentary-btn-secondary"
              >
                Ver detalles
              </a>

              <a
                href="${whatsappURL}"
                target="_blank"
                rel="noopener"
                class="documentary-btn-primary ${availableSeats <= 0 ? "disabled" : ""}"
                ${availableSeats <= 0 ? "aria-disabled='true'" : ""}
              >
                <i class="fa-brands fa-whatsapp"></i>
                Reservar cupo
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  renderHighlights(highlights) {
    if (!Array.isArray(highlights) || highlights.length === 0) {
      return `
        <span>
          <i class="fa-solid fa-check"></i>
          Experiencia documental programada
        </span>
      `;
    }

    return highlights
      .slice(0, 3)
      .map((item) => {
        return `
          <span>
            <i class="fa-solid fa-check"></i>
            ${this.escapeHTML(item)}
          </span>
        `;
      })
      .join("");
  }

  getAvailableSeats(tour) {
    const max = Number(tour.maxGroupSize || 20);
    const booked = Number(tour.bookedSeats || 0);
    const available = max - booked;

    return available > 0 ? available : 0;
  }

  getTourStatus(availableSeats) {
    if (availableSeats <= 0) {
      return {
        label: "Agotado",
        className: "is-sold-out"
      };
    }

    if (availableSeats <= 5) {
      return {
        label: "Últimos cupos",
        className: "is-limited"
      };
    }

    return {
      label: "Disponible",
      className: "is-available"
    };
  }

  getSeatsPercentage(tour) {
    const max = Number(tour.maxGroupSize || 20);
    const booked = Number(tour.bookedSeats || 0);

    if (!max) return 0;

    const percentage = (booked / max) * 100;

    return Math.min(Math.max(percentage, 0), 100);
  }

  getMainImage(tour) {
    if (!Array.isArray(tour.images) || tour.images.length === 0) {
      return "./assets/img/placeholder/tour-placeholder.jpg";
    }

    const image = tour.images[0];

    if (typeof image === "string") return image;

    return image.src || image.url || "./assets/img/placeholder/tour-placeholder.jpg";
  }

  createWhatsAppURL(tour, availableSeats) {
    if (availableSeats <= 0) {
      return "#";
    }

    const message = [
      "Hola Peru Nature, quiero reservar un cupo para este tour documental:",
      "",
      `Tour: ${tour.title}`,
      `Destino: ${tour.destination || "Perú"}`,
      `Ruta: ${tour.route || "Por confirmar"}`,
      `Fecha: ${this.formatDateRange(tour.startDate, tour.endDate)}`,
      `Duración: ${this.formatDuration(tour.duration)}`,
      `Cupos disponibles: ${availableSeats}`,
      `Precio total: ${this.formatPrice(tour.pricing?.total, tour.pricing?.currency)}`,
      `Anticipo: ${this.formatPrice(tour.pricing?.deposit, tour.pricing?.currency)}`,
      "",
      "Quiero confirmar disponibilidad y separar mi cupo."
    ].join("\n");

    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return "Fecha por confirmar";

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const startFormatted = start.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short"
    });

    const endFormatted = end.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    return `${startFormatted} - ${endFormatted}`;
  }

  formatDuration(duration) {
    if (!duration) return "Por confirmar";

    if (typeof duration === "number") {
      return `${duration} días`;
    }

    if (typeof duration === "string") {
      return duration;
    }

    if (duration.label) {
      return duration.label;
    }

    if (duration.days) {
      return `${duration.days} días`;
    }

    return "Por confirmar";
  }

  formatPrice(amount, currency = "USD") {
    if (!amount) return "Consultar";

    const value = Number(amount);

    if (Number.isNaN(value)) return "Consultar";

    const symbol = this.getCurrencySymbol(currency);

    return `${symbol}${value.toLocaleString("es-PE")}`;
  }

  getCurrencySymbol(currency) {
    const value = String(currency || "USD").toUpperCase();

    if (value === "USD") return "$";
    if (value === "PEN" || value === "SOLES") return "S/";
    if (value === "EUR") return "€";

    return `${currency} `;
  }

  formatText(value) {
    return String(value || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  hideLoading() {
    this.elements.loading?.classList.add("hidden");
    this.elements.empty?.classList.add("hidden");
    this.elements.container?.classList.remove("hidden");
  }

  showEmpty() {
    this.elements.loading?.classList.add("hidden");
    this.elements.container?.classList.add("hidden");
    this.elements.empty?.classList.remove("hidden");
  }

  escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PeruNatureDocumentaryTours();
});
