(function(){
  const grid = document.getElementById("resultsGrid");
  const countEl = document.getElementById("resultsCount");
  const filtersEl = document.getElementById("activeFilters");
  const empty = document.getElementById("emptyState");
  const subtitle = document.getElementById("resultsSubtitle");

  const mctDestino = document.getElementById("mctDestino");
  const qInput = document.getElementById("q");
  const applyBtn = document.getElementById("applyFilters");
  const tabs = document.querySelectorAll(".tab[data-type]");

  if (!grid) return;

  // Dataset simple (puedes ampliar)
  const items = [
    // TOURS
    {
      id:"t-cusco-1",
      tipo:"tours",
      destino:"cusco",
      titulo:"Cusco City + Sacsayhuamán",
      desc:"Recorrido cultural con guía y horarios controlados.",
      chips:["Tours","Cultura","Cusco"],
      img:"https://images.unsplash.com/photo-1541711219895-07c7b08f6452?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"t-mp-1",
      tipo:"tours",
      destino:"machu-picchu",
      titulo:"Machu Picchu Full Day",
      desc:"Una experiencia emblemática con logística y tiempos claros.",
      chips:["Tours","Clásico","Machu Picchu"],
      img:"https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"t-ica-1",
      tipo:"tours",
      destino:"ica",
      titulo:"Huacachina: Dunas & Atardecer",
      desc:"Aventura en el desierto con control de grupo y seguridad.",
      chips:["Tours","Aventura","Ica"],
      img:"https://images.unsplash.com/photo-1533587851505-15ce70e1e7f3?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"t-arequipa-1",
      tipo:"tours",
      destino:"arequipa",
      titulo:"Arequipa: Ruta Colonial",
      desc:"Arquitectura, miradores y gastronomía local.",
      chips:["Tours","Ciudad","Arequipa"],
      img:"https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"t-paracas-1",
      tipo:"tours",
      destino:"paracas",
      titulo:"Islas Ballestas",
      desc:"Navegación y fauna con operador y horarios organizados.",
      chips:["Tours","Naturaleza","Paracas"],
      img:"https://images.unsplash.com/photo-1558980664-10e7170d969b?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"t-huaraz-1",
      tipo:"tours",
      destino:"huaraz",
      titulo:"Laguna 69 (Aventura)",
      desc:"Caminata con guía y enfoque responsable.",
      chips:["Tours","Montaña","Huaraz"],
      img:"https://images.unsplash.com/photo-1506462945848-ac8ea6f609cc?auto=format&fit=crop&w=1400&q=80"
    },

    // PAQUETES
    {
      id:"p-cusco-1",
      tipo:"paquetes",
      destino:"cusco",
      titulo:"Cusco + Valle Sagrado (3D/2N)",
      desc:"Programa compacto con servicios coordinados.",
      chips:["Paquete","Cultura","Cusco"],
      img:"https://images.unsplash.com/photo-1541711219895-07c7b08f6452?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"p-cusco-2",
      tipo:"paquetes",
      destino:"machu-picchu",
      titulo:"Cusco + Machu Picchu (4D/3N)",
      desc:"Plan integral con acompañamiento y tiempos bien definidos.",
      chips:["Paquete","Clásico","Machu Picchu"],
      img:"https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"p-ica-1",
      tipo:"paquetes",
      destino:"ica",
      titulo:"Ica + Paracas (2D/1N)",
      desc:"Mar y desierto con itinerario equilibrado.",
      chips:["Paquete","Aventura","Ica/Paracas"],
      img:"https://images.unsplash.com/photo-1533587851505-15ce70e1e7f3?auto=format&fit=crop&w=1400&q=80"
    },

    // PROMO (viajes de promoción)
    {
      id:"promo-cusco-1",
      tipo:"promo",
      destino:"cusco",
      titulo:"Promo: Cusco + Machu Picchu",
      desc:"Clásico para promociones con control de grupo y soporte 24/7.",
      chips:["Promo","Nacional","Clásico"],
      img:"https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"promo-ica-1",
      tipo:"promo",
      destino:"ica",
      titulo:"Promo: Ica + Paracas + Huacachina",
      desc:"Actividades memorables con logística y supervisión.",
      chips:["Promo","Nacional","Aventura"],
      img:"https://images.unsplash.com/photo-1533587851505-15ce70e1e7f3?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"promo-cartagena-1",
      tipo:"promo",
      destino:"cartagena",
      titulo:"Promo: Cartagena + Islas",
      desc:"Internacional con acompañamiento, orden y planificación.",
      chips:["Promo","Internacional","Playa"],
      img:"https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"promo-orlando-1",
      tipo:"promo",
      destino:"orlando",
      titulo:"Promo: Orlando (Parques Temáticos)",
      desc:"Programa internacional con coordinación y soporte.",
      chips:["Promo","Internacional","Parques"],
      img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id:"promo-punta-1",
      tipo:"promo",
      destino:"punta-cana",
      titulo:"Promo: Punta Cana",
      desc:"Resorts, actividades y enfoque en bienestar del grupo.",
      chips:["Promo","Internacional","Resort"],
      img:"https://images.unsplash.com/photo-1500514966906-fe245eea9344?auto=format&fit=crop&w=1400&q=80"
    }
  ];

  function getParams(){
    const url = new URL(window.location.href);
    return {
      destino: (url.searchParams.get("destino") || "").trim(),
      tipo: (url.searchParams.get("tipo") || "").trim(), // tours|paquetes|promo
      q: (url.searchParams.get("q") || "").trim()
    };
  }

  function setTabActive(type){
    if (!tabs?.length) return;
    tabs.forEach(t=>{
      const isActive = t.dataset.type === type;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function render(list){
    grid.innerHTML = "";

    if (!list.length){
      empty.hidden = false;
      if (countEl) countEl.textContent = "";
      return;
    }
    empty.hidden = true;

    list.forEach(item=>{
      const el = document.createElement("article");
      el.className = "card";
      el.innerHTML = `
        <div class="card-img" style="background-image:url('${item.img}')"></div>
        <div class="card-body">
          <div class="chips">${item.chips.map(c=>`<span class="chip">${escapeHtml(c)}</span>`).join("")}</div>
          <h3>${escapeHtml(item.titulo)}</h3>
          <p>${escapeHtml(item.desc)}</p>
          <a class="btn btn-outline" href="https://wa.me/51929715269" target="_blank" rel="noopener">
            Pedir cotización
          </a>
        </div>
      `;
      grid.appendChild(el);
    });

    if (countEl) countEl.textContent = `${list.length} resultado(s)`;
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function applyFromURL(){
    const {destino, tipo, q} = getParams();

    if (mctDestino && destino) mctDestino.value = destino;
    if (qInput && q) qInput.value = q;

    const inferredTipo = tipo || "tours";
    setTabActive(inferredTipo);

    const filters = [];
    if (inferredTipo) filters.push(`tipo: ${inferredTipo}`);
    if (destino) filters.push(`destino: ${destino}`);
    if (q) filters.push(`texto: "${q}"`);

    if (filtersEl) filtersEl.textContent = filters.length ? `Mostrando: ${filters.join(" · ")}` : "Mostrando: todos";
    if (subtitle && (destino || tipo || q)) subtitle.textContent = "Resultados filtrados según tu búsqueda.";

    const list = items.filter(it=>{
      const okTipo = inferredTipo ? it.tipo === inferredTipo : true;
      const okDestino = destino ? it.destino === destino : true;
      const okQ = q
        ? (it.titulo + " " + it.desc + " " + it.chips.join(" ")).toLowerCase().includes(q.toLowerCase())
        : true;
      return okTipo && okDestino && okQ;
    });

    render(list);
  }

  // Tab clicks update URL
  tabs?.forEach(t=>{
    t.addEventListener("click", ()=>{
      const type = t.dataset.type;
      const url = new URL(window.location.href);
      url.searchParams.set("tipo", type);
      window.history.replaceState({}, "", url.toString());
      applyFromURL();
    });
  });

  // Apply filters from mini form
  applyBtn?.addEventListener("click", ()=>{
    const url = new URL(window.location.href);
    if (mctDestino?.value) url.searchParams.set("destino", mctDestino.value);
    else url.searchParams.delete("destino");

    const q = (qInput?.value || "").trim();
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");

    window.location.href = url.toString();
  });

  applyFromURL();
})();
