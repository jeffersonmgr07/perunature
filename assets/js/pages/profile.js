(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const customerInfo = document.getElementById('profileCustomerInfo');
  const upcomingBox = document.getElementById('upcomingReservations');
  const pastBox = document.getElementById('pastReservations');
  const logoutButton = document.getElementById('logoutButton');

  function lang() {
    return window.PeruNatureI18n?.getLang?.() || localStorage.getItem('pn_lang') || document.documentElement.lang || 'es';
  }

  function t(key) {
    const dict = {
      es: {
        missingLogin: 'Necesitas iniciar sesión para ver tu perfil.',
        signIn: 'Iniciar sesión',
        missingEndpoint: 'Falta configurar la URL de Apps Script para cargar reservas.',
        noUpcoming: 'No encontramos próximas reservas asociadas a tu cuenta.',
        noHistory: 'Aún no tienes historial de viajes registrado.',
        loadError: 'No se pudo cargar tus reservas.',
        email: 'Correo',
        whatsapp: 'WhatsApp',
        nationality: 'Nacionalidad',
        document: 'Documento',
        code: 'Código',
        destination: 'Destino',
        status: 'Estado de pago',
        total: 'Total',
        hotel: 'Hotel',
        room: 'Acomodación',
        createdAt: 'Registrada',
        passengers: 'Pasajeros',
        noHotel: 'Sin alojamiento',
        pending: 'Pendiente'
      },
      en: {
        missingLogin: 'You need to sign in to view your profile.',
        signIn: 'Sign in',
        missingEndpoint: 'Apps Script URL is not configured to load bookings.',
        noUpcoming: 'We could not find upcoming bookings linked to your account.',
        noHistory: 'You do not have a registered travel history yet.',
        loadError: 'Could not load your bookings.',
        email: 'Email',
        whatsapp: 'WhatsApp',
        nationality: 'Nationality',
        document: 'Document',
        code: 'Code',
        destination: 'Destination',
        status: 'Payment status',
        total: 'Total',
        hotel: 'Hotel',
        room: 'Room arrangement',
        createdAt: 'Created',
        passengers: 'Passengers',
        noHotel: 'No accommodation',
        pending: 'Pending'
      }
    };
    return (dict[lang()] || dict.es)[key] || key;
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function getCustomer() {
    try { return JSON.parse(localStorage.getItem('pn_customer') || 'null'); } catch (_error) { return null; }
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(lang() === 'en' ? 'en-US' : 'es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function money(total, currency) {
    const num = Number(total || 0);
    return `${currency || 'USD'} ${num.toFixed(2)}`;
  }

  function renderNotLogged() {
    if (customerInfo) {
      customerInfo.innerHTML = `<p>${t('missingLogin')}</p><a class="auth-button" href="./login.html?redirect=perfil.html">${t('signIn')}</a>`;
    }
    if (upcomingBox) upcomingBox.innerHTML = `<p>${t('noUpcoming')}</p>`;
    if (pastBox) pastBox.innerHTML = `<p>${t('noHistory')}</p>`;
  }

  function renderCustomer(customer) {
    if (!customerInfo) return;
    const fullName = `${customer.names || customer.name || ''} ${customer.lastnames || customer.lastname || ''}`.trim();
    customerInfo.innerHTML = `
      <strong>${escapeHTML(fullName || customer.email || 'Peru Nature')}</strong>
      <span>${t('email')}: <strong>${escapeHTML(customer.email || '-')}</strong></span>
      <span>${t('whatsapp')}: <strong>${escapeHTML(customer.whatsapp || customer.phone || '-')}</strong></span>
      <span>${t('nationality')}: <strong>${escapeHTML(customer.nationality || '-')}</strong></span>
      <span>${t('document')}: <strong>${escapeHTML([customer.documentType, customer.documentNumber].filter(Boolean).join(' ') || '-')}</strong></span>
    `;
  }

  function isPastReservation(reservation) {
    const travelDate = reservation.travelDate || reservation.startDate || reservation.date;
    if (!travelDate) return false;
    const date = new Date(travelDate);
    if (Number.isNaN(date.getTime())) return false;
    return date < new Date();
  }

  function renderReservationCard(reservation) {
    const title = reservation.tourTitle || 'Reserva Peru Nature';
    return `
      <article class="booking-mini-card">
        <div class="booking-mini-card__head">
          <div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(reservation.destination || '-')}</p>
          </div>
          <span class="booking-mini-card__code"><i class="fa-solid fa-ticket"></i> ${escapeHTML(reservation.code || '-')}</span>
        </div>
        <div class="booking-mini-card__grid">
          <div class="booking-mini-card__row"><span>${t('status')}</span><strong>${escapeHTML(reservation.paymentStatus || t('pending'))}</strong></div>
          <div class="booking-mini-card__row"><span>${t('total')}</span><strong>${money(reservation.total, reservation.currency)}</strong></div>
          <div class="booking-mini-card__row"><span>${t('hotel')}</span><strong>${escapeHTML(reservation.hotel || t('noHotel'))}</strong></div>
          <div class="booking-mini-card__row"><span>${t('room')}</span><strong>${escapeHTML(reservation.room || '-')}</strong></div>
          <div class="booking-mini-card__row"><span>${t('createdAt')}</span><strong>${escapeHTML(formatDate(reservation.createdAt))}</strong></div>
        </div>
        <p style="margin-top:14px"><a href="./mi-reserva.html?code=${encodeURIComponent(reservation.code || '')}">${t('code')}: ${escapeHTML(reservation.code || '')}</a></p>
      </article>
    `;
  }

  function renderReservations(reservations) {
    const upcoming = reservations.filter((item) => !isPastReservation(item));
    const past = reservations.filter(isPastReservation);
    if (upcomingBox) upcomingBox.innerHTML = upcoming.length ? upcoming.map(renderReservationCard).join('') : `<p>${t('noUpcoming')}</p>`;
    if (pastBox) pastBox.innerHTML = past.length ? past.map(renderReservationCard).join('') : `<p>${t('noHistory')}</p>`;
  }

  async function loadReservations(customer) {
    if (!endpoint) {
      if (upcomingBox) upcomingBox.innerHTML = `<p>${t('missingEndpoint')}</p>`;
      if (pastBox) pastBox.innerHTML = `<p>${t('noHistory')}</p>`;
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getCustomerReservations', email: customer.email, token: customer.token })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.message || t('loadError'));
      renderReservations(json.reservations || []);
    } catch (error) {
      if (upcomingBox) upcomingBox.innerHTML = `<p>${escapeHTML(error.message || t('loadError'))}</p>`;
      if (pastBox) pastBox.innerHTML = `<p>${t('noHistory')}</p>`;
    }
  }

  logoutButton?.addEventListener('click', () => {
    localStorage.removeItem('pn_customer');
    document.dispatchEvent(new CustomEvent('peruNature:customerChanged'));
    window.location.href = './login.html';
  });

  function init() {
    const customer = getCustomer();
    if (!customer) return renderNotLogged();
    renderCustomer(customer);
    loadReservations(customer);
  }

  document.addEventListener('peruNature:languageChanged', init);
  init();
})();
