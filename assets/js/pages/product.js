/* =========================================================
   PRODUCT PAGE | Peru Nature
   Carga dinámica de detalle por slug
========================================================= */

class PeruNatureProductPage {
  constructor() {
    this.tours = [];
    this.currentTour = null;
    this.whatsappNumber = "51900608980";

    this.slug = this.getSlugFromURL();

    this.elements = {
      loading: document.getElementById("productLoading"),
      error: document.getElementById("productError"),
      content: document.getElementById("productContent"),

      breadcrumbTitle: document.getElementById("breadcrumbTitle"),
      badges: document.getElementById("productBadges"),
      title: document.getElementById("productTitle"),
      shortDescription: document.getElementById("productShortDescription"),
      rating: document.getElementById("productRating"),
      location: document.getElementById("productLocation"),

      galleryMainImage: document.getElementById("galleryMainImage"),
      galleryThumbs: document.getElementById("galleryThumbs"),

      description: document.getElementById("productDescription"),
      highlights: document.getElementById("productHighlights"),

      duration: document.getElementById("productDuration"),
      destination: document.getElementById("productDestination"),
      difficulty: document.getElementById("productDifficulty"),
      languageCard: document.getElementById("languageDetailCard"),
      language: document.getElementById("productLanguage"),

      includes: document.getElementById("productIncludes"),
      excludes: document.getElementById("productExcludes"),
      itinerary: document.getElementById("productItinerary"),
      availability: document.getElementById("productAvailability"),

      price: document.getElementById("productPrice"),
      priceNote: document.getElementById("productPriceNote"),

      bookingDuration: document.getElementById("bookingDuration"),
      bookingLocation: document.getElementById("bookingLocation"),
      bookingDifficulty: document.getElementById("bookingDifficulty"),

      whatsappButton: document.getElementById("whatsappButton")
    };

    this.init();
  }

  async init() {
    if (!this.slug) {
      this.showError();
      return;
    }

    await this.loadTours();
    this.currentTour = this.findTourBySlug(this.slug);

    if (!this.currentTour) {
      this.showError();
      return;
    }

    this.renderProduct();
    this.showContent();
  }

  getSlugFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  async loadTours() {
    const sources = [
      "./assets/data/tours.json",
      "./assets/data/tours-peru-catalog.json",
      "./assets/data/tours-peru-batch-01.json",
      "./assets/data/tours-peru-batch-02.json",
      "./assets/data/tours-reservas-peru.json",
      "./assets/data/packages-peru.json"
    ];

    const productsBySlug = new Map();

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data.tours) ? data.tours : Array.isArray(data.products) ? data.products : Array.isArray(data.packages) ? data.packages : [];
      })
    );

    results.forEach((result) => {
      if (result.status !== "fulfilled") return;
      result.value.forEach((tour) => {
        if (tour?.slug && !productsBySlug.has(tour.slug)) {
          productsBySlug.set(tour.slug, tour);
        }
      });
    });

    this.tours = Array.from(productsBySlug.values());
  }

  findTourBySlug(slug) {
    return this.tours.find((tour) => tour.slug === slug);
  }

  renderProduct() {
    const tour = this.currentTour;

    document.title = `${tour.title} | Peru Nature`;

    this.renderBasicInfo(tour);
    this.renderGallery(tour);
    this.renderDescription(tour);
    this.renderHighlights(tour);
    this.renderDetails(tour);
    this.renderIncludes(tour);
    this.renderExcludes(tour);
    this.renderItinerary(tour);
    this.renderAvailability(tour);
    this.renderBookingCard(tour);
    this.renderWhatsAppButton(tour);
  }

  renderBasicInfo(tour) {
    this.setText(this.elements.breadcrumbTitle, tour.title);
    this.setText(this.elements.title, tour.title);
    this.setText(this.elements.shortDescription, tour.shortDescription || "");
    this.setText(this.elements.location, tour.location || tour.destination || "Perú");

    this.renderBadges(tour);
    this.renderRating(tour);
  }

  renderBadges(tour) {
    if (!this.elements.badges) return;

    const badges = [];

    if (tour.featured) {
      badges.push(`
        <span class="product-badge">
          <i class="fa-solid fa-star"></i>
          Destacado
        </span>
      `);
    }

    if (tour.destination) {
      badges.push(`
        <span class="product-badge">
          <i class="fa-solid fa-location-dot"></i>
          ${this.escapeHTML(this.formatText(tour.destination))}
        </span>
      `);
    }

    if (Array.isArray(tour.categories) && tour.categories.length > 0) {
      badges.push(`
        <span class="product-badge">
          <i class="fa-solid fa-leaf"></i>
          ${this.escapeHTML(this.formatText(tour.categories[0]))}
        </span>
      `);
    }

    this.elements.badges.innerHTML = badges.join("");
  }

  renderRating(tour) {
    if (!this.elements.rating) return;

    const ratingValue = tour.rating?.average || tour.rating?.score || tour.rating || null;
    const reviews = tour.rating?.reviews || tour.rating?.count || null;

    if (!ratingValue) {
      this.elements.rating.innerHTML = `
        <i class="fa-solid fa-star"></i>
        <span>Nuevo tour</span>
      `;
      return;
    }

    this.elements.rating.innerHTML = `
      <i class="fa-solid fa-star"></i>
      <span>${ratingValue}</span>
      ${reviews ? `<small>(${reviews} reseñas)</small>` : ""}
    `;
  }

  renderGallery(tour) {
    const images = this.normalizeImages(tour.images);

    if (!this.elements.galleryMainImage || !this.elements.galleryThumbs) return;

    const firstImage = images[0];

    this.elements.galleryMainImage.src = firstImage.src;
    this.elements.galleryMainImage.alt = firstImage.alt;

    this.elements.galleryThumbs.innerHTML = images
      .slice(0, 4)
      .map((image, index) => {
        return `
          <img
            src="${this.escapeHTML(image.src)}"
            alt="${this.escapeHTML(image.alt)}"
            class="gallery-thumb ${index === 0 ? "active" : ""}"
            data-index="${index}"
          />
        `;
      })
      .join("");

    this.elements.galleryThumbs.querySelectorAll(".gallery-thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const index = Number(thumb.dataset.index);
        const selectedImage = images[index];

        this.elements.galleryMainImage.src = selectedImage.src;
        this.elements.galleryMainImage.alt = selectedImage.alt;

        this.elements.galleryThumbs
          .querySelectorAll(".gallery-thumb")
          .forEach((item) => item.classList.remove("active"));

        thumb.classList.add("active");
      });
    });
  }

  normalizeImages(images) {
    const placeholder = {
      src: "./assets/img/placeholder/tour-placeholder.jpg",
      alt: "Experiencia Peru Nature"
    };

    if (!images) return [placeholder];

    if (typeof images === "string") {
      return [{ src: images, alt: "Imagen principal de la experiencia" }];
    }

    if (images && !Array.isArray(images) && typeof images === "object") {
      const normalized = [];

      if (images.cover) {
        normalized.push({
          src: images.cover,
          alt: images.alt || images.title || "Imagen principal de la experiencia"
        });
      }

      if (Array.isArray(images.gallery)) {
        images.gallery.forEach((image, index) => {
          if (typeof image === "string") {
            normalized.push({ src: image, alt: `Imagen ${index + 1} de la experiencia` });
            return;
          }

          if (image && typeof image === "object") {
            normalized.push({
              src: image.src || image.url || placeholder.src,
              alt: image.alt || image.title || `Imagen ${index + 1} de la experiencia`
            });
          }
        });
      }

      return normalized.length ? normalized : [placeholder];
    }

    if (!Array.isArray(images) || images.length === 0) {
      return [placeholder];
    }

    return images.map((image, index) => {
      if (typeof image === "string") {
        return {
          src: image,
          alt: `Imagen ${index + 1} de la experiencia`
        };
      }

      return {
        src: image.src || image.url || image.cover || placeholder.src,
        alt: image.alt || image.title || `Imagen ${index + 1} de la experiencia`
      };
    });
  }

  renderDescription(tour) {
    this.setText(
      this.elements.description,
      tour.description || tour.shortDescription || "Pronto agregaremos más información sobre esta experiencia."
    );
  }

  renderHighlights(tour) {
    if (!this.elements.highlights) return;

    const highlights = Array.isArray(tour.highlights) ? tour.highlights : [];

    if (highlights.length === 0) {
      this.elements.highlights.innerHTML = `
        <div class="highlight-item">
          <i class="fa-solid fa-check"></i>
          <span>Experiencia seleccionada por Peru Nature.</span>
        </div>
      `;
      return;
    }

    this.elements.highlights.innerHTML = highlights
      .map((item) => {
        return `
          <div class="highlight-item">
            <i class="fa-solid fa-check"></i>
            <span>${this.escapeHTML(item)}</span>
          </div>
        `;
      })
      .join("");
  }

  renderDetails(tour) {
    this.setText(this.elements.duration, this.formatDuration(tour.duration));
    this.setText(this.elements.destination, this.formatText(tour.destination || "Perú"));
    this.setText(this.elements.difficulty, this.formatText(tour.difficulty || "Por confirmar"));

    const language = tour.language || tour.languages;

    if (!language && this.elements.languageCard) {
      this.elements.languageCard.classList.add("hidden");
      return;
    }

    if (Array.isArray(language)) {
      this.setText(this.elements.language, language.join(", "));
    } else {
      this.setText(this.elements.language, language || "Español");
    }
  }

  renderIncludes(tour) {
    if (!this.elements.includes) return;

    const includes = Array.isArray(tour.includes) ? tour.includes : [];

    if (includes.length === 0) {
      this.elements.includes.innerHTML = `
        <li>
          <i class="fa-solid fa-check"></i>
          <span>Información por confirmar.</span>
        </li>
      `;
      return;
    }

    this.elements.includes.innerHTML = includes
      .map((item) => {
        return `
          <li>
            <i class="fa-solid fa-check"></i>
            <span>${this.escapeHTML(item)}</span>
          </li>
        `;
      })
      .join("");
  }

  renderExcludes(tour) {
    if (!this.elements.excludes) return;

    const excludes = Array.isArray(tour.excludes) ? tour.excludes : [];

    if (excludes.length === 0) {
      this.elements.excludes.innerHTML = `
        <li>
          <i class="fa-solid fa-xmark"></i>
          <span>Gastos personales no especificados.</span>
        </li>
      `;
      return;
    }

    this.elements.excludes.innerHTML = excludes
      .map((item) => {
        return `
          <li>
            <i class="fa-solid fa-xmark"></i>
            <span>${this.escapeHTML(item)}</span>
          </li>
        `;
      })
      .join("");
  }

  renderItinerary(tour) {
    if (!this.elements.itinerary) return;

    const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];

    if (itinerary.length === 0) {
      this.elements.itinerary.innerHTML = `
        <div class="itinerary-item">
          <div class="itinerary-number">1</div>
          <div class="itinerary-content">
            <h3>Itinerario por confirmar</h3>
            <p>Te compartiremos el detalle completo al momento de la consulta.</p>
          </div>
        </div>
      `;
      return;
    }

    this.elements.itinerary.innerHTML = itinerary
      .map((item, index) => {
        const title = item.title || item.time || `Parada ${index + 1}`;
        const description = item.description || item.activity || item.text || "";

        return `
          <div class="itinerary-item">
            <div class="itinerary-number">${index + 1}</div>
            <div class="itinerary-content">
              <h3>${this.escapeHTML(title)}</h3>
              <p>${this.escapeHTML(description)}</p>
            </div>
          </div>
        `;
      })
      .join("");
  }

  renderAvailability(tour) {
    if (!this.elements.availability) return;

    const availability = tour.availability;

    let items = [];

    if (Array.isArray(availability)) {
      items = availability;
    } else if (availability?.times && Array.isArray(availability.times)) {
      items = availability.times;
    } else if (availability?.schedule && Array.isArray(availability.schedule)) {
      items = availability.schedule;
    } else if (availability?.days && Array.isArray(availability.days)) {
      items = availability.days;
    }

    if (items.length === 0) {
      this.elements.availability.innerHTML = `
        <span class="availability-pill">
          <i class="fa-regular fa-calendar"></i>
          Consultar disponibilidad
        </span>
      `;
      return;
    }

    this.elements.availability.innerHTML = items
      .map((item) => {
        const value = typeof item === "string" ? item : item.time || item.day || item.label || "Consultar";

        return `
          <span class="availability-pill">
            <i class="fa-regular fa-calendar"></i>
            ${this.escapeHTML(value)}
          </span>
        `;
      })
      .join("");
  }

  renderBookingCard(tour) {
    const price = this.formatPrice(tour.pricing);

    this.setText(this.elements.price, price);
    this.setText(this.elements.priceNote, this.getPriceNote(tour.pricing));

    this.setText(this.elements.bookingDuration, this.formatDuration(tour.duration));
    this.setText(this.elements.bookingLocation, tour.location || tour.destination || "Perú");
    this.setText(this.elements.bookingDifficulty, this.formatText(tour.difficulty || "Por confirmar"));
  }

  renderWhatsAppButton(tour) {
    if (!this.elements.whatsappButton) return;

    const message = [
      "Hola Peru Nature, quiero información sobre esta experiencia:",
      "",
      `Tour: ${tour.title}`,
      `Destino: ${this.formatText(tour.destination || "Perú")}`,
      `Duración: ${this.formatDuration(tour.duration)}`,
      `Precio: ${this.formatPrice(tour.pricing)}`,
      "",
      "¿Me pueden confirmar disponibilidad y tarifas actualizadas?"
    ].join("\n");

    const encodedMessage = encodeURIComponent(message);

    this.elements.whatsappButton.href = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
  }

  formatPrice(pricing) {
    if (!pricing) return "Consultar";

    const currency = pricing.currency || "USD";
    const symbol = this.getCurrencySymbol(currency);

    const amount =
      pricing.from ||
      pricing.amount ||
      pricing.price ||
      pricing.adult ||
      pricing.basePrice ||
      null;

    if (!amount) return "Consultar";

    return `${symbol}${amount}`;
  }

  getPriceNote(pricing) {
    if (!pricing) return "precio por confirmar";

    if (pricing.note) return pricing.note;
    if (pricing.perPerson === false) return "precio por servicio";

    return "por persona";
  }

  getCurrencySymbol(currency) {
    const value = String(currency).toUpperCase();

    if (value === "USD") return "$";
    if (value === "PEN" || value === "SOLES") return "S/";
    if (value === "EUR") return "€";

    return `${currency} `;
  }

  formatDuration(duration) {
    if (!duration) return "Por confirmar";

    if (typeof duration === "string") return duration;

    if (typeof duration === "number") {
      return `${duration} horas`;
    }

    if (duration.label) return duration.label;

    if (duration.days && duration.hours) {
      return `${duration.days} día${duration.days > 1 ? "s" : ""} y ${duration.hours} hora${duration.hours > 1 ? "s" : ""}`;
    }

    if (duration.days) {
      return `${duration.days} día${duration.days > 1 ? "s" : ""}`;
    }

    if (duration.hours) {
      return `${duration.hours} hora${duration.hours > 1 ? "s" : ""}`;
    }

    return "Por confirmar";
  }

  formatText(value) {
    if (!value) return "";

    return String(value)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  setText(element, value) {
    if (!element) return;
    element.textContent = value || "";
  }

  escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  showContent() {
    this.elements.loading?.classList.add("hidden");
    this.elements.error?.classList.add("hidden");
    this.elements.content?.classList.remove("hidden");
  }

  showError() {
    this.elements.loading?.classList.add("hidden");
    this.elements.content?.classList.add("hidden");
    this.elements.error?.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PeruNatureProductPage();
});
