(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const form = document.getElementById('reservationLookupForm');
  const result = document.getElementById('reservationLookupResult');

  function renderMessage(message) {
    if (result) result.innerHTML = `<p>${message}</p>`;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!endpoint) return renderMessage('Falta configurar la URL de Apps Script.');
    const data = new FormData(form);
    const code = String(data.get('code') || '').trim().toUpperCase();
    const lastname = String(data.get('lastname') || '').trim();
    renderMessage('Buscando reserva...');
    try {
      const url = `${endpoint}?action=reservation&code=${encodeURIComponent(code)}&lastname=${encodeURIComponent(lastname)}`;
      const response = await fetch(url);
      const json = await response.json();
      if (!json.ok) {
        const msg = json.status === 'lastname_mismatch' ? 'El apellido no coincide con la reserva.' : 'No encontramos una reserva con esos datos.';
        return renderMessage(msg);
      }
      const r = json.reservation || {};
      const passengers = json.passengers || [];
      result.innerHTML = `
        <div class="lookup-card">
          <h2>${r.tourTitle || 'Reserva Peru Nature'}</h2>
          <p><strong>Código:</strong> ${r.code || code}</p>
          <p><strong>Destino:</strong> ${r.destination || '-'}</p>
          <p><strong>Estado de pago:</strong> ${r.paymentStatus || 'pending'}</p>
          <p><strong>Total:</strong> ${r.currency || 'USD'} ${r.total || '0'}</p>
          <p><strong>Hotel:</strong> ${r.hotel || 'Sin alojamiento'} ${r.room ? '— ' + r.room : ''}</p>
          <h3>Pasajeros</h3>
          <ul>${passengers.map((p) => `<li>${p.name || ''} ${p.lastname || ''} · ${p.documentType || ''} ${p.documentNumber || ''}</li>`).join('')}</ul>
        </div>
      `;
    } catch (error) {
      renderMessage('No se pudo consultar la reserva. Revisa la URL de Apps Script.');
    }
  });
})();
