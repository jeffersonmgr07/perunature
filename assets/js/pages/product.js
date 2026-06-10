/* =========================================================
   PRODUCT PAGE | Peru Nature
   Carga dinámica de detalle + reserva con pasajeros, hotel y PayPal
========================================================= */

class PeruNatureProductPage {
  constructor() {
    this.tours = [];
    this.packageHotels = {};
    this.coupons = [];
    this.currentTour = null;
    this.whatsappNumber = "51929715296";
    this.reservationCode = "";
    this.paypalRenderedKey = "";
    this.paypalRendering = false;
    this.pendingHotelId = "";
    this.reservationEndpoint = window.PN_APPS_SCRIPT_URL || ""; // Pega aquí tu URL Web App de Google Apps Script para guardar reservas.
    this.couponEndpoint = window.PN_APPS_SCRIPT_URL || ""; // Opcional: misma URL Web App para validar cupones desde Google Sheets.
    this.booking = {
      adults: 2,
      children: 0,
      discountPercent: 0,
      coupon: "",
      selectedHotelId: "",
      selectedRoomKey: "",
      date: "",
      time: ""
    };

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
      bookingForm: document.getElementById("bookingForm"),
      bookingDate: document.getElementById("bookingDate"),
      bookingTime: document.getElementById("bookingTime"),
      adultsCount: document.getElementById("adultsCount"),
      childrenCount: document.getElementById("childrenCount"),
      adultsTotal: document.getElementById("adultsTotal"),
      childrenTotal: document.getElementById("childrenTotal"),
      discountRow: document.getElementById("discountRow"),
      discountTotal: document.getElementById("discountTotal"),
      bookingTotal: document.getElementById("bookingTotal"),
      coupon: document.getElementById("bookingCoupon"),
      applyDiscountBtn: document.getElementById("applyDiscountBtn"),
      discountMessage: document.getElementById("discountMessage"),
      hotelSidebarRow: document.getElementById("hotelSidebarRow"),
      hotelSidebarTotal: document.getElementById("hotelSidebarTotal"),
      whatsappButton: document.getElementById("whatsappButton"),
      productPrintBtn: document.getElementById("productPrintBtn"),
      productHotelSection: document.getElementById("hoteles"),
      productHotelOptions: document.getElementById("productHotelOptions"),
      roomModal: document.getElementById("roomModal"),
      roomModalTitle: document.getElementById("roomModalTitle"),
      roomModalSubtitle: document.getElementById("roomModalSubtitle"),
      productRoomOptions: document.getElementById("productRoomOptions"),

      modal: document.getElementById("reservationModal"),
      modalTitle: document.getElementById("reservationModalTitle"),
      reservationCodeLabel: document.getElementById("reservationCodeLabel"),
      modalBookingDate: document.getElementById("modalBookingDate"),
      modalBookingTime: document.getElementById("modalBookingTime"),
      modalAdultsCount: document.getElementById("modalAdultsCount"),
      modalChildrenCount: document.getElementById("modalChildrenCount"),
      hotelBlock: document.getElementById("hotelSelectionBlock"),
      hotelNightsLabel: document.getElementById("hotelNightsLabel"),
      hotelOptions: document.getElementById("hotelOptions"),
      roomOptions: document.getElementById("roomOptions"),
      passengerForms: document.getElementById("passengerForms"),
      modalBookingSummary: document.getElementById("modalBookingSummary"),
      paypalButtons: document.getElementById("paypalButtons"),
      paypalStatus: document.getElementById("paypalStatus"),
      printItineraryBtn: document.getElementById("printItineraryBtn"),
      modalWhatsappBtn: document.getElementById("modalWhatsappBtn")
    };

