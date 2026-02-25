(function(){
  const tabs = document.querySelectorAll(".tab[data-type]");
  const btn = document.getElementById("mctBuscar");
  const destino = document.getElementById("mctDestino");
  const fecha = document.getElementById("mctFecha");
  const pax = document.getElementById("mctPax");

  if (!tabs.length || !btn || !destino) return;

  let activeType = "tours";

  function setActive(type){
    activeType = type;
    tabs.forEach(t => {
      const isActive = t.dataset.type === type;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  tabs.forEach(t => t.addEventListener("click", () => setActive(t.dataset.type)));

  btn.addEventListener("click", () => {
    const d = (destino.value || "").trim();
    const f = (fecha?.value || "").trim();
    const p = (pax?.value || "").trim();

    const params = new URLSearchParams();
    if (d) params.set("destino", d);
    if (activeType) params.set("tipo", activeType);
    if (f) params.set("fecha", f);
    if (p) params.set("pax", p);

    window.location.href = `all-experiences.html?${params.toString()}`;
  });
})();
