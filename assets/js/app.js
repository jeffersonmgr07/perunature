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
  document.dispatchEvent(new CustomEvent('peruNature:componentsReady'));

  if (window.PeruNatureSearchBar) new PeruNatureSearchBar();
  initHeroSlider();
});
