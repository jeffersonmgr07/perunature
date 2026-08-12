(function () {
  const endpoint = window.PN_APPS_SCRIPT_URL || '';
  const loginForm = document.getElementById('operatorLoginForm');
  const registerForm = document.getElementById('operatorRegisterForm');
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
        sending: 'Enviando solicitud...',
        registerError: 'No se pudo enviar la solicitud.',
        registerOk: 'Solicitud enviada. Un asesor revisará tu registro antes de habilitar el acceso.'
      },
      en: {
        missingEndpoint: 'Apps Script URL is not configured.',
        validating: 'Checking access...',
        loginError: 'Could not sign in.',
        loginOk: 'Signed in successfully.',
        sending: 'Sending application...',
        registerError: 'Could not send the application.',
        registerOk: 'Application sent. An advisor will review your registration before enabling access.'
      }
    };
    return (dict[lang()] || dict.es)[key] || key;
  }

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', ok);
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

  function saveOperatorSession(json) {
    const operator = json.operator || {};
    if (json.token) operator.token = json.token;
    localStorage.setItem('pn_operator', JSON.stringify(operator));
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    setStatus(t('validating'));
    try {
      const json = await post('loginOperator', {
        email: form.get('email'),
        password: form.get('password')
      });
      if (!json.ok) throw new Error(json.message || t('loginError'));
      saveOperatorSession(json);
      setStatus(t('loginOk'), true);
      window.setTimeout(() => { window.location.href = './perfil-operador.html'; }, 450);
    } catch (error) {
      setStatus(error.message || t('loginError'));
    }
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(registerForm);
    const operator = Object.fromEntries(form.entries());
    setStatus(t('sending'));
    try {
      const json = await post('registerOperator', operator);
      if (!json.ok) throw new Error(json.message || t('registerError'));
      setStatus(json.message || t('registerOk'), true);
      registerForm.reset();
    } catch (error) {
      setStatus(error.message || t('registerError'));
    }
  });
})();
