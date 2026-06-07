(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const form = document.getElementById('reservationLookupForm');
  const result = document.getElementById('reservationLookupResult');

  function lang() {
    return window.PeruNatureI18n?.getLang?.() || localStorage.getItem('pn_lang') || document.documentElement.lang || 'es';
  }

  function t(key) {
    const dict = {
      es: {
        missingEndpoint: 'Falta configurar la URL de Apps Script.',
        searching: 'Buscando reserva...',
        lastnameMismatch: 'El apellido no coincide con la reserva.',
        notFound: 'No encontramos una reserva con esos datos.',
        lookupError: 'No se pudo consultar la reserva. Revisa la URL de Apps Script.',
        titleFallback: 'Reserva Peru Nature',
        code: 'Código de reserva',
        destination: 'Destino',
        status: 'Estado de pago',
        total: 'Total',
        hotel: 'Hotel',
        room: 'Acomodación',
        passengers: 'Pasajeros',
        noHotel: 'Sin alojamiento',
        pending: 'Pendiente'
      },
      en: {
        missingEndpoint: 'Apps Script URL is not configured.',
        searching: 'Searching booking...',
        lastnameMismatch: 'The last name does not match this booking.',
        notFound: 'We could not find a booking with those details.',
        lookupError: 'Could not check the booking. Please review the Apps Script URL.',
        titleFallback: 'Peru Nature booking',
        code: 'Booking code',
        destination: 'Destination',
        status: 'Payment status',
        total: 'Total',
        hotel: 'Hotel',
        room: 'Room arrangement',
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

  function renderMessage(message) {
    if (result) result.innerHTML = `<p>${escapeHTML(message)}</p>`;
  }

  function money(total, currency) {
    const num = Number(total || 0);
    return `${currency || 'USD'} ${num.toFixed(2)}`;
  }

  function renderVoucher(reservation, passengers, code) {
    const hotel = reservation.hotel || t('noHotel');
    result.innerHTML = `
      <article class="booking-voucher">
        <div class="booking-voucher__head">
          <div>
            <h2>${escapeHTML(reservation.tourTitle || t('titleFallback'))}</h2>
            <p>${escapeHTML(reservation.destination || '-')}</p>
          </div>
          <span class="booking-voucher__code"><i class="fa-solid fa-ticket"></i> ${escapeHTML(reservation.code || code)}</span>
        </div>
        <div class="booking-voucher__grid">
          <div class="booking-voucher__row"><span>${t('code')}</span><strong>${escapeHTML(reservation.code || code)}</strong></div>
          <div class="booking-voucher__row"><span>${t('destination')}</span><strong>${escapeHTML(reservation.destination || '-')}</strong></div>
          <div class="booking-voucher__row"><span>${t('status')}</span><strong>${escapeHTML(reservation.paymentStatus || t('pending'))}</strong></div>
          <div class="booking-voucher__row"><span>${t('total')}</span><strong>${money(reservation.total, reservation.currency)}</strong></div>
          <div class="booking-voucher__row"><span>${t('hotel')}</span><strong>${escapeHTML(hotel)}</strong></div>
          <div class="booking-voucher__row"><span>${t('room')}</span><strong>${escapeHTML(reservation.room || '-')}</strong></div>
        </div>
        <h3 style="margin-top:18px">${t('passengers')}</h3>
        <ul>${passengers.map((p) => `<li>${escapeHTML(p.name || '')} ${escapeHTML(p.lastname || '')} · ${escapeHTML(p.documentType || '')} ${escapeHTML(p.documentNumber || '')}</li>`).join('')}</ul>
      </article>
    `;
  }

  async function submitLookup(code, lastname) {
    if (!endpoint) return renderMessage(t('missingEndpoint'));
    renderMessage(t('searching'));
    try {
      const url = `${endpoint}?action=reservation&code=${encodeURIComponent(code)}&lastname=${encodeURIComponent(lastname)}`;
      const response = await fetch(url);
      const json = await response.json();
      if (!json.ok) {
        return renderMessage(json.status === 'lastname_mismatch' ? t('lastnameMismatch') : t('notFound'));
      }
      renderVoucher(json.reservation || {}, json.passengers || [], code);
    } catch (error) {
      renderMessage(t('lookupError'));
    }
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const code = String(data.get('code') || '').trim().toUpperCase();
    const lastname = String(data.get('lastname') || '').trim();
    submitLookup(code, lastname);
  });

  const params = new URLSearchParams(location.search);
  const codeParam = params.get('code');
  if (codeParam && form) {
    const input = form.querySelector('input[name="code"]');
    if (input) input.value = codeParam.toUpperCase();
  }
})();
