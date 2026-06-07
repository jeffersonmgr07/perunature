(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const panels = document.querySelectorAll('[data-auth-panel]');
  const status = document.getElementById('authStatus');

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', ok);
  }

  function showPanel(panel) {
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.authTab === panel));
    panels.forEach((item) => item.hidden = item.dataset.authPanel !== panel);
  }

  async function post(action, payload) {
    if (!endpoint) throw new Error('Falta configurar window.PN_APPS_SCRIPT_URL.');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    return response.json();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => showPanel(tab.dataset.authTab)));

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    setStatus('Validando acceso...');
    try {
      const json = await post('loginCustomer', { email: form.get('email'), password: form.get('password') });
      if (!json.ok) throw new Error(json.message || 'No se pudo iniciar sesión.');
      localStorage.setItem('pn_customer', JSON.stringify(json.customer));
      setStatus('Sesión iniciada correctamente. Tus datos se usarán para la reserva.', true);
    } catch (error) {
      setStatus(error.message);
    }
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(registerForm);
    const customer = Object.fromEntries(form.entries());
    setStatus('Creando cuenta...');
    try {
      const json = await post('registerCustomer', { customer });
      if (!json.ok) throw new Error(json.message || 'No se pudo registrar.');
      localStorage.setItem('pn_customer', JSON.stringify(json.customer));
      setStatus('Cuenta creada correctamente. Ya puedes iniciar una reserva con tus datos precargados.', true);
    } catch (error) {
      setStatus(error.message);
    }
  });

  const params = new URLSearchParams(location.search);
  showPanel(params.get('mode') === 'register' ? 'register' : 'login');
})();