    this.init();
  }

  async init() {
    if (!this.slug) {
      this.showError();
      return;
    }

    await Promise.all([this.loadTours(), this.loadPackageHotels(), this.loadCoupons()]);
    this.currentTour = this.findTourBySlug(this.slug);

    if (!this.currentTour) {
      this.showError();
      return;
    }

    this.renderProduct();
    this.bindReservationModal();
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

  async loadPackageHotels() {
    try {
      const response = await fetch("./assets/data/package-hotels.json", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      this.packageHotels = data.destinations || {};
    } catch (error) {
      console.warn("[Peru Nature] No se pudo cargar package-hotels.json", error);
      this.packageHotels = {};
    }
  }

  async loadCoupons() {
    try {
      const response = await fetch("./assets/data/coupons.json", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      this.coupons = Array.isArray(data.coupons) ? data.coupons : [];
    } catch (error) {
      console.warn("[Peru Nature] No se pudo cargar coupons.json", error);
      this.coupons = [];
    }
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
    this.renderProductHotelOptions();
    this.renderAvailability(tour);
    this.renderBookingCard(tour);
    this.initBookingPanel(tour);
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

    if (tour.productKind === "package") {
      badges.push(`
        <span class="product-badge">
          <i class="fa-solid fa-suitcase-rolling"></i>
          Paquete
        </span>
      `);
    }

    this.elements.badges.innerHTML = badges.join("");
  }

  renderRating(tour) {
    if (!this.elements.rating) return;

    const ratingValue = tour.rating?.average || tour.rating?.score || tour.rating || null;
    const reviews = tour.rating?.reviews || tour.rating?.reviewsCount || tour.rating?.count || null;

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
            onerror="this.src='./assets/img/tour-placeholder.jpg'"
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
      src: "./assets/img/tour-placeholder.jpg",
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

    if (!Array.isArray(images) || images.length === 0) return [placeholder];

    return images.map((image, index) => {
      if (typeof image === "string") {
        return { src: image, alt: `Imagen ${index + 1} de la experiencia` };
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
      tour.description || tour.shortDescription || "Te compartiremos más detalles y recomendaciones al momento de confirmar tu viaje."
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
    this.setText(this.elements.difficulty, this.formatDifficulty(tour.difficulty || "Por confirmar"));

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
    const tourImages = this.normalizeImages(tour.images).map((image) => image.src).filter(Boolean);

    if (itinerary.length === 0) {
      const fallbackImage = tourImages[0] || "./assets/img/tour-placeholder.jpg";
      this.elements.itinerary.innerHTML = `
        <div class="itinerary-item itinerary-item--with-image">
          <div class="itinerary-number">1</div>
          <div class="itinerary-content">
            <h3>Itinerario por confirmar</h3>
            <p>Te compartiremos el detalle completo al momento de la consulta.</p>
          </div>
          <figure class="itinerary-image">
            <img src="${this.escapeHTML(fallbackImage)}" alt="Itinerario Peru Nature" onerror="this.src='./assets/img/tour-placeholder.jpg'">
          </figure>
        </div>
      `;
      return;
    }

    this.elements.itinerary.innerHTML = itinerary
      .map((item, index) => {
        const title = item.title || item.time || `Parada ${index + 1}`;
        const day = item.time || `Día ${index + 1}`;
        const description = item.description || item.activity || item.text || "";
        const details = Array.isArray(item.details) ? item.details : [];
        const imageSrc = this.getItineraryImage(item, index, tourImages);
        const extras = [
          item.distance ? `<span><i class="fa-solid fa-route"></i>${this.escapeHTML(item.distance)}</span>` : "",
          item.meals ? `<span><i class="fa-solid fa-utensils"></i>${this.escapeHTML(item.meals)}</span>` : ""
        ].filter(Boolean).join("");

        return `
          <div class="itinerary-item itinerary-item--with-image">
            <div class="itinerary-number">${this.escapeHTML(day).replace(/^Día\s*/i, "")}</div>
            <div class="itinerary-content">
              <h3>${this.escapeHTML(day)}: ${this.escapeHTML(title)}</h3>
              <p>${this.escapeHTML(description)}</p>
              ${details.length ? `<ul class="itinerary-details">${details.map((detail) => `<li>${this.escapeHTML(detail)}</li>`).join("")}</ul>` : ""}
              ${extras ? `<div class="itinerary-extra">${extras}</div>` : ""}
            </div>
            ${imageSrc ? `
              <figure class="itinerary-image">
                <img src="${this.escapeHTML(imageSrc)}" alt="${this.escapeHTML(title)}" onerror="this.src='./assets/img/tour-placeholder.jpg'">
              </figure>
            ` : ""}
          </div>
        `;
      })
      .join("");
  }

  renderAvailability(tour) {
    if (!this.elements.availability) return;

    const items = this.extractAvailabilityItems(tour);

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
    this.setText(this.elements.bookingDifficulty, this.formatDifficulty(tour.difficulty || "Por confirmar"));
    this.renderBookingTimeOptions(tour);
    this.updateBookingTotals();
  }

  renderBookingTimeOptions(tour) {
    const times = this.extractAvailabilityItems(tour).map((item) => {
      if (typeof item === "string") return item;
      return item.time || item.label || item.day || "Consultar horario";
    });

    const uniqueTimes = [...new Set(times.length ? times : ["Consultar horario"] )];
    const html = `
      <option value="">${this.getTranslation("booking.selectTime", "Selecciona un horario")}</option>
      ${uniqueTimes.map((time) => `<option value="${this.escapeHTML(time)}">${this.escapeHTML(time)}</option>`).join("")}
    `;

    if (this.elements.bookingTime) this.elements.bookingTime.innerHTML = html;
    if (this.elements.modalBookingTime) this.elements.modalBookingTime.innerHTML = html;
  }

  initBookingPanel(tour) {
    if (this.bookingPanelReady || !this.elements.bookingForm) return;
    this.bookingPanelReady = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 3);
    const minDate = this.formatDateInput(today);
    if (this.elements.bookingDate) {
      this.elements.bookingDate.min = minDate;
      if (this.elements.bookingDate.value && this.elements.bookingDate.value < minDate) this.elements.bookingDate.value = "";
    }
    if (this.elements.modalBookingDate) {
      this.elements.modalBookingDate.min = minDate;
      if (this.elements.modalBookingDate.value && this.elements.modalBookingDate.value < minDate) this.elements.modalBookingDate.value = "";
    }

    document.querySelectorAll(".booking-form .qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target;
        const action = button.dataset.action;
        this.changeTravelers(target, action);
      });
    });

    this.elements.productPrintBtn?.addEventListener("click", () => this.printItinerary());
    this.elements.applyDiscountBtn?.addEventListener("click", () => this.applyDiscountCoupon());
    this.elements.coupon?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.applyDiscountCoupon();
      }
    });

    this.elements.bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.openReservationModal(tour);
    });
  }

  bindReservationModal() {
    if (this.modalReady || !this.elements.modal) return;
    this.modalReady = true;

    this.elements.modal.querySelectorAll("[data-close-reservation]").forEach((button) => {
      button.addEventListener("click", () => this.closeReservationModal());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.elements.modal.classList.contains("hidden")) {
        this.closeReservationModal();
      }
    });

    this.elements.roomModal?.querySelectorAll("[data-close-room-modal]").forEach((button) => {
      button.addEventListener("click", () => this.closeRoomModal());
    });

    this.elements.printItineraryBtn?.addEventListener("click", () => this.printItinerary());
    this.elements.modalWhatsappBtn?.addEventListener("click", () => {
      if (!this.validatePrimaryPassengerData(true)) return;
      this.saveReservationToGoogleSheet({ paymentStatus: "pending", paypalId: "" });
      this.sendBookingToWhatsApp(this.currentTour, true);
    });
  }

  changeTravelers(target, action) {
    const min = target === "adults" ? 1 : 0;
    const current = this.booking[target] || 0;
    this.booking[target] = action === "plus" ? current + 1 : Math.max(min, current - 1);
    this.ensureSelectedRoomStillValid();
    this.renderProductHotelOptions();
    this.updateBookingTotals();
  }

  async applyDiscountCoupon() {
    const coupon = String(this.elements.coupon?.value || "").trim().toUpperCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!coupon) {
      this.booking.discountPercent = 0;
      this.booking.coupon = "";
      this.setText(this.elements.discountMessage, "Ingresa un cupón para validar.");
      this.updateBookingTotals();
      return;
    }

    let found = null;
    let sheetStatus = "";

    if (this.couponEndpoint) {
      try {
        const couponBase = this.calculateTotals();
        const destination = this.currentTour?.hotelAddOn?.destination || this.currentTour?.destination || "";
        const url = `${this.couponEndpoint}?action=coupon&code=${encodeURIComponent(coupon)}&destination=${encodeURIComponent(destination)}&subtotal=${encodeURIComponent(couponBase.subtotal || 0)}`;
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();
        if (data.ok) found = { code: data.code, percent: data.percent, expiresAt: data.expiresAt, active: true };
        else sheetStatus = data.status || "not_found";
      } catch (error) {
        console.warn("[Peru Nature] No se pudo validar cupón en Google Sheets. Se usará coupons.json.", error);
      }
    }

    if (!found) {
      found = this.coupons.find((item) => String(item.code || "").trim().toUpperCase() === coupon && item.active !== false);
    }

    if (!found) {
      this.booking.discountPercent = 0;
      this.booking.coupon = "";
      this.setText(this.elements.discountMessage, sheetStatus === "expired" ? "Este cupón ya está caducado." : "Cupón no válido para esta experiencia.");
    } else if (found.expiresAt && new Date(`${found.expiresAt}T23:59:59`) < today) {
      this.booking.discountPercent = 0;
      this.booking.coupon = "";
      this.setText(this.elements.discountMessage, "Este cupón ya está caducado.");
    } else {
      this.booking.discountPercent = Number(found.percent || 0);
      this.booking.coupon = coupon;
      this.setText(this.elements.discountMessage, `Cupón aplicado: ${this.booking.discountPercent}% de descuento.`);
    }
    this.updateBookingTotals();
  }

  updateBookingTotals() {
    const totals = this.calculateTotals();

    this.setText(this.elements.adultsCount, this.booking.adults);
    this.setText(this.elements.childrenCount, this.booking.children);
    this.setText(this.elements.modalAdultsCount, this.booking.adults);
    this.setText(this.elements.modalChildrenCount, this.booking.children);
    this.setText(this.elements.adultsTotal, this.formatMoney(totals.adultsSubtotal, totals.currency));
    this.setText(this.elements.childrenTotal, this.formatMoney(totals.childrenSubtotal, totals.currency));
    this.setText(this.elements.discountTotal, `- ${this.formatMoney(totals.discount, totals.currency)}`);
    this.setText(this.elements.hotelSidebarTotal, this.formatMoney(totals.hotelSubtotal, totals.currency));
    this.setText(this.elements.bookingTotal, this.formatMoney(totals.total, totals.currency));

    if (this.elements.hotelSidebarRow) this.elements.hotelSidebarRow.hidden = totals.hotelSubtotal <= 0;
    if (this.elements.discountRow) this.elements.discountRow.hidden = totals.discount <= 0;

    this.renderModalSummary(totals);
    this.schedulePayPalRender();
  }

  calculateTotals() {
    const tour = this.currentTour || {};
    const currency = tour?.pricing?.currency || "USD";
    const basePrice = this.getBasePrice(tour?.pricing);
    const childPrice = Math.round(basePrice * 0.7);
    const adultsSubtotal = this.booking.adults * basePrice;
    const childrenSubtotal = this.booking.children * childPrice;
    const roomCombo = this.getSelectedRoomCombo();
    const hotel = this.getSelectedHotel();
    const hotelNights = this.getHotelNights();
    const hotelSubtotal = hotel && roomCombo ? this.getRoomComboPrice(roomCombo, hotel) * hotelNights : 0;
    const subtotal = adultsSubtotal + childrenSubtotal + hotelSubtotal;
    const discountableSubtotal = subtotal;
    const discount = Math.round(discountableSubtotal * (this.booking.discountPercent / 100) * 100) / 100;
    const total = Math.max(0, subtotal - discount);

    return { currency, basePrice, childPrice, adultsSubtotal, childrenSubtotal, hotelSubtotal, subtotal, discount, total, hotel, roomCombo, hotelNights };
  }

  openReservationModal(tour) {
    if (!this.elements.modal) return;

    if (!this.reservationCode) this.reservationCode = this.createReservationCode();
    this.setText(this.elements.reservationCodeLabel, `Código de reserva: ${this.reservationCode}`);
    this.setText(this.elements.modalTitle, "Datos de tu reserva");

    this.renderPassengerForms();
    this.updateBookingTotals();

    this.elements.modal.classList.remove("hidden");
    this.elements.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    this.schedulePayPalRender(true);
  }

  closeReservationModal() {
    if (!this.elements.modal) return;
    this.elements.modal.classList.add("hidden");
    this.elements.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }


  renderProductHotelOptions() {
    const section = this.elements.productHotelSection;
    const container = this.elements.productHotelOptions;
    if (!section || !container) return;

    const hotels = this.getHotelOptionsForTour();
    const nights = this.getHotelNights();
    if (!hotels.length || nights <= 0) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    container.innerHTML = hotels.map((hotel) => {
      const minRate = this.getHotelMinRate(hotel);
      const selected = hotel.id === this.booking.selectedHotelId;
      const roomCombo = selected ? this.getSelectedRoomCombo() : null;
      const comboText = selected && roomCombo
        ? `${roomCombo.label} · ${this.formatMoney(this.getRoomComboPrice(roomCombo, hotel) * nights, "USD")} por ${nights} noche${nights > 1 ? "s" : ""}`
        : `Desde ${this.formatMoney(minRate * nights, "USD")} por ${nights} noche${nights > 1 ? "s" : ""}`;
      const includes = Array.isArray(hotel.includes) && hotel.includes.length
        ? `<ul>${hotel.includes.slice(0, 5).map((item) => `<li>${this.escapeHTML(item)}</li>`).join("")}</ul>`
        : "";
      return `
        <article class="product-hotel-card ${selected ? "selected" : ""}">
          <div class="product-hotel-copy">
            <span class="product-hotel-tier">${this.escapeHTML(hotel.tier || hotel.category || "Hotel")}</span>
            <h3>${this.escapeHTML(hotel.name)}</h3>
            <p>${this.escapeHTML(hotel.description || "")}</p>
            ${includes}
          </div>
          <div class="product-hotel-price">
            ${this.renderHotelGallery(hotel)}
            <strong>${this.escapeHTML(comboText)}</strong>
            ${selected ? `<small>Hotel seleccionado</small>` : ""}
            <button type="button" class="booking-whatsapp-btn product-hotel-select" data-hotel-id="${this.escapeHTML(hotel.id)}">
              ${selected ? "Editar acomodación" : "Ver acomodaciones"}
            </button>
          </div>
        </article>
      `;
    }).join("");

    container.querySelectorAll("[data-hotel-id]").forEach((button) => {
      button.addEventListener("click", () => this.openRoomModal(button.dataset.hotelId));
    });

    container.querySelectorAll("[data-hotel-gallery]").forEach((gallery) => {
      const slides = [...gallery.querySelectorAll("[data-hotel-slide]")];
      const dots = [...gallery.querySelectorAll("[data-hotel-dot]")];
      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const index = Number(dot.dataset.hotelDot || 0);
          slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
          dots.forEach((item, dotIndex) => item.classList.toggle("active", dotIndex === index));
        });
      });
    });
  }

  openRoomModal(hotelId) {
    const hotel = this.getHotelOptionsForTour().find((item) => item.id === hotelId);
    if (!hotel || !this.elements.roomModal) return;
    this.pendingHotelId = hotelId;
    this.setText(this.elements.roomModalTitle, hotel.name);
    this.setText(this.elements.roomModalSubtitle, `${hotel.category || "Hotel"}. Tarifas calculadas para ${this.getHotelNights()} noche(s) y ${this.getTravelerCount()} viajero(s).`);
    this.renderProductRoomOptions(hotel);
    this.elements.roomModal.classList.remove("hidden");
    this.elements.roomModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  closeRoomModal() {
    if (!this.elements.roomModal) return;
    this.elements.roomModal.classList.add("hidden");
    this.elements.roomModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = this.elements.modal && !this.elements.modal.classList.contains("hidden") ? "hidden" : "";
  }

  renderProductRoomOptions(hotel) {
    if (!this.elements.productRoomOptions) return;
    const nights = this.getHotelNights();
    const combos = this.getRoomCombinations(this.getTravelerCount());
    this.elements.productRoomOptions.innerHTML = combos.map((combo) => {
      const nightly = this.getRoomComboPrice(combo, hotel);
      const selected = hotel.id === this.booking.selectedHotelId && combo.key === this.booking.selectedRoomKey;
      return `
        <label class="pn-room-card ${selected ? "selected" : ""}">
          <input type="radio" name="productRoomOption" value="${this.escapeHTML(combo.key)}" ${selected ? "checked" : ""}>
          <span>
            <strong>${this.escapeHTML(combo.label)}</strong>
            <small>${this.escapeHTML(combo.description)}</small>
          </span>
          <em>${this.formatMoney(nightly * nights, "USD")} total</em>
        </label>
      `;
    }).join("");

    this.elements.productRoomOptions.querySelectorAll("input[name='productRoomOption']").forEach((input) => {
      input.addEventListener("change", () => {
        this.booking.selectedHotelId = hotel.id;
        this.booking.selectedRoomKey = input.value;
        this.renderProductHotelOptions();
        this.updateBookingTotals();
        this.closeRoomModal();
      });
    });
  }

  ensureSelectedRoomStillValid() {
    if (!this.booking.selectedRoomKey) return;
    const combos = this.getRoomCombinations(this.getTravelerCount());
    if (!combos.some((combo) => combo.key === this.booking.selectedRoomKey)) {
      this.booking.selectedRoomKey = "";
    }
  }

  renderHotelSelection() {
    const options = this.getHotelOptionsForTour();
    const nights = this.getHotelNights();

    if (!this.elements.hotelBlock || !this.elements.hotelOptions || !this.elements.roomOptions) return;

    if (!options.length || nights <= 0) {
      this.elements.hotelBlock.hidden = true;
      this.booking.selectedHotelId = "";
      this.booking.selectedRoomKey = "";
      return;
    }

    this.elements.hotelBlock.hidden = false;
    this.setText(this.elements.hotelNightsLabel, `Alojamiento opcional por ${nights} noche${nights > 1 ? "s" : ""}. Tarifas por habitación y por noche.`);

    if (!this.booking.selectedHotelId || !options.some((hotel) => hotel.id === this.booking.selectedHotelId)) {
      this.booking.selectedHotelId = options[0].id;
    }

    this.elements.hotelOptions.innerHTML = options.map((hotel) => {
      const minRate = this.getHotelMinRate(hotel);
      const checked = hotel.id === this.booking.selectedHotelId ? "checked" : "";
      return `
        <label class="pn-hotel-card">
          <input type="radio" name="hotelOption" value="${this.escapeHTML(hotel.id)}" ${checked}>
          <span>
            <strong>${this.escapeHTML(hotel.name)}</strong>
            <small>${this.escapeHTML(hotel.category || "Hotel")}. ${this.escapeHTML(hotel.description || "")}</small>
          </span>
          <em>Desde ${this.formatMoney(minRate, "USD")}/noche</em>
        </label>
      `;
    }).join("");

    this.elements.hotelOptions.querySelectorAll("input[name='hotelOption']").forEach((input) => {
      input.addEventListener("change", () => {
        this.booking.selectedHotelId = input.value;
        this.booking.selectedRoomKey = "";
        this.renderRoomOptions();
        this.updateBookingTotals();
      });
    });

    this.renderRoomOptions();
  }

  renderRoomOptions() {
    const hotel = this.getSelectedHotel();
    if (!hotel || !this.elements.roomOptions) return;

    const combos = this.getRoomCombinations(this.getTravelerCount());
    if (!this.booking.selectedRoomKey || !combos.some((combo) => combo.key === this.booking.selectedRoomKey)) {
      this.booking.selectedRoomKey = combos[0]?.key || "";
    }

    this.elements.roomOptions.innerHTML = combos.map((combo) => {
      const price = this.getRoomComboPrice(combo, hotel);
      const checked = combo.key === this.booking.selectedRoomKey ? "checked" : "";
      return `
        <label class="pn-room-card">
          <input type="radio" name="roomOption" value="${this.escapeHTML(combo.key)}" ${checked}>
          <span>
            <strong>${this.escapeHTML(combo.label)}</strong>
            <small>${this.escapeHTML(combo.description)}</small>
          </span>
          <em>${this.formatMoney(price, "USD")}/noche</em>
        </label>
      `;
    }).join("");

    this.elements.roomOptions.querySelectorAll("input[name='roomOption']").forEach((input) => {
      input.addEventListener("change", () => {
        this.booking.selectedRoomKey = input.value;
        this.updateBookingTotals();
      });
    });
  }

  getHotelOptionsForTour() {
    const enabled = this.currentTour?.hotelAddOn?.enabled || this.currentTour?.productKind === "package";
    if (!enabled) return [];
    const keys = [
      this.currentTour?.hotelAddOn?.destination,
      this.currentTour?.destination,
      this.currentTour?.department,
      ...(this.currentTour?.search?.destinations || [])
    ].filter(Boolean);
    const matchedKey = keys.find((key) => this.packageHotels[key]);
    const hotelData = matchedKey ? this.packageHotels[matchedKey] : null;
    return Array.isArray(hotelData?.hotels) ? hotelData.hotels : [];
  }

  getHotelNights() {
    const nights = Number(this.currentTour?.hotelAddOn?.nights || this.currentTour?.duration?.nights || 0);
    return Math.max(0, nights);
  }

  getSelectedHotel() {
    return this.getHotelOptionsForTour().find((hotel) => hotel.id === this.booking.selectedHotelId) || null;
  }

  getSelectedRoomCombo() {
    return this.getRoomCombinations(this.getTravelerCount()).find((combo) => combo.key === this.booking.selectedRoomKey) || null;
  }

  getTravelerCount() {
    return Math.max(1, Number(this.booking.adults || 0) + Number(this.booking.children || 0));
  }

  getRoomCombinations(travelers) {
    const combosByCount = {
      1: [
        { key: "single_1", label: "1 habitación individual", description: "Una habitación simple.", rooms: { single: 1 } }
      ],
      2: [
        { key: "matrimonial_1", label: "1 habitación matrimonial", description: "Una cama matrimonial para 2 pasajeros.", rooms: { matrimonial: 1 } },
        { key: "double_1", label: "1 habitación doble", description: "Dos camas en una habitación doble.", rooms: { double: 1 } },
        { key: "single_2", label: "2 habitaciones individuales", description: "Dos habitaciones simples separadas.", rooms: { single: 2 } }
      ],
      3: [
        { key: "triple_1", label: "1 habitación triple", description: "Tres pasajeros en una habitación triple.", rooms: { triple: 1 } },
        { key: "matri_adicional_1", label: "1 matrimonial + cama adicional", description: "Una habitación matrimonial con cama adicional.", rooms: { matri_adicional: 1 } },
        { key: "double_1_single_1", label: "1 doble + 1 individual", description: "Dos pasajeros en doble y uno en simple.", rooms: { double: 1, single: 1 } },
        { key: "matrimonial_1_single_1", label: "1 matrimonial + 1 individual", description: "Pareja o dos pasajeros en matrimonial y uno en simple.", rooms: { matrimonial: 1, single: 1 } },
        { key: "single_3", label: "3 habitaciones individuales", description: "Tres habitaciones simples separadas.", rooms: { single: 3 } }
      ],
      4: [
        { key: "quadruple_1", label: "1 habitación cuádruple", description: "Cuatro pasajeros en una habitación familiar/cuádruple.", rooms: { quadruple: 1 } },
        { key: "double_2", label: "2 habitaciones dobles", description: "Dos habitaciones dobles.", rooms: { double: 2 } },
        { key: "matrimonial_1_double_1", label: "1 matrimonial + 1 doble", description: "Dos habitaciones para cuatro pasajeros.", rooms: { matrimonial: 1, double: 1 } },
        { key: "triple_1_single_1", label: "1 triple + 1 individual", description: "Una triple y una simple.", rooms: { triple: 1, single: 1 } },
        { key: "single_4", label: "4 habitaciones individuales", description: "Cuatro habitaciones simples separadas.", rooms: { single: 4 } }
      ],
      5: [
        { key: "familiar_5_1", label: "1 habitación familiar", description: "Una habitación familiar para cinco pasajeros.", rooms: { familiar_5: 1 } },
        { key: "triple_1_double_1", label: "1 triple + 1 doble", description: "Dos habitaciones para cinco pasajeros.", rooms: { triple: 1, double: 1 } },
        { key: "quadruple_1_single_1", label: "1 cuádruple + 1 individual", description: "Una habitación cuádruple y una individual.", rooms: { quadruple: 1, single: 1 } }
      ]
    };

    if (combosByCount[travelers]) return combosByCount[travelers];

    const triples = Math.floor(travelers / 3);
    const remainder = travelers % 3;
    const rooms = {};
    if (triples) rooms.triple = triples;
    if (remainder === 1) rooms.single = 1;
    if (remainder === 2) rooms.double = 1;

    const labelParts = [];
    if (rooms.triple) labelParts.push(`${rooms.triple} triple${rooms.triple > 1 ? "s" : ""}`);
    if (rooms.double) labelParts.push("1 doble");
    if (rooms.single) labelParts.push("1 individual");

    return [
      { key: `auto_${travelers}`, label: labelParts.join(" + "), description: `Combinación sugerida para ${travelers} pasajeros.`, rooms }
    ];
  }

  getRoomComboPrice(combo, hotel) {
    const roomRates = this.getHotelRoomRates(hotel);
    if (!combo || !roomRates) return 0;
    return Object.entries(combo.rooms || {}).reduce((sum, [type, qty]) => {
      return sum + Number(roomRates[type] || 0) * Number(qty || 0);
    }, 0);
  }

  getHotelRoomRates(hotel) {
    if (!hotel) return {};
    if (hotel.roomRates && Object.keys(hotel.roomRates).length) return hotel.roomRates;
    const plan = Array.isArray(hotel.ratePlans)
      ? hotel.ratePlans.find((item) => item.active !== false) || hotel.ratePlans[0]
      : null;
    return plan?.roomRates || {};
  }

  getHotelMinRate(hotel) {
    const rates = this.getHotelRoomRates(hotel);
    const values = Object.values(rates || {}).map(Number).filter((value) => value > 0);
    return values.length ? Math.min(...values) : 0;
  }

  normalizeHotelImages(hotel) {
    const fallback = "./assets/img/tours/huaraz-clasico-caminatas-cortas-cover.jpg";
    const raw = Array.isArray(hotel?.images)
      ? hotel.images
      : Array.isArray(hotel?.gallery)
        ? hotel.gallery
        : hotel?.image
          ? [hotel.image]
          : [];

    const normalized = raw
      .map((image, index) => {
        if (typeof image === "string") return { src: image, alt: `${hotel?.name || "Hotel"} ${index + 1}` };
        if (image && typeof image === "object") return { src: image.src || image.url || fallback, alt: image.alt || `${hotel?.name || "Hotel"} ${index + 1}` };
        return null;
      })
      .filter(Boolean);

    return normalized.length ? normalized.slice(0, 5) : [{ src: fallback, alt: hotel?.name || "Hotel Peru Nature" }];
  }

  renderHotelGallery(hotel) {
    const images = this.normalizeHotelImages(hotel);
    return `
      <div class="product-hotel-gallery" data-hotel-gallery>
        <div class="product-hotel-gallery__slides">
          ${images.map((image, index) => `
            <img
              class="${index === 0 ? "active" : ""}"
              data-hotel-slide="${index}"
              src="${this.escapeHTML(image.src)}"
              alt="${this.escapeHTML(image.alt)}"
              loading="lazy"
              onerror="this.src='./assets/img/tours/huaraz-clasico-caminatas-cortas-cover.jpg'"
            >
          `).join("")}
        </div>
        ${images.length > 1 ? `
          <div class="product-hotel-gallery__dots" aria-label="Fotos del hotel">
            ${images.map((_image, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-hotel-dot="${index}" aria-label="Ver foto ${index + 1}"></button>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }

  getItineraryImage(item, index, tourImages = []) {
    return item?.image || item?.imageSrc || item?.photo || item?.cover || tourImages[index + 1] || tourImages[index % Math.max(tourImages.length, 1)] || tourImages[0] || "./assets/img/tour-placeholder.jpg";
  }

  getLoggedCustomer() {
    try {
      return JSON.parse(localStorage.getItem("pn_customer") || "null") || null;
    } catch (_error) {
      return null;
    }
  }

  getCustomerValue(customer, keys, fallback = "") {
    if (!customer) return fallback;
    for (const key of keys) {
      if (customer[key]) return customer[key];
    }
    return fallback;
  }

  renderPassengerForms() {
    if (!this.elements.passengerForms) return;
    const total = this.getTravelerCount();
    const customer = this.getLoggedCustomer();
    const cards = [];

    for (let i = 1; i <= total; i += 1) {
      const isAdult = i <= this.booking.adults;
      const isHolder = i === 1 && customer;
      const isContact = i === 1;
      const firstName = isHolder ? this.getCustomerValue(customer, ["names", "firstName", "name"]) : "";
      const lastName = isHolder ? this.getCustomerValue(customer, ["lastnames", "lastName", "lastname"]) : "";
      const documentType = isHolder ? this.getCustomerValue(customer, ["documentType"]) : "";
      const documentNumber = isHolder ? this.getCustomerValue(customer, ["documentNumber"]) : "";
      const nationality = isHolder ? this.getCustomerValue(customer, ["nationality"]) : "";
      const birthdate = isHolder ? this.getCustomerValue(customer, ["birthdate"]) : "";
      const gender = isHolder ? this.getCustomerValue(customer, ["gender"]) : "";
      const language = isHolder ? this.getCustomerValue(customer, ["language"], "es") : "";
      const email = isHolder ? this.getCustomerValue(customer, ["email"]) : "";
      const whatsapp = isHolder ? this.getCustomerValue(customer, ["whatsapp", "phone"]) : "";
      const collapsed = i > 1;
      const required = i === 1 ? " required" : "";

      cards.push(`
        <article class="pn-passenger-card${collapsed ? " is-collapsed" : ""}" data-passenger-card="${i}">
          <div class="pn-passenger-card__head">
            <h4>Pasajero ${i} · ${isAdult ? "Adulto" : "Niño"}${isContact ? " · Contacto principal" : ""}${isHolder ? " · Titular" : ""}</h4>
            <button type="button" class="pn-passenger-toggle" data-passenger-toggle aria-expanded="${collapsed ? "false" : "true"}" aria-label="Desplegar o replegar pasajero ${i}">
              <i class="fa-solid fa-chevron-${collapsed ? "down" : "up"}"></i>
            </button>
          </div>
          <div class="pn-passenger-card__body">
            <div class="pn-passenger-grid">
              <label>Nombre(s)<input type="text" name="passenger_${i}_name" placeholder="Nombre completo" value="${this.escapeHTML(firstName)}"${required}></label>
              <label>Apellido(s)<input type="text" name="passenger_${i}_lastname" placeholder="Apellidos" value="${this.escapeHTML(lastName)}"${required}></label>
              <label>Tipo de documento
                <select name="passenger_${i}_doctype"${required}>
                  <option value="">Seleccionar</option>
                  <option value="DNI" ${documentType === "DNI" ? "selected" : ""}>DNI</option>
                  <option value="Pasaporte" ${documentType === "Pasaporte" ? "selected" : ""}>Pasaporte</option>
                  <option value="Carné de extranjería" ${documentType === "Carné de extranjería" ? "selected" : ""}>Carné de extranjería</option>
                </select>
              </label>
              <label>Número de documento<input type="text" name="passenger_${i}_doc" placeholder="Documento" value="${this.escapeHTML(documentNumber)}"${required}></label>
              <label>Nacionalidad<input type="text" name="passenger_${i}_nationality" placeholder="País" value="${this.escapeHTML(nationality)}"${required}></label>
              <label>Fecha de nacimiento<input type="date" name="passenger_${i}_birthdate" value="${this.escapeHTML(birthdate)}"${required}></label>
              <label>Género
                <select name="passenger_${i}_gender"${required}>
                  <option value="">Seleccionar</option>
                  <option value="Femenino" ${gender === "Femenino" ? "selected" : ""}>Femenino</option>
                  <option value="Masculino" ${gender === "Masculino" ? "selected" : ""}>Masculino</option>
                  <option value="No especifica" ${gender === "No especifica" ? "selected" : ""}>Prefiero no especificar</option>
                </select>
              </label>
              <label>Idioma
                <select name="passenger_${i}_language"${required}>
                  <option value="">Seleccionar</option>
                  <option value="es" ${language === "es" ? "selected" : ""}>Español</option>
                  <option value="en" ${language === "en" ? "selected" : ""}>English</option>
                </select>
              </label>
              ${isContact ? `
                <label>Email de contacto<input type="email" name="contact_email" placeholder="correo@ejemplo.com" value="${this.escapeHTML(email)}" required></label>
                <label>WhatsApp de contacto<input type="tel" name="contact_phone" placeholder="+51 999 999 999" value="${this.escapeHTML(whatsapp)}" required></label>
              ` : ""}
            </div>
          </div>
        </article>
      `);
    }

    this.elements.passengerForms.innerHTML = cards.join("");
    this.bindPassengerCardToggles();
    this.bindPassengerValidationWatcher();
  }

  bindPassengerCardToggles() {
    this.elements.passengerForms?.querySelectorAll("[data-passenger-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".pn-passenger-card");
        const collapsed = card?.classList.toggle("is-collapsed");
        button.setAttribute("aria-expanded", collapsed ? "false" : "true");
        const icon = button.querySelector("i");
        if (icon) icon.className = `fa-solid fa-chevron-${collapsed ? "down" : "up"}`;
      });
    });
  }

  bindPassengerValidationWatcher() {
    if (!this.elements.passengerForms) return;
    const clearIfValid = () => {
      if (this.validatePrimaryPassengerData(false)) this.setText(this.elements.paypalStatus, "");
    };
    this.elements.passengerForms.oninput = clearIfValid;
    this.elements.passengerForms.onchange = clearIfValid;
  }

  renderModalSummary(totals = this.calculateTotals()) {
    if (!this.elements.modalBookingSummary) return;
    const hotelLine = totals.hotel && totals.roomCombo
      ? `<div><span>Hotel (${totals.hotelNights} noche${totals.hotelNights > 1 ? "s" : ""})</span><strong>${this.formatMoney(totals.hotelSubtotal, totals.currency)}</strong></div>`
      : `<div><span>Hotel</span><strong>Sin alojamiento</strong></div>`;

    this.elements.modalBookingSummary.innerHTML = `
      <div><span>Código</span><strong>${this.escapeHTML(this.reservationCode || "Por generar")}</strong></div>
      <div><span>Adultos (${this.booking.adults})</span><strong>${this.formatMoney(totals.adultsSubtotal, totals.currency)}</strong></div>
      <div><span>Niños (${this.booking.children})</span><strong>${this.formatMoney(totals.childrenSubtotal, totals.currency)}</strong></div>
      ${hotelLine}
      ${totals.discount > 0 ? `<div><span>Descuento</span><strong>- ${this.formatMoney(totals.discount, totals.currency)}</strong></div>` : ""}
      <div class="booking-summary__total"><span>Total a pagar</span><strong>${this.formatMoney(totals.total, totals.currency)}</strong></div>
    `;
  }

  schedulePayPalRender(force = false) {
    if (!this.elements.paypalButtons || !this.elements.modal || this.elements.modal.classList.contains("hidden")) return;
    const totals = this.calculateTotals();
    const key = `${this.reservationCode}|${totals.total}|${this.booking.adults}|${this.booking.children}|${this.booking.selectedHotelId}|${this.booking.selectedRoomKey}`;
    if (!force && key === this.paypalRenderedKey) return;
    this.paypalRenderedKey = key;
    window.clearTimeout(this.paypalTimer);
    this.paypalTimer = window.setTimeout(() => this.renderPayPalButtons(totals), 250);
  }

  getPrimaryPassengerRequiredFields() {
    const root = this.elements.passengerForms;
    if (!root) return [];
    return [
      { label: "nombre(s)", el: root.querySelector("input[name='passenger_1_name']") },
      { label: "apellido(s)", el: root.querySelector("input[name='passenger_1_lastname']") },
      { label: "tipo de documento", el: root.querySelector("select[name='passenger_1_doctype']") },
      { label: "número de documento", el: root.querySelector("input[name='passenger_1_doc']") },
      { label: "nacionalidad", el: root.querySelector("input[name='passenger_1_nationality']") },
      { label: "fecha de nacimiento", el: root.querySelector("input[name='passenger_1_birthdate']") },
      { label: "género", el: root.querySelector("select[name='passenger_1_gender']") },
      { label: "idioma", el: root.querySelector("select[name='passenger_1_language']") },
      { label: "email de contacto", el: root.querySelector("input[name='contact_email']") },
      { label: "WhatsApp de contacto", el: root.querySelector("input[name='contact_phone']") }
    ];
  }

  validatePrimaryPassengerData(showMessage = true) {
    const missing = this.getPrimaryPassengerRequiredFields().filter((field) => !String(field.el?.value || "").trim());
    const email = this.elements.passengerForms?.querySelector("input[name='contact_email']");
    const emailValue = String(email?.value || "").trim();
    const invalidEmail = emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

    this.getPrimaryPassengerRequiredFields().forEach((field) => field.el?.classList.remove("pn-field-error"));
    email?.classList.remove("pn-field-error");

    if (!missing.length && !invalidEmail) return true;

    if (showMessage) {
      const first = missing[0]?.el || email;
      missing.forEach((field) => field.el?.classList.add("pn-field-error"));
      if (invalidEmail) email?.classList.add("pn-field-error");
      const card = first?.closest(".pn-passenger-card");
      if (card?.classList.contains("is-collapsed")) {
        const toggle = card.querySelector("[data-passenger-toggle]");
        toggle?.click();
      }
      first?.focus({ preventScroll: false });
      const message = invalidEmail
        ? "Revisa el email de contacto del pasajero 1 antes de continuar al pago."
        : `Completa los datos obligatorios del pasajero 1 antes de continuar al pago: ${missing.map((field) => field.label).join(", ")}.`;
      this.setText(this.elements.paypalStatus, message);
    }

    return false;
  }

  renderPayPalButtons(totals = this.calculateTotals()) {
    if (!this.elements.paypalButtons) return;
    this.elements.paypalButtons.innerHTML = "";

    if (!window.paypal || !window.paypal.Buttons) {
      this.setText(this.elements.paypalStatus, "PayPal no cargó todavía. Revisa la conexión o configura el Client ID de producción.");
      return;
    }

    if (this.paypalRendering) return;
    this.paypalRendering = true;
    this.setText(this.elements.paypalStatus, "");

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "pill", label: "pay" },
      onClick: (_data, actions) => {
        if (!this.validatePrimaryPassengerData(true)) return actions.reject();
        return actions.resolve();
      },
      createOrder: async (_data, actions) => {
        if (!this.validatePrimaryPassengerData(true)) {
          throw new Error("Completa los datos obligatorios del pasajero 1 antes de continuar al pago.");
        }
        const amount = Math.max(1, Number(totals.total || 0)).toFixed(2);
        if (this.reservationEndpoint) {
          try {
            const response = await fetch(this.reservationEndpoint, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({ action: "createPayPalOrder", reservation: this.buildReservationPayload({ paymentStatus: "created" }) })
            });
            const json = await response.json();
            if (json?.ok && json?.orderID) return json.orderID;
          } catch (error) {
            console.warn("[Peru Nature] PayPal server-side no disponible, se usará creación en navegador.", error);
          }
        }
        return actions.order.create({
          purchase_units: [{
            reference_id: this.reservationCode || this.createReservationCode(),
            description: String(this.currentTour?.title || "Reserva Peru Nature").slice(0, 120),
            amount: { currency_code: totals.currency || "USD", value: amount }
          }]
        });
      },
      onApprove: async (data, actions) => {
        let details = null;
        if (this.reservationEndpoint && data?.orderID) {
          try {
            const response = await fetch(this.reservationEndpoint, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({ action: "capturePayPalOrder", orderID: data.orderID, reservation: this.buildReservationPayload({ paymentStatus: "paid", paypalId: data.orderID }) })
            });
            details = await response.json();
          } catch (error) {
            console.warn("[Peru Nature] No se pudo capturar PayPal desde Apps Script. Intentando captura del navegador.", error);
          }
        }
        if (!details?.ok && actions?.order) {
          details = await actions.order.capture();
        }
        const paypalId = details?.id || details?.orderID || data?.orderID || "confirmado";
        this.setText(this.elements.paypalStatus, `Pago aprobado. ID: ${paypalId}`);
        this.saveReservationToGoogleSheet({ paymentStatus: "paid", paypalId });
      },
      onCancel: () => this.setText(this.elements.paypalStatus, "Pago cancelado. Puedes intentarlo nuevamente o consultar por WhatsApp."),
      onError: () => this.setText(this.elements.paypalStatus, "No se pudo procesar PayPal. Verifica el Client ID o intenta nuevamente.")
    });

    const renderResult = buttons.render(this.elements.paypalButtons);
    if (renderResult && typeof renderResult.finally === "function") {
      renderResult.finally(() => { this.paypalRendering = false; });
    }

    window.setTimeout(() => { this.paypalRendering = false; }, 1200);
  }

  sendBookingToWhatsApp(tour, fromModal = false) {
    const totals = this.calculateTotals();
    const hotelText = totals.hotel && totals.roomCombo
      ? `${totals.hotel.name} / ${totals.roomCombo.label} / ${totals.hotelNights} noches`
      : "Sin alojamiento agregado";

    const message = [
      "Hola Peru Nature, quiero reservar esta experiencia:",
      "",
      `Código: ${this.reservationCode || this.createReservationCode()}`,
      `Tour: ${tour.title}`,
      `Destino: ${this.formatText(tour.destination || "Perú")}`,
      `Fecha: ${this.booking.date || this.elements.bookingDate?.value || "Por definir"}`,
      `Adultos: ${this.booking.adults}`,
      `Niños: ${this.booking.children}`,
      `Hotel: ${hotelText}`,
      this.booking.coupon ? `Cupón: ${this.booking.coupon}` : null,
      `Total estimado: ${this.formatMoney(totals.total, totals.currency)}`,
      "",
      fromModal ? "Ya completé los datos en el modal. Por favor, confirmen disponibilidad y siguientes pasos." : "¿Me pueden confirmar disponibilidad y siguientes pasos?"
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
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

    this.elements.whatsappButton.href = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  printItinerary() {
    const tour = this.currentTour;
    if (!tour) return;
    const totals = this.calculateTotals();
    const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
    const includes = Array.isArray(tour.includes) ? tour.includes : [];
    const excludes = Array.isArray(tour.excludes) ? tour.excludes : [];
    const hotelText = totals.hotel && totals.roomCombo
      ? `${totals.hotel.name} — ${totals.roomCombo.label} (${totals.hotelNights} noches)`
      : "Alojamiento no agregado / por confirmar";
    const normalizedImages = this.normalizeImages(tour.images).map((image) => image.src).filter(Boolean);
    const heroImage = normalizedImages[0] || "./assets/img/tour-placeholder.jpg";
    const itineraryHtml = itinerary.map((item, index) => {
      const dayLabel = this.getPrintDayLabel(item, index);
      const imageSrc = item.image || item.imageSrc || item.photo || normalizedImages[index + 1] || normalizedImages[index % normalizedImages.length] || heroImage;
      const title = item.title || `Día ${index + 1}`;
      return `
        <article class="day">
          <div class="day-heading">
            <span class="day-badge">${this.escapeHTML(dayLabel)}</span>
            <h2>${this.escapeHTML(title)}</h2>
          </div>
          <div class="day-layout">
            <div class="day-copy">
              <p>${this.escapeHTML(item.description || "")}</p>
              ${Array.isArray(item.details) && item.details.length ? `<ul>${item.details.map((d) => `<li>${this.escapeHTML(d)}</li>`).join("")}</ul>` : ""}
              ${item.distance || item.meals ? `<p class="day-meta"><strong>${this.escapeHTML([item.distance, item.meals].filter(Boolean).join(" · "))}</strong></p>` : ""}
            </div>
            ${imageSrc ? `<img class="day-image" src="${this.escapeHTML(imageSrc)}" alt="${this.escapeHTML(title)}">` : ""}
          </div>
        </article>
      `;
    }).join("");

    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>${this.escapeHTML(tour.title)} | ${this.escapeHTML(this.reservationCode || "Reserva")}</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#23352c;background:#fff}
          main{max-width:980px;margin:0 auto;padding:34px}
          .hero{position:relative;overflow:hidden;border-radius:24px;background:#0b3d2e;color:#fff;padding:30px;margin-bottom:24px}
          .hero:before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(11,61,46,.82),rgba(11,61,46,.86)),url('${this.escapeHTML(heroImage)}') center/cover;z-index:0}
          .hero>*{position:relative;z-index:1}
          .hero-top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:16px}
          .hero-logo{background:transparent;border-radius:0;padding:0;max-width:190px}
          .hero-logo img{display:block;max-width:165px;height:auto;filter:drop-shadow(0 8px 18px rgba(0,0,0,.22))}
          .code-badge{display:inline-block;background:#7ed957;color:#0b3d2e;border-radius:999px;padding:9px 14px;font-weight:900;white-space:nowrap}
          .hero h1{font-size:34px;margin:14px 0 8px}.hero p{line-height:1.55;margin:0;color:#eef7ee}
          .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}
          .summary div{border:1px solid #dfe7dd;border-radius:16px;padding:12px}.summary span{display:block;color:#66736b;font-size:12px;font-weight:700}.summary strong{display:block;color:#0b3d2e;margin-top:5px}
          .day{padding:16px;border:1px solid #dfe7dd;border-radius:18px;margin:0 0 14px;break-inside:avoid;page-break-inside:avoid;background:#fff}
          .day-heading{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}
          .day-badge{display:inline-flex;align-items:center;justify-content:center;background:#0b3d2e;color:#fff;border-radius:999px;padding:8px 12px;font-size:13px;font-weight:900;white-space:nowrap}
          .day h2{margin:0;color:#0b3d2e;font-size:19px;line-height:1.25}
          .day-layout{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:16px;align-items:start}
          .day-image{width:190px;height:136px;object-fit:cover;border-radius:16px;border:1px solid #dfe7dd;display:block}
          .day p{line-height:1.55;margin:0 0 7px}.day ul{margin:8px 0 0;padding-left:18px;line-height:1.45}.day-meta{color:#0b3d2e}
          .cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px}.box{border:1px solid #dfe7dd;border-radius:18px;padding:18px}.box h2{margin:0 0 10px;color:#0b3d2e}.box li{margin-bottom:8px}.total{font-size:24px;color:#0b3d2e}
          @media print{main{padding:0}.hero{border-radius:18px}.no-print{display:none}.day,.box{break-inside:avoid;page-break-inside:avoid}.day-image{height:128px}}
          @media(max-width:700px){.summary,.cols,.day-layout{grid-template-columns:1fr}.day-image{width:100%;height:170px}.hero-top{align-items:flex-start;flex-direction:column}}
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <div class="hero-top">
              <div class="hero-logo"><img src="./assets/img/logos/logo-header.png" alt="Peru Nature"></div>
              <div class="code-badge">Código de reserva: ${this.escapeHTML(this.reservationCode || "Por generar")}</div>
            </div>
            <h1>${this.escapeHTML(tour.title)}</h1>
            <p>${this.escapeHTML(tour.shortDescription || tour.description || "Experiencia Peru Nature")}</p>
          </section>
          <section class="summary">
            <div><span>Duración</span><strong>${this.escapeHTML(this.formatDuration(tour.duration))}</strong></div>
            <div><span>Destino</span><strong>${this.escapeHTML(tour.location || this.formatText(tour.destination))}</strong></div>
            <div><span>Viajeros</span><strong>${this.booking.adults} adulto(s), ${this.booking.children} niño(s)</strong></div>
            <div><span>Total estimado</span><strong class="total">${this.escapeHTML(this.formatMoney(totals.total, totals.currency))}</strong></div>
          </section>
          <section class="box"><h2>Alojamiento</h2><p>${this.escapeHTML(hotelText)}</p></section>
          <h2>Itinerario detallado</h2>
          ${itineraryHtml}
          <section class="cols">
            <div class="box"><h2>Incluye</h2><ul>${includes.map((item) => `<li>${this.escapeHTML(item)}</li>`).join("")}</ul></div>
            <div class="box"><h2>No incluye</h2><ul>${excludes.map((item) => `<li>${this.escapeHTML(item)}</li>`).join("")}</ul></div>
          </section>
          <p style="margin-top:24px;color:#66736b;line-height:1.6">Tarifas referenciales sujetas a disponibilidad, temporada, ingresos y confirmación del operador local. Peru Nature confirmará la reserva antes de emitir servicios finales.</p>
          <button class="no-print" onclick="window.print()" style="margin-top:18px;border:0;border-radius:999px;background:#0b3d2e;color:#fff;padding:13px 20px;font-weight:900;cursor:pointer">Imprimir</button>
        </main>
        <script>window.onload=()=>setTimeout(()=>window.print(),350)</script>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  }


  collectPassengerData() {
    const data = [];
    this.elements.passengerForms?.querySelectorAll(".pn-passenger-card").forEach((card, index) => {
      if (card.querySelector("input[name='contact_email']")) return;
      data.push({
        passenger: index + 1,
        name: card.querySelector("input[name$='_name']")?.value || "",
        lastname: card.querySelector("input[name$='_lastname']")?.value || "",
        documentType: card.querySelector("select[name$='_doctype']")?.value || "",
        documentNumber: card.querySelector("input[name$='_doc']")?.value || "",
        nationality: card.querySelector("input[name$='_nationality']")?.value || "",
        birthdate: card.querySelector("input[name$='_birthdate']")?.value || "",
        gender: card.querySelector("select[name$='_gender']")?.value || "",
        language: card.querySelector("select[name$='_language']")?.value || ""
      });
    });
    return data;
  }

  getContactData() {
    return {
      email: this.elements.passengerForms?.querySelector("input[name='contact_email']")?.value || "",
      phone: this.elements.passengerForms?.querySelector("input[name='contact_phone']")?.value || ""
    };
  }

  buildReservationPayload(extra = {}) {
    const totals = this.calculateTotals();
    return {
      code: this.reservationCode || this.createReservationCode(),
      createdAt: new Date().toISOString(),
      tourSlug: this.currentTour?.slug || "",
      tourTitle: this.currentTour?.title || "",
      destination: this.currentTour?.destination || this.currentTour?.location || "",
      adults: this.booking.adults,
      children: this.booking.children,
      coupon: this.booking.coupon,
      discountPercent: this.booking.discountPercent,
      hotel: totals.hotel?.name || "",
      room: totals.roomCombo?.label || "",
      hotelSubtotal: totals.hotelSubtotal,
      baseSubtotal: totals.adultsSubtotal + totals.childrenSubtotal,
      discount: totals.discount,
      total: totals.total,
      currency: totals.currency,
      contact: this.getContactData(),
      customer: this.getLoggedCustomer(),
      passengers: this.collectPassengerData(),
      ...extra
    };
  }

  async saveReservationToGoogleSheet(extra = {}) {
    if (!this.reservationEndpoint) return;
    const payload = this.buildReservationPayload(extra);

    try {
      await fetch(this.reservationEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "saveReservation", reservation: payload })
      });
    } catch (error) {
      console.warn("[Peru Nature] No se pudo guardar la reserva en Google Sheet", error);
    }
  }

  createReservationCode() {
    const hexFromTimestamp = Date.now().toString(16).toUpperCase().slice(-6).padStart(6, "0");
    return `PER${hexFromTimestamp}`;
  }

  formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getPrintDayLabel(item, index) {
    const time = String(item?.time || "").trim();
    if (/d[ií]a\s*\d+/i.test(time)) return time;
    return `Día ${index + 1}`;
  }

  extractAvailabilityItems(tour) {
    const availability = tour?.availability;
    if (Array.isArray(availability)) return availability;
    if (availability?.times && Array.isArray(availability.times)) return availability.times;
    if (availability?.startTimes && Array.isArray(availability.startTimes)) return availability.startTimes;
    if (availability?.schedule && Array.isArray(availability.schedule)) return availability.schedule;
    if (availability?.days && Array.isArray(availability.days)) return availability.days;
    return [];
  }

  getBasePrice(pricing) {
    if (!pricing) return 0;
    const amount = pricing.from || pricing.amount || pricing.price || pricing.adult || pricing.basePrice || 0;
    return Number(String(amount).replace(/[^0-9.]/g, "")) || 0;
  }

  formatMoney(amount, currency = "USD") {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }

  getTranslation(key, fallback) {
    const lang = window.PeruNatureI18n?.getLang?.() || "es";
    return window.PeruNatureI18n?.translations?.[lang]?.[key] || fallback;
  }

  formatPrice(pricing) {
    if (!pricing) return "Consultar";

    const currency = pricing.currency || "USD";
    const symbol = this.getCurrencySymbol(currency);

    const amount = pricing.from || pricing.amount || pricing.price || pricing.adult || pricing.basePrice || null;

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
    if (typeof duration === "number") return `${duration} horas`;
    if (duration.label) return duration.label;
    if (duration.days && duration.nights) return `${duration.days}D/${duration.nights}N`;
    if (duration.days && duration.hours) return `${duration.days} día${duration.days > 1 ? "s" : ""} y ${duration.hours} hora${duration.hours > 1 ? "s" : ""}`;
    if (duration.days) return `${duration.days} día${duration.days > 1 ? "s" : ""}`;
    if (duration.hours) return `${duration.hours} hora${duration.hours > 1 ? "s" : ""}`;
    return "Por confirmar";
  }

  formatDifficulty(value) {
    const labels = { low: "Fácil", medium: "Moderada", high: "Alta", very_high: "Muy alta", media: "Media" };
    const key = String(value || "").toLowerCase();
    return labels[key] || this.formatText(value);
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
