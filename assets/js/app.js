async function loadComponent(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent("header-container", "./components/header.html");
loadComponent("footer-container", "./components/footer.html");
