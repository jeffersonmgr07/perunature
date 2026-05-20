/* =========================================================
   PERU NATURE | Primera capa multidioma ES / EN
========================================================= */
(function () {
  const translations = {
    es: {
      "nav.destinations": "Destinos", "nav.packages": "Paquetes", "nav.tours": "Tours", "nav.travelStyles": "Estilos de viaje", "nav.myReservation": "Mi reserva", "nav.login": "Iniciar sesión o registrarse",
      "common.home": "Inicio", "common.experiences": "Experiencias",
      "home.heroKicker": "Perú natural · cultural · auténtico", "home.heroTitle": "Explora Perú con experiencias únicas", "home.heroSubtitle": "Tours, paquetes y viajes personalizados por los destinos más increíbles del Perú.",
      "home.exploreEyebrow": "Explora Perú", "home.destinationsTitle": "Destinos naturales y culturales", "home.destinationsText": "Viajes diseñados para descubrir lo mejor del Perú: Andes, Amazonía, costa, cultura viva y experiencias auténticas.",
      "home.featuredEyebrow": "Experiencias recomendadas", "home.featuredTitle": "Viajes para empezar a descubrir Perú", "home.featuredText": "Elige entre tours de un día, escapadas naturales y paquetes completos para vivir lo mejor del Perú a tu ritmo.",
      "footer.tagline": "Diseñamos experiencias de naturaleza, cultura y aventura por todo el Perú, con atención personalizada antes, durante y después de tu viaje.", "footer.contactUs": "Contáctanos", "footer.talkAdvisor": "Habla con un asesor", "footer.aboutTitle": "CONÓCENOS", "footer.aboutUs": "Sobre Peru Nature", "footer.natureTrips": "Viajes de naturaleza", "footer.culturalTrips": "Experiencias culturales", "footer.adventureTrips": "Aventura en Perú", "footer.documentaryTours": "Salidas documentales", "footer.destinationsTitle": "DESTINOS", "footer.helpCenter": "Centro de ayuda", "footer.customQuote": "Cotizar paquete a medida", "footer.allExperiences": "Ver todas las experiencias", "footer.whatsappHelp": "Ayuda por WhatsApp", "footer.legal": "Legales", "footer.terms": "Términos y condiciones", "footer.privacy": "Política de privacidad", "footer.claimBook": "Libro de reclamaciones", "footer.paymentMethods": "Métodos de pago", "footer.rights": "Todos los derechos reservados.",
      "booking.from": "Desde", "booking.perPerson": "por persona", "booking.date": "Fecha de viaje", "booking.time": "Horario", "booking.selectTime": "Selecciona un horario", "booking.adults": "Adultos", "booking.adultsHelp": "13 años a más", "booking.children": "Niños", "booking.childrenHelp": "3 a 12 años", "booking.coupon": "Cupón de descuento", "booking.apply": "Aplicar", "booking.duration": "Duración", "booking.location": "Destino", "booking.difficulty": "Dificultad", "booking.paymentDetails": "Detalle estimado", "booking.adultsTotal": "Adultos", "booking.childrenTotal": "Niños", "booking.discount": "Descuento", "booking.total": "Total", "booking.reserveWhatsApp": "Reservar por WhatsApp", "booking.backCatalog": "Volver al catálogo", "booking.note": "Confirma tu fecha, viajeros y horario. Un asesor validará disponibilidad antes de cerrar la reserva.", "booking.validCoupon": "Cupón aplicado: 10% de descuento.", "booking.invalidCoupon": "Cupón no válido para esta experiencia."
    },
    en: {
      "nav.destinations": "Destinations", "nav.packages": "Packages", "nav.tours": "Tours", "nav.travelStyles": "Travel styles", "nav.myReservation": "My booking", "nav.login": "Sign in or register",
      "common.home": "Home", "common.experiences": "Experiences",
      "home.heroKicker": "Natural · cultural · authentic Peru", "home.heroTitle": "Explore Peru through unique experiences", "home.heroSubtitle": "Tours, packages and tailor-made trips across Peru’s most incredible destinations.",
      "home.exploreEyebrow": "Explore Peru", "home.destinationsTitle": "Natural and cultural destinations", "home.destinationsText": "Trips designed to discover the best of Peru: Andes, Amazon, coast, living culture and authentic experiences.",
      "home.featuredEyebrow": "Recommended experiences", "home.featuredTitle": "Trips to start discovering Peru", "home.featuredText": "Choose from one-day tours, nature escapes and complete packages to experience the best of Peru at your own pace.",
      "footer.tagline": "We design nature, culture and adventure experiences throughout Peru, with personalized assistance before, during and after your trip.", "footer.contactUs": "Contact us", "footer.talkAdvisor": "Talk to an advisor", "footer.aboutTitle": "ABOUT US", "footer.aboutUs": "About Peru Nature", "footer.natureTrips": "Nature trips", "footer.culturalTrips": "Cultural experiences", "footer.adventureTrips": "Adventure in Peru", "footer.documentaryTours": "Documentary departures", "footer.destinationsTitle": "DESTINATIONS", "footer.helpCenter": "Help center", "footer.customQuote": "Request a custom package", "footer.allExperiences": "See all experiences", "footer.whatsappHelp": "WhatsApp support", "footer.legal": "Legal", "footer.terms": "Terms and conditions", "footer.privacy": "Privacy policy", "footer.claimBook": "Complaints book", "footer.paymentMethods": "Payment methods", "footer.rights": "All rights reserved.",
      "booking.from": "From", "booking.perPerson": "per person", "booking.date": "Travel date", "booking.time": "Departure time", "booking.selectTime": "Select a time", "booking.adults": "Adults", "booking.adultsHelp": "13 years and older", "booking.children": "Children", "booking.childrenHelp": "3 to 12 years", "booking.coupon": "Discount coupon", "booking.apply": "Apply", "booking.duration": "Duration", "booking.location": "Destination", "booking.difficulty": "Difficulty", "booking.paymentDetails": "Estimated details", "booking.adultsTotal": "Adults", "booking.childrenTotal": "Children", "booking.discount": "Discount", "booking.total": "Total", "booking.reserveWhatsApp": "Book via WhatsApp", "booking.backCatalog": "Back to catalog", "booking.note": "Confirm your date, travelers and departure time. An advisor will validate availability before closing the booking.", "booking.validCoupon": "Coupon applied: 10% discount.", "booking.invalidCoupon": "Coupon not valid for this experience."
    }
  };

  function getLang() {
    return localStorage.getItem('pn_lang') || document.documentElement.lang || 'es';
  }

  function translate(lang = getLang()) {
    const dict = translations[lang] || translations.es;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (dict[key]) node.textContent = dict[key];
    });
    document.querySelectorAll('[data-current-lang]').forEach((node) => node.textContent = lang.toUpperCase());
  }

  function initLangSwitcher() {
    document.querySelectorAll('.lang-switcher').forEach((switcher) => {
      const toggle = switcher.querySelector('.lang-switcher__toggle');
      const menu = switcher.querySelector('.lang-switcher__menu');
      if (!toggle || !menu) return;

      toggle.addEventListener('click', () => {
        const isOpen = !menu.hidden;
        menu.hidden = isOpen;
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });

      menu.querySelectorAll('[data-lang]').forEach((button) => {
        button.addEventListener('click', () => {
          const lang = button.dataset.lang;
          localStorage.setItem('pn_lang', lang);
          translate(lang);
          menu.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          document.dispatchEvent(new CustomEvent('peruNature:languageChanged', { detail: { lang } }));
        });
      });
    });
  }

  window.PeruNatureI18n = { translate, initLangSwitcher, getLang, translations };
  document.addEventListener('peruNature:componentsReady', () => { translate(); initLangSwitcher(); });
  document.addEventListener('DOMContentLoaded', () => { translate(); initLangSwitcher(); });
})();
