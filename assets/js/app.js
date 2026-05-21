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
  document.dispatchEvent(new CustomEvent('peruNature:componentsReady'));

  if (window.PeruNatureSearchBar) new PeruNatureSearchBar();
  initHeroSlider();
});
