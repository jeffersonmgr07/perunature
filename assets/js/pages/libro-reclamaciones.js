(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const form = document.getElementById('complaintForm');
  const status = document.getElementById('complaintStatus');
  const whatsappNumber = '51929715296';

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', ok);
  }

  function buildWhatsAppFallback(complaint) {
    const lines = [
      `Registro de ${complaint.type === 'queja' ? 'QUEJA' : 'RECLAMO'} - Peru Nature`,
      `Nombre: ${complaint.consumerName || ''}`,
      `Documento: ${complaint.consumerDocType || ''} ${complaint.consumerDocNumber || ''}`,
      `Correo: ${complaint.consumerEmail || ''}`,
      `Servicio: ${complaint.serviceType || ''}`,
      `Detalle: ${complaint.detail || ''}`,
      `Pedido: ${complaint.request || ''}`
    ];
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const complaint = Object.fromEntries(data.entries());

    if (!endpoint) {
      setStatus('No se pudo conectar con el servidor. Te redirigimos a WhatsApp para registrar tu reclamo de todas formas.');
      window.setTimeout(() => window.open(buildWhatsAppFallback(complaint), '_blank', 'noopener'), 900);
      return;
    }

    setStatus('Enviando tu reclamo...');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitComplaint', complaint })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.message || 'No se pudo registrar el reclamo.');

      setStatus(`Reclamo registrado correctamente. Tu número de folio es ${json.folio}. Te responderemos al correo indicado dentro del plazo legal.`, true);
      form.reset();
    } catch (error) {
      setStatus(`${error.message || 'No se pudo registrar el reclamo.'} Puedes enviarlo directamente por WhatsApp.`);
      window.setTimeout(() => window.open(buildWhatsAppFallback(complaint), '_blank', 'noopener'), 1200);
    }
  });
})();
