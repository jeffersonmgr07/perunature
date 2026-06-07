/* =========================================================
   PRODUCT PAGE | Peru Nature
   Carga dinámica de detalle + reserva con pasajeros, hotel y PayPal
========================================================= */

class PeruNatureProductPage {
  constructor() {
    this.tours = [];
    this.packageHotels = {};
    this.currentTour = null;
    this.whatsappNumber = "51929715296";
    this.reservationCode = "";
    this.paypalRenderedKey = "";
    this.paypalRendering = false;
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
      whatsappButton: document.getElementById("whatsappButton"),

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

    await Promise.all([this.loadTours(), this.loadPackageHotels()]);
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
        const day = item.time || `Día ${index + 1}`;
        const description = item.description || item.activity || item.text || "";
        const details = Array.isArray(item.details) ? item.details : [];
        const extras = [
          item.distance ? `<span><i class="fa-solid fa-route"></i>${this.escapeHTML(item.distance)}</span>` : "",
          item.meals ? `<span><i class="fa-solid fa-utensils"></i>${this.escapeHTML(item.meals)}</span>` : ""
        ].filter(Boolean).join("");

        return `
          <div class="itinerary-item">
            <div class="itinerary-number">${this.escapeHTML(day).replace(/^Día\s*/i, "")}</div>
            <div class="itinerary-content">
              <h3>${this.escapeHTML(day)}: ${this.escapeHTML(title)}</h3>
              <p>${this.escapeHTML(description)}</p>
              ${details.length ? `<ul class="itinerary-details">${details.map((detail) => `<li>${this.escapeHTML(detail)}</li>`).join("")}</ul>` : ""}
              ${extras ? `<div class="itinerary-extra">${extras}</div>` : ""}
            </div>
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
    today.setDate(today.getDate() + 1);
    const minDate = today.toISOString().split("T")[0];
    if (this.elements.bookingDate) this.elements.bookingDate.min = minDate;
    if (this.elements.modalBookingDate) this.elements.modalBookingDate.min = minDate;

    document.querySelectorAll(".booking-form .qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target;
        const action = button.dataset.action;
        this.changeTravelers(target, action);
      });
    });

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

    document.querySelectorAll(".modal-qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        this.changeTravelers(button.dataset.target, button.dataset.action);
        this.renderPassengerForms();
        this.renderHotelSelection();
      });
    });

    this.elements.modalBookingDate?.addEventListener("change", () => {
      this.booking.date = this.elements.modalBookingDate.value;
      if (this.elements.bookingDate) this.elements.bookingDate.value = this.booking.date;
    });

    this.elements.modalBookingTime?.addEventListener("change", () => {
      this.booking.time = this.elements.modalBookingTime.value;
      if (this.elements.bookingTime) this.elements.bookingTime.value = this.booking.time;
    });

    this.elements.printItineraryBtn?.addEventListener("click", () => this.printItinerary());
    this.elements.modalWhatsappBtn?.addEventListener("click", () => this.sendBookingToWhatsApp(this.currentTour, true));
  }

  changeTravelers(target, action) {
    const min = target === "adults" ? 1 : 0;
    const current = this.booking[target] || 0;
    this.booking[target] = action === "plus" ? current + 1 : Math.max(min, current - 1);
    this.updateBookingTotals();
  }

  applyDiscountCoupon() {
    const coupon = String(this.elements.coupon?.value || "").trim().toUpperCase();
    if (coupon === "PERUNATURE10") {
      this.booking.discountPercent = 10;
      this.booking.coupon = coupon;
      this.setText(this.elements.discountMessage, this.getTranslation("booking.validCoupon", "Cupón aplicado: 10% de descuento."));
    } else {
      this.booking.discountPercent = 0;
      this.booking.coupon = "";
      this.setText(this.elements.discountMessage, this.getTranslation("booking.invalidCoupon", "Cupón no válido para esta experiencia."));
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
    this.setText(this.elements.bookingTotal, this.formatMoney(totals.total, totals.currency));

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
    const discount = Math.round((adultsSubtotal + childrenSubtotal) * (this.booking.discountPercent / 100));
    const total = Math.max(0, subtotal - discount);

    return { currency, basePrice, childPrice, adultsSubtotal, childrenSubtotal, hotelSubtotal, subtotal, discount, total, hotel, roomCombo, hotelNights };
  }

  openReservationModal(tour) {
    if (!this.elements.modal) return;

    this.booking.date = this.elements.bookingDate?.value || this.booking.date || "";
    this.booking.time = this.elements.bookingTime?.value || this.booking.time || "";
    if (this.elements.modalBookingDate) this.elements.modalBookingDate.value = this.booking.date;
    if (this.elements.modalBookingTime) this.elements.modalBookingTime.value = this.booking.time;

    if (!this.reservationCode) this.reservationCode = this.createReservationCode();
    this.setText(this.elements.reservationCodeLabel, `Código de reserva: ${this.reservationCode}`);
    this.setText(this.elements.modalTitle, tour?.productKind === "package" ? "Reserva tu paquete" : "Reserva tu experiencia");

    this.renderHotelSelection();
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
      const minRate = Math.min(...Object.values(hotel.roomRates || {}).map(Number).filter(Boolean));
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
    if (!combo || !hotel?.roomRates) return 0;
    return Object.entries(combo.rooms || {}).reduce((sum, [type, qty]) => {
      return sum + Number(hotel.roomRates[type] || 0) * Number(qty || 0);
    }, 0);
  }

  renderPassengerForms() {
    if (!this.elements.passengerForms) return;
    const total = this.getTravelerCount();
    const cards = [];

    for (let i = 1; i <= total; i += 1) {
      const isAdult = i <= this.booking.adults;
      cards.push(`
        <article class="pn-passenger-card">
          <h4>Pasajero ${i} ${isAdult ? "Adulto" : "Niño"}</h4>
          <div class="pn-passenger-grid">
            <label>Nombre(s)<input type="text" name="passenger_${i}_name" placeholder="Nombre completo"></label>
            <label>Apellido(s)<input type="text" name="passenger_${i}_lastname" placeholder="Apellidos"></label>
            <label>Tipo de documento
              <select name="passenger_${i}_doctype">
                <option value="">Seleccionar</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carné de extranjería">Carné de extranjería</option>
              </select>
            </label>
            <label>Número de documento<input type="text" name="passenger_${i}_doc" placeholder="Documento"></label>
            <label>Nacionalidad<input type="text" name="passenger_${i}_nationality" placeholder="País"></label>
            <label>Fecha de nacimiento<input type="date" name="passenger_${i}_birthdate"></label>
          </div>
        </article>
      `);
    }

    cards.push(`
      <article class="pn-passenger-card">
        <h4>Contacto principal</h4>
        <div class="pn-passenger-grid">
          <label>Email<input type="email" name="contact_email" placeholder="correo@ejemplo.com"></label>
          <label>WhatsApp<input type="tel" name="contact_phone" placeholder="+51 999 999 999"></label>
        </div>
      </article>
    `);

    this.elements.passengerForms.innerHTML = cards.join("");
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
      createOrder: (_data, actions) => {
        const amount = Math.max(1, Number(totals.total || 0)).toFixed(2);
        return actions.order.create({
          purchase_units: [{
            reference_id: this.reservationCode || this.createReservationCode(),
            description: String(this.currentTour?.title || "Reserva Peru Nature").slice(0, 120),
            amount: { currency_code: totals.currency || "USD", value: amount }
          }]
        });
      },
      onApprove: async (_data, actions) => {
        const details = await actions.order.capture();
        this.setText(this.elements.paypalStatus, `Pago aprobado. ID: ${details?.id || "confirmado"}`);
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
      `Horario: ${this.booking.time || this.elements.bookingTime?.value || "Por definir"}`,
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

    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>${this.escapeHTML(tour.title)} | ${this.escapeHTML(this.reservationCode || "Reserva")}</title>
        <style>
          *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#23352c;background:#fff}main{max-width:980px;margin:0 auto;padding:34px}.hero{border-radius:24px;background:#0b3d2e;color:#fff;padding:30px;margin-bottom:24px}.hero small{display:inline-block;background:#7ed957;color:#0b3d2e;border-radius:999px;padding:7px 12px;font-weight:900}.hero h1{font-size:34px;margin:14px 0 8px}.hero p{line-height:1.55;margin:0;color:#eef7ee}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.summary div{border:1px solid #dfe7dd;border-radius:16px;padding:12px}.summary span{display:block;color:#66736b;font-size:12px;font-weight:700}.summary strong{display:block;color:#0b3d2e;margin-top:5px}.day{display:grid;grid-template-columns:86px 1fr;gap:16px;padding:18px 0;border-bottom:1px solid #dfe7dd}.badge{background:#0b3d2e;color:#fff;border-radius:18px;min-height:60px;display:grid;place-items:center;text-align:center;font-weight:900}.day h2{margin:0;color:#0b3d2e;font-size:20px}.day p{line-height:1.65}.day ul{margin:10px 0 0;padding-left:18px;line-height:1.6}.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px}.box{border:1px solid #dfe7dd;border-radius:18px;padding:18px}.box h2{margin:0 0 10px;color:#0b3d2e}.box li{margin-bottom:8px}.total{font-size:24px;color:#0b3d2e}@media print{main{padding:0}.hero{border-radius:0}.no-print{display:none}.day{break-inside:avoid}.box{break-inside:avoid}}@media(max-width:700px){.summary,.cols{grid-template-columns:1fr}.day{grid-template-columns:1fr}}
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <small>${this.escapeHTML(this.reservationCode || "Peru Nature")}</small>
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
          ${itinerary.map((item, index) => `
            <article class="day">
              <div class="badge">${this.escapeHTML(item.time || `Día ${index + 1}`)}</div>
              <div>
                <h2>${this.escapeHTML(item.title || `Día ${index + 1}`)}</h2>
                <p>${this.escapeHTML(item.description || "")}</p>
                ${Array.isArray(item.details) && item.details.length ? `<ul>${item.details.map((d) => `<li>${this.escapeHTML(d)}</li>`).join("")}</ul>` : ""}
                ${item.distance || item.meals ? `<p><strong>${this.escapeHTML([item.distance, item.meals].filter(Boolean).join(" · "))}</strong></p>` : ""}
              </div>
            </article>
          `).join("")}
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

  createReservationCode() {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, "0");
    const tail = Date.now().toString(16).slice(-4).toUpperCase();
    return `OP-NAT-${hex}-${tail}`;
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
