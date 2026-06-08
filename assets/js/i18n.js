/* =========================================================
   PERU NATURE | Primera capa multidioma ES / EN
========================================================= */
(function () {
  const translations = {
    es: {
      "nav.destinations": "Destinos",
      "nav.packages": "Paquetes",
      "nav.tours": "Tours",
      "nav.travelStyles": "Estilos de viaje",
      "nav.myReservation": "Mi reserva",
      "nav.viewReservation": "Ver mi reserva",
      "nav.loginShort": "Iniciar sesión",
      "nav.register": "Registrarme",
      "nav.login": "Iniciar sesión o registrarse",

      "nav.searchByCode": "Buscar con código",
      "nav.profile": "Mi perfil",
      "nav.logout": "Cerrar sesión",
      "auth.loginTitle": "Inicio de sesión",
      "auth.loginIntro": "Ingresa con tu correo y contraseña para ver tu perfil, tus próximas reservas y tu historial de viajes.",
      "auth.email": "Correo electrónico",
      "auth.password": "Contraseña",
      "auth.emailPlaceholder": "correo@ejemplo.com",
      "auth.passwordPlaceholder": "Tu contraseña",
      "auth.whatsappPlaceholder": "+51 999 999 999",
      "auth.countryPlaceholder": "País",
      "lookup.codePlaceholder": "PERD3F1C0",
      "lookup.lastnamePlaceholder": "Apellido",
      "auth.signInButton": "Ingresar",
      "auth.noAccount": "¿Aún no tienes una cuenta?",
      "auth.registerHere": "Regístrate aquí",
      "auth.publicLookupIntro": "También puedes",
      "auth.searchByCodeLink": "buscar tu reserva con código",
      "auth.noLoginNeeded": "sin iniciar sesión.",
      "auth.loginSideTitle": "Ver mi reserva",
      "auth.loginSideText": "Si ya tienes un código de reserva, puedes consultar tu travel voucher con el código y el apellido de uno de los pasajeros.",
      "auth.searchReservationButton": "Buscar reserva con código",
      "auth.registerTitle": "Crear cuenta",
      "auth.registerIntro": "Registra tus datos para completar más rápido tus reservas y consultar tu historial de viajes en Peru Nature.",
      "auth.names": "Nombre(s)",
      "auth.lastnames": "Apellidos",
      "auth.whatsapp": "WhatsApp",
      "auth.birthdate": "Fecha de nacimiento",
      "auth.gender": "Género",
      "auth.select": "Seleccionar",
      "auth.female": "Femenino",
      "auth.male": "Masculino",
      "auth.unspecified": "No especifica",
      "auth.nationality": "Nacionalidad",
      "auth.language": "Idioma",
      "auth.documentType": "Tipo de documento",
      "auth.documentNumber": "Número de documento",
      "auth.passport": "Pasaporte",
      "auth.foreignCard": "Carné de extranjería",
      "auth.createAccountButton": "Crear cuenta",
      "auth.haveAccount": "¿Ya tienes una cuenta?",
      "auth.signInHere": "Inicia sesión aquí",
      "auth.registerSideTitle": "Datos del titular",
      "auth.registerSideText": "Cuando inicies sesión, los datos del primer pasajero se completarán automáticamente al iniciar una reserva.",
      "lookup.title": "Buscar reserva",
      "lookup.intro": "Ingresa tu código de reserva y el apellido de uno de los pasajeros para ver tu travel voucher sin iniciar sesión.",
      "lookup.code": "Código de reserva",
      "lookup.lastname": "Apellido del pasajero",
      "lookup.searchButton": "Buscar reserva",
      "lookup.loginIntro": "Si tienes una cuenta, también puedes",
      "lookup.loginLink": "iniciar sesión y ver tu historial.",
      "lookup.resultTitle": "Travel voucher",
      "lookup.resultIntro": "El detalle aparecerá aquí después de buscar.",
      "profile.title": "Mi perfil",
      "profile.intro": "Consulta tus datos registrados, próximas reservas e historial de viajes.",
      "profile.logout": "Cerrar sesión",
      "profile.upcoming": "Próximas reservas",
      "profile.history": "Historial de viajes",
      "profile.loading": "Cargando reservas...",
      "common.home": "Inicio",
      "common.experiences": "Experiencias",
      "home.heroKicker": "Perú natural · cultural · auténtico",
      "home.heroTitle": "Explora Perú con experiencias únicas",
      "home.heroSubtitle": "Tours, paquetes y viajes personalizados por los destinos más increíbles del Perú.",
      "home.exploreEyebrow": "Explora Perú",
      "home.destinationsTitle": "Destinos naturales y culturales",
      "home.destinationsText": "Viajes diseñados para descubrir lo mejor del Perú: Andes, Amazonía, costa, cultura viva y experiencias auténticas.",
      "home.featuredEyebrow": "Experiencias recomendadas",
      "home.featuredTitle": "Viajes para empezar a descubrir Perú",
      "home.featuredText": "Elige entre tours de un día, escapadas naturales y paquetes completos para vivir lo mejor del Perú a tu ritmo.",
      "footer.tagline": "Diseñamos experiencias de naturaleza, cultura y aventura por todo el Perú, con atención personalizada antes, durante y después de tu viaje.",
      "footer.contactUs": "Contáctanos",
      "footer.talkAdvisor": "Habla con un asesor",
      "footer.aboutTitle": "CONÓCENOS",
      "footer.aboutUs": "Sobre Peru Nature",
      "footer.natureTrips": "Viajes de naturaleza",
      "footer.culturalTrips": "Experiencias culturales",
      "footer.adventureTrips": "Aventura en Perú",
      "footer.documentaryTours": "Salidas documentales",
      "footer.operatorAlliance": "Alianza de operadores",
      "footer.operatorLogin": "Login operadores",
      "footer.destinationsTitle": "DESTINOS",
      "footer.helpCenter": "Centro de ayuda",
      "footer.customQuote": "Cotizar paquete a medida",
      "footer.allExperiences": "Ver todas las experiencias",
      "footer.whatsappHelp": "Ayuda por WhatsApp",
      "footer.legal": "Legales",
      "footer.terms": "Términos y condiciones",
      "footer.privacy": "Política de privacidad",
      "footer.claimBook": "Libro de reclamaciones",
      "footer.paymentMethods": "Métodos de pago",
      "footer.rights": "Todos los derechos reservados.",
      "booking.from": "Desde",
      "booking.perPerson": "por persona",
      "booking.date": "Fecha de viaje",
      "booking.time": "Horario",
      "booking.selectTime": "Selecciona un horario",
      "booking.adults": "Adultos",
      "booking.adultsHelp": "13 años a más",
      "booking.children": "Niños",
      "booking.childrenHelp": "3 a 12 años",
      "booking.coupon": "Cupón de descuento",
      "booking.apply": "Aplicar",
      "booking.duration": "Duración",
      "booking.location": "Destino",
      "booking.difficulty": "Dificultad",
      "booking.paymentDetails": "Detalle de reserva",
      "booking.adultsTotal": "Adultos",
      "booking.childrenTotal": "Niños",
      "booking.discount": "Descuento",
      "booking.total": "Total",
      "booking.reserveWhatsApp": "Reservar por WhatsApp",
      "booking.startReservation": "Iniciar reserva",
      "booking.backCatalog": "Ver otras experiencias",
      "booking.note": "Confirma tu fecha y viajeros. Un asesor validará disponibilidad antes de cerrar la reserva.",
      "booking.validCoupon": "Cupón aplicado: 10% de descuento.",
      "booking.invalidCoupon": "Cupón no válido para esta experiencia."
    },
    en: {
      "nav.destinations": "Destinations",
      "nav.packages": "Packages",
      "nav.tours": "Tours",
      "nav.travelStyles": "Travel styles",
      "nav.myReservation": "My booking",
      "nav.viewReservation": "View my booking",
      "nav.loginShort": "Sign in",
      "nav.register": "Register",
      "nav.login": "Sign in or register",

      "nav.searchByCode": "Search by code",
      "nav.profile": "My profile",
      "nav.logout": "Sign out",
      "auth.loginTitle": "Sign in",
      "auth.loginIntro": "Sign in with your email and password to view your profile, upcoming bookings and travel history.",
      "auth.email": "Email address",
      "auth.password": "Password",
      "auth.emailPlaceholder": "email@example.com",
      "auth.passwordPlaceholder": "Your password",
      "auth.whatsappPlaceholder": "+1 555 000 0000",
      "auth.countryPlaceholder": "Country",
      "lookup.codePlaceholder": "PERD3F1C0",
      "lookup.lastnamePlaceholder": "Last name",
      "auth.signInButton": "Sign in",
      "auth.noAccount": "Don’t have an account yet?",
      "auth.registerHere": "Register here",
      "auth.publicLookupIntro": "You can also",
      "auth.searchByCodeLink": "search your booking by code",
      "auth.noLoginNeeded": "without signing in.",
      "auth.loginSideTitle": "View my booking",
      "auth.loginSideText": "If you already have a booking code, you can view your travel voucher using the code and one passenger’s last name.",
      "auth.searchReservationButton": "Search booking by code",
      "auth.registerTitle": "Create account",
      "auth.registerIntro": "Register your details to complete bookings faster and check your Peru Nature travel history.",
      "auth.names": "First name(s)",
      "auth.lastnames": "Last name(s)",
      "auth.whatsapp": "WhatsApp",
      "auth.birthdate": "Date of birth",
      "auth.gender": "Gender",
      "auth.select": "Select",
      "auth.female": "Female",
      "auth.male": "Male",
      "auth.unspecified": "Not specified",
      "auth.nationality": "Nationality",
      "auth.language": "Language",
      "auth.documentType": "Document type",
      "auth.documentNumber": "Document number",
      "auth.passport": "Passport",
      "auth.foreignCard": "Foreigner ID card",
      "auth.createAccountButton": "Create account",
      "auth.haveAccount": "Already have an account?",
      "auth.signInHere": "Sign in here",
      "auth.registerSideTitle": "Main traveler details",
      "auth.registerSideText": "When you sign in, the first passenger’s details will be completed automatically when starting a booking.",
      "lookup.title": "Search booking",
      "lookup.intro": "Enter your booking code and one passenger’s last name to view your travel voucher without signing in.",
      "lookup.code": "Booking code",
      "lookup.lastname": "Passenger last name",
      "lookup.searchButton": "Search booking",
      "lookup.loginIntro": "If you have an account, you can also",
      "lookup.loginLink": "sign in and view your history.",
      "lookup.resultTitle": "Travel voucher",
      "lookup.resultIntro": "The details will appear here after searching.",
      "profile.title": "My profile",
      "profile.intro": "View your registered details, upcoming bookings and travel history.",
      "profile.logout": "Sign out",
      "profile.upcoming": "Upcoming bookings",
      "profile.history": "Travel history",
      "profile.loading": "Loading bookings...",
      "common.home": "Home",
      "common.experiences": "Experiences",
      "home.heroKicker": "Natural · cultural · authentic Peru",
      "home.heroTitle": "Explore Peru through unique experiences",
      "home.heroSubtitle": "Tours, packages and tailor-made trips across Peru’s most incredible destinations.",
      "home.exploreEyebrow": "Explore Peru",
      "home.destinationsTitle": "Natural and cultural destinations",
      "home.destinationsText": "Trips designed to discover the best of Peru: Andes, Amazon, coast, living culture and authentic experiences.",
      "home.featuredEyebrow": "Recommended experiences",
      "home.featuredTitle": "Trips to start discovering Peru",
      "home.featuredText": "Choose from one-day tours, nature escapes and complete packages to experience the best of Peru at your own pace.",
      "footer.tagline": "We design nature, culture and adventure experiences throughout Peru, with personalized assistance before, during and after your trip.",
      "footer.contactUs": "Contact us",
      "footer.talkAdvisor": "Talk to an advisor",
      "footer.aboutTitle": "ABOUT US",
      "footer.aboutUs": "About Peru Nature",
      "footer.natureTrips": "Nature trips",
      "footer.culturalTrips": "Cultural experiences",
      "footer.adventureTrips": "Adventure in Peru",
      "footer.documentaryTours": "Documentary departures",
      "footer.operatorAlliance": "Operator alliance",
      "footer.operatorLogin": "Operator login",
      "footer.destinationsTitle": "DESTINATIONS",
      "footer.helpCenter": "Help center",
      "footer.customQuote": "Request a custom package",
      "footer.allExperiences": "See all experiences",
      "footer.whatsappHelp": "WhatsApp support",
      "footer.legal": "Legal",
      "footer.terms": "Terms and conditions",
      "footer.privacy": "Privacy policy",
      "footer.claimBook": "Complaints book",
      "footer.paymentMethods": "Payment methods",
      "footer.rights": "All rights reserved.",
      "booking.from": "From",
      "booking.perPerson": "per person",
      "booking.date": "Travel date",
      "booking.time": "Departure time",
      "booking.selectTime": "Select a time",
      "booking.adults": "Adults",
      "booking.adultsHelp": "13 years and older",
      "booking.children": "Children",
      "booking.childrenHelp": "3 to 12 years",
      "booking.coupon": "Discount coupon",
      "booking.apply": "Apply",
      "booking.duration": "Duration",
      "booking.location": "Destination",
      "booking.difficulty": "Difficulty",
      "booking.paymentDetails": "Reservation details",
      "booking.adultsTotal": "Adults",
      "booking.childrenTotal": "Children",
      "booking.discount": "Discount",
      "booking.total": "Total",
      "booking.reserveWhatsApp": "Book via WhatsApp",
      "booking.startReservation": "Start booking",
      "booking.backCatalog": "See more experiences",
      "booking.note": "Confirm your date and travelers. An advisor will validate availability before finalizing the booking.",
      "booking.validCoupon": "Coupon applied: 10% discount.",
      "booking.invalidCoupon": "Coupon not valid for this experience."
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
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      if (dict[key]) node.setAttribute('placeholder', dict[key]);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      const key = node.getAttribute('data-i18n-aria-label');
      if (dict[key]) node.setAttribute('aria-label', dict[key]);
    });
    document.querySelectorAll('[data-current-lang]').forEach((node) => node.textContent = lang.toUpperCase());
  }

  function initLangSwitcher() {
    document.querySelectorAll('.lang-switcher').forEach((switcher) => {
      const toggle = switcher.querySelector('.lang-switcher__toggle');
      const menu = switcher.querySelector('.lang-switcher__menu');
      if (!toggle || !menu || switcher.dataset.initialized === 'true') return;
      switcher.dataset.initialized = 'true';

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
