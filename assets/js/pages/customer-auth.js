(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const status = document.getElementById('authStatus');

  function lang() {
    return window.PeruNatureI18n?.getLang?.() || localStorage.getItem('pn_lang') || document.documentElement.lang || 'es';
  }

  function t(key) {
    const dict = {
      es: {
        missingEndpoint: 'Falta configurar la URL de Apps Script.',
        validating: 'Validando acceso...',
        loginError: 'No se pudo iniciar sesión.',
        loginOk: 'Sesión iniciada correctamente.',
        creating: 'Creando cuenta...',
        registerError: 'No se pudo registrar.',
        registerOk: 'Cuenta creada correctamente.'
      },
      en: {
        missingEndpoint: 'Apps Script URL is not configured.',
        validating: 'Checking access...',
        loginError: 'Could not sign in.',
        loginOk: 'Signed in successfully.',
        creating: 'Creating account...',
        registerError: 'Could not register.',
        registerOk: 'Account created successfully.'
      }
    };
    return (dict[lang()] || dict.es)[key] || key;
  }

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', ok);
  }

  function redirectTarget() {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || './perfil.html';
  }

  function saveCustomerSession(json) {
    const customer = json.customer || {};
    if (json.token) customer.token = json.token;
    localStorage.setItem('pn_customer', JSON.stringify(customer));
    document.dispatchEvent(new CustomEvent('peruNature:customerChanged'));
  }

  async function post(action, payload) {
    if (!endpoint) throw new Error(t('missingEndpoint'));
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    return response.json();
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    setStatus(t('validating'));
    try {
      const json = await post('loginCustomer', {
        email: form.get('email'),
        password: form.get('password')
      });
      if (!json.ok) throw new Error(json.message || t('loginError'));
      saveCustomerSession(json);
      setStatus(t('loginOk'), true);
      window.setTimeout(() => { window.location.href = redirectTarget(); }, 450);
    } catch (error) {
      setStatus(error.message || t('loginError'));
    }
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(registerForm);
    const customer = Object.fromEntries(form.entries());
    setStatus(t('creating'));
    try {
      const json = await post('registerCustomer', { customer });
      if (!json.ok) throw new Error(json.message || t('registerError'));
      saveCustomerSession(json);
      setStatus(t('registerOk'), true);
      window.setTimeout(() => { window.location.href = './perfil.html'; }, 550);
    } catch (error) {
      setStatus(error.message || t('registerError'));
    }
  });
})();
