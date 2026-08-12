// Carga un JSON de catálogo respetando el idioma activo: si hay un
// selector en inglés, intenta "archivo.en.json" primero y solo si no
// existe (o falla) cae de vuelta al archivo en español. Así el sitio
// nunca muestra un catálogo vacío mientras se van agregando
// traducciones, y cada página deja de tener que reimplementar esta
// lógica por su cuenta.
async function fetchLocalizedJson(path) {
  const tryFetch = async (url) => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_error) {
      return null;
    }
  };

  const lang = window.PeruNatureI18n?.getLang?.() || localStorage.getItem("pn_lang") || "es";
  if (lang === "en") {
    const localized = await tryFetch(path.replace(/\.json$/i, ".en.json"));
    if (localized) return localized;
  }
  return tryFetch(path);
}

window.PeruNatureData = { fetchLocalizedJson };

async function loadComponent(id, file) {
  const target = document.getElementById(id);
  if (!target) return false;

  try {
    const response = await fetch(file, { cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
    target.innerHTML = await response.text();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;

  let index = 0;
  setInterval(() => {
    slides[index].classList.remove("is-active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("is-active");
  }, 5200);
}

function getPeruNatureCustomer() {
  try {
    return JSON.parse(localStorage.getItem('pn_customer') || 'null');
  } catch (_error) {
    return null;
  }
}

function initCustomerHeader() {
  const customer = getPeruNatureCustomer();
  const profileLink = document.querySelector('[data-auth-link="profile"]');
  const loginLink = document.querySelector('[data-auth-link="login"]');
  const registerLink = document.querySelector('[data-auth-link="register"]');

  if (profileLink) {
    profileLink.href = customer ? './perfil.html' : './login.html?redirect=perfil.html';
    profileLink.setAttribute('data-i18n', 'nav.viewReservation');
  }

  if (loginLink) {
    loginLink.href = customer ? './perfil.html' : './login.html';
    loginLink.setAttribute('data-i18n', customer ? 'nav.profile' : 'nav.loginShort');
  }

  if (registerLink) {
    registerLink.href = customer ? '#' : './registro.html';
    registerLink.setAttribute('data-i18n', customer ? 'nav.logout' : 'nav.register');
    registerLink.onclick = customer
      ? (event) => {
          event.preventDefault();
          localStorage.removeItem('pn_customer');
          document.dispatchEvent(new CustomEvent('peruNature:customerChanged'));
          window.location.href = './login.html';
        }
      : null;
  }

  if (window.PeruNatureI18n?.translate) window.PeruNatureI18n.translate();
}

function initReservationMenu() {
  document.querySelectorAll('.reservation-menu').forEach((menu) => {
    const toggle = menu.querySelector('.reservation-menu__toggle');
    const dropdown = menu.querySelector('.reservation-menu__dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = !dropdown.hidden;
      document.querySelectorAll('.reservation-menu__dropdown').forEach((otherDropdown) => {
        otherDropdown.hidden = true;
        otherDropdown.closest('.reservation-menu')?.classList.remove('is-open');
        otherDropdown.closest('.reservation-menu')?.querySelector('.reservation-menu__toggle')?.setAttribute('aria-expanded', 'false');
      });
      dropdown.hidden = isOpen;
      menu.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.reservation-menu__dropdown').forEach((dropdown) => {
      dropdown.hidden = true;
      dropdown.closest('.reservation-menu')?.classList.remove('is-open');
      dropdown.closest('.reservation-menu')?.querySelector('.reservation-menu__toggle')?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initMobileMenu() {
  const button = document.querySelector('.mobile-menu-btn');
  const nav = document.getElementById('mainNavigation');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("header-container", "./components/header.html"),
    loadComponent("header", "./components/header.html"),
    loadComponent("search-bar-container", "./components/search-bar.html"),
    loadComponent("footer-container", "./components/footer.html"),
    loadComponent("footer", "./components/footer.html")
  ]);

  initMobileMenu();
  initReservationMenu();
  initCustomerHeader();
  document.dispatchEvent(new CustomEvent('peruNature:componentsReady'));

  if (window.PeruNatureSearchBar) window.peruNatureSearchBarInstance = new PeruNatureSearchBar();
  initHeroSlider();
});

document.addEventListener('peruNature:customerChanged', initCustomerHeader);
document.addEventListener('peruNature:languageChanged', initCustomerHeader);
