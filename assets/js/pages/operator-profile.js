(function () {
  const operatorInfo = document.getElementById('operatorInfo');
  const logoutButton = document.getElementById('logoutButton');

  function lang() {
    return window.PeruNatureI18n?.getLang?.() || localStorage.getItem('pn_lang') || document.documentElement.lang || 'es';
  }

  function t(key) {
    const dict = {
      es: {
        missingLogin: 'Necesitas iniciar sesión para ver tu panel de operador.',
        signIn: 'Iniciar sesión',
        defaultCompanyName: 'Operador Peru Nature',
        ruc: 'RUC',
        contact: 'Contacto',
        email: 'Correo',
        region: 'Región',
        accountStatus: 'Estado de la cuenta',
        active: 'Activo'
      },
      en: {
        missingLogin: 'You need to sign in to view your operator dashboard.',
        signIn: 'Sign in',
        defaultCompanyName: 'Peru Nature operator',
        ruc: 'Tax ID (RUC)',
        contact: 'Contact',
        email: 'Email',
        region: 'Region',
        accountStatus: 'Account status',
        active: 'Active'
      }
    };
    return dict[lang()]?.[key] || dict.es[key];
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function getOperator() {
    try { return JSON.parse(localStorage.getItem('pn_operator') || 'null'); } catch (_error) { return null; }
  }

  function renderNotLogged() {
    if (!operatorInfo) return;
    operatorInfo.innerHTML = `<p>${t('missingLogin')}</p><a class="auth-button" href="./login-operadores.html">${t('signIn')}</a>`;
  }

  function renderOperator(operator) {
    if (!operatorInfo) return;
    operatorInfo.innerHTML = `
      <strong>${escapeHTML(operator.companyName || operator.email || t('defaultCompanyName'))}</strong>
      <span>${t('ruc')}: <strong>${escapeHTML(operator.ruc || '-')}</strong></span>
      <span>${t('contact')}: <strong>${escapeHTML(operator.contactName || '-')}</strong></span>
      <span>${t('email')}: <strong>${escapeHTML(operator.email || '-')}</strong></span>
      <span>${t('region')}: <strong>${escapeHTML(operator.region || '-')}</strong></span>
      <span>${t('accountStatus')}: <strong>${escapeHTML(operator.status || t('active'))}</strong></span>
    `;
  }

  logoutButton?.addEventListener('click', () => {
    localStorage.removeItem('pn_operator');
    window.location.href = './login-operadores.html';
  });

  function init() {
    const operator = getOperator();
    if (!operator) return renderNotLogged();
    renderOperator(operator);
  }

  init();

  document.addEventListener('peruNature:languageChanged', () => {
    const operator = getOperator();
    if (!operator) return renderNotLogged();
    renderOperator(operator);
  });
})();
