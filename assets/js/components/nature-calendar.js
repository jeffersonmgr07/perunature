/* Peru Nature calendar — styled, accessible month-picker shared by homepage and booking. */
(() => {
  const DAYS_ES = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];
  const DAYS_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const todayISO = () => {const d = new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const localized = () => (window.PeruNatureI18n?.getLang?.() === 'en' ? 'en-US':'es-PE');
  const format = value => {
    if (!value) return localized()==='en-US'?'Choose a date':'Seleccionar fecha';
    const [y,m,d] = value.split('-').map(Number);
    return new Date(y,m-1,d).toLocaleDateString(localized(),{day:'2-digit',month:'short',year:'numeric'});
  };
  let opened = null;
  const close = () => {if(opened){opened.pop.hidden = true;opened.button.setAttribute('aria-expanded','false');opened=null;}};
  const position = () => {
    if(!opened) return;
    const rect=opened.button.getBoundingClientRect(), pop=opened.pop;
    const margin=10, width=Math.min(330,innerWidth-2*margin);
    pop.style.width=width+'px';
    pop.style.left=Math.max(margin,Math.min(rect.left,innerWidth-width-margin))+'px';
    const availableBelow=innerHeight-rect.bottom-12;
    const popHeight=pop.offsetHeight||345;
    if(availableBelow>=popHeight || rect.top<popHeight+12){pop.style.top=Math.min(rect.bottom+8,innerHeight-popHeight-margin)+'px';}
    else{pop.style.top=Math.max(margin,rect.top-popHeight-8)+'px';}
  };
  const create = input => {
    if (!input || input.dataset.natureCalendar) return;
    input.dataset.natureCalendar = '1';
    const container = document.createElement('div');container.className='pn-nature-calendar';
    input.parentNode.insertBefore(container,input);
    container.appendChild(input);
    input.classList.add('pn-nature-calendar__native');input.tabIndex=-1;
    const button=document.createElement('button');button.type='button';button.className='pn-nature-calendar__trigger';button.setAttribute('aria-label','Seleccionar fecha de viaje');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
    const pop=document.createElement('div');pop.className='pn-nature-calendar__popover';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Calendario Perú Nature');pop.hidden=true;
    container.append(button);document.body.appendChild(pop);
    let view=new Date();view.setDate(1);
    const updateButton=()=>{button.innerHTML=`<span>${format(input.value)}</span><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`;};
    const render=()=>{
      const lang=localized();const year=view.getFullYear();const month=view.getMonth();
      const monthName=view.toLocaleDateString(lang,{month:'long',year:'numeric'});
      const start=(new Date(year,month,1).getDay()+6)%7;
      const count=new Date(year,month+1,0).getDate();
      const minimum=input.min || todayISO();const maximum=input.max||'9999-12-31';
      const cells=[];
      for(let i=0;i<start;i++)cells.push('<span class="pn-nature-calendar__blank"></span>');
      for(let day=1;day<=count;day++){
        const date=iso(year,month,day),disabled=date<minimum||date>maximum;
        cells.push(`<button type="button" class="pn-nature-calendar__day${date===input.value?' is-selected':''}${date===todayISO()?' is-today':''}" data-date="${date}" ${disabled?'disabled':''} aria-label="${date}" aria-pressed="${date===input.value}">${day}</button>`);
      }
      pop.innerHTML=`<div class="pn-nature-calendar__head"><button type="button" class="pn-nature-calendar__nav" data-month="-1" aria-label="Mes anterior">‹</button><strong>${monthName}</strong><button type="button" class="pn-nature-calendar__nav" data-month="1" aria-label="Mes siguiente">›</button></div><div class="pn-nature-calendar__grid">${(lang==='en-US'?DAYS_EN:DAYS_ES).map(x=>`<span class="pn-nature-calendar__weekday">${x}</span>`).join('')}${cells.join('')}</div><div class="pn-nature-calendar__foot"><button type="button" data-today>${lang==='en-US'?'Today':'Hoy'}</button><button type="button" data-clear>${lang==='en-US'?'Clear':'Limpiar'}</button></div>`;
      pop.querySelectorAll('[data-month]').forEach(el=>el.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();view=new Date(year,month+Number(el.dataset.month),1);render();position();}));
      const pick=value=>{if(value && (value<minimum||value>maximum))return;input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));updateButton();close();button.focus();};
      pop.querySelectorAll('[data-date]').forEach(el=>el.addEventListener('click',()=>pick(el.dataset.date)));
      pop.querySelector('[data-today]').addEventListener('click',()=>pick(todayISO()));
      pop.querySelector('[data-clear]').addEventListener('click',()=>pick(''));
    };
    button.addEventListener('click',()=>{
      if(opened?.pop===pop){close();return;}close();
      if(input.value){const [y,m]=input.value.split('-').map(Number);view=new Date(y,m-1,1);}
      else if(input.min && input.min>todayISO()){const [y,m]=input.min.split('-').map(Number);view=new Date(y,m-1,1);}
      render();pop.hidden=false;button.setAttribute('aria-expanded','true');opened={pop,button};position();
    });
    input.addEventListener('change',updateButton);
    updateButton();
  };
  const init=()=>{['pnFecha','bookingDate'].forEach(id=>create(document.getElementById(id)));};
  document.addEventListener('click',event=>{if(opened && !opened.pop.contains(event.target) && !opened.button.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  window.addEventListener('resize',position);
  window.addEventListener('scroll',position,true);
  document.addEventListener('peruNature:componentsReady',init);
  document.addEventListener('DOMContentLoaded',init);
  if(document.readyState!=='loading')init();
  document.addEventListener('peruNature:languageChanged',()=>{document.querySelectorAll('.pn-nature-calendar__native').forEach(i=>i.dispatchEvent(new Event('change')));});
})();
