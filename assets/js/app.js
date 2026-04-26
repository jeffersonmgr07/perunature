async function loadComponent(id, file) {
  const target = document.getElementById(id);
  if (!target) return;

  try {
    const response = await fetch(file, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${file}`);
    }

    target.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
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

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header-container", "./components/header.html");
  await loadComponent("search-bar-container", "./components/search-bar.html");
  await loadComponent("footer-container", "./components/footer.html");

  if (window.PeruNatureSearchBar) {
    new PeruNatureSearchBar();
  }

  initHeroSlider();
});
