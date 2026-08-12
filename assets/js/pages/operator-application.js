(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const form = document.getElementById('operatorApplicationForm');
  const status = document.getElementById('applicationStatus');
  const whatsappNumber = '51929715296';

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', ok);
  }

  function buildWhatsAppFallback(application) {
    const lines = [
      'Postulación a Peru Nature Partner Network',
      `Negocio: ${application.companyName || ''}`,
      `Categoría: ${application.category || ''}`,
      `RUC: ${application.ruc || ''}`,
      `Región: ${application.region || ''}`,
      `Contacto: ${application.contactName || ''}`,
      `Correo: ${application.email || ''}`,
      `WhatsApp: ${application.whatsapp || ''}`,
      `Web/redes: ${application.website || ''}`,
      `Servicios: ${application.servicesOffered || ''}`,
      `Mensaje: ${application.message || ''}`
    ];
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const application = Object.fromEntries(data.entries());

    if (!endpoint) {
      setStatus('No se pudo conectar con el servidor. Te redirigimos a WhatsApp para enviar tu postulación de todas formas.');
      window.setTimeout(() => window.open(buildWhatsAppFallback(application), '_blank', 'noopener'), 900);
      return;
    }

    setStatus('Enviando postulación...');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitOperatorApplication', application })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.message || 'No se pudo enviar la postulación.');

      setStatus('¡Postulación recibida! Un asesor de alianzas te contactará en los próximos días.', true);
      form.reset();
    } catch (error) {
      setStatus(`${error.message || 'No se pudo enviar la postulación.'} Puedes enviarla directamente por WhatsApp.`);
      window.setTimeout(() => window.open(buildWhatsAppFallback(application), '_blank', 'noopener'), 1200);
    }
  });
})();
