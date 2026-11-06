/* Peru Nature: controles accesibles, sin menús ni calendario nativos del navegador. */
(() => {
  const strings={es:{choose:'Seleccionar',search:'Buscar país o prefijo',country:'Elegir país',dial:'Código de país',phone:'Número de WhatsApp',dob:'dd/mm/aaaa'},en:{choose:'Select',search:'Search country or dial code',country:'Choose country',dial:'Country code',phone:'WhatsApp number',dob:'dd/mm/yyyy'},fr:{choose:'Sélectionner',search:'Chercher un pays ou indicatif',country:'Choisir le pays',dial:'Indicatif',phone:'Numéro WhatsApp',dob:'jj/mm/aaaa'},pt:{choose:'Selecionar',search:'Buscar país ou código',country:'Escolher país',dial:'Código do país',phone:'Número do WhatsApp',dob:'dd/mm/aaaa'}};
  const locale=()=>{const raw=(window.PeruNatureI18n?.getLang?.()||document.documentElement.lang||'es').split('-')[0];return raw;};
  const t=(key)=>(strings[locale()]||strings.en)[key]||strings.es[key];
  const flag=code=>code.replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)));
  let countriesPromise;
  const countries=()=>countriesPromise||(countriesPromise=fetch('./assets/data/countries.json').then(r=>{if(!r.ok)throw Error('countries');return r.json();}).catch(()=>[]));
  const countryName=(c)=>{try{return new Intl.DisplayNames([locale()],{type:'region'}).of(c.code)||c.name;}catch{return c.name;}};
  function setupPicker(input,options,kind){
    const current=input.value||'';const name=input.name;
    const host=document.createElement('div');host.className='pn-choice';host.dataset.kind=kind;
    const hidden=document.createElement('input');hidden.type='hidden';hidden.name=name;hidden.value=current;hidden.dataset.pnChoiceValue='';
    const btn=document.createElement('button');btn.type='button';btn.className='pn-choice__trigger';btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');
    const label=document.createElement('span');label.className='pn-choice__label';const arrow=document.createElement('span');arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');btn.append(label,arrow);
    const panel=document.createElement('div');panel.className='pn-choice__panel';panel.hidden=true;
    const filter=document.createElement('input');filter.type='search';filter.className='pn-choice__filter';filter.placeholder=t('search');filter.setAttribute('aria-label',t('search'));
    if(kind==='simple')filter.hidden=true;
    const list=document.createElement('div');list.className='pn-choice__list';list.setAttribute('role','listbox');panel.append(filter,list);
    const build=()=>{
      const q=(filter.value||'').toLocaleLowerCase();list.replaceChildren();let num=0;
      options.forEach(opt=>{
        const title=opt.label||countryName(opt);const search=`${title} ${opt.value} ${opt.dial||''} ${opt.name||''}`.toLocaleLowerCase();
        if(q&&!search.includes(q))return;
        if(num++>=249)return;
        const b=document.createElement('button');b.type='button';b.className='pn-choice__option';b.setAttribute('role','option');b.setAttribute('aria-selected',String(hidden.value===opt.value));b.textContent=(opt.code&&kind!=='simple'?`${flag(opt.code)}  `:'')+title+(kind==='dial'?' · '+(opt.dial||'—'):'');
        b.addEventListener('click',()=>{hidden.value=opt.value;host.dataset.countryCode=opt.code||'';label.textContent=(opt.code&&kind!=='simple'?`${flag(opt.code)}  `:'')+title+(kind==='dial'?' '+opt.dial:'');hidden.dispatchEvent(new Event('change',{bubbles:true}));close();});list.appendChild(b);
      });
      if(!num){const p=document.createElement('p');p.className='pn-choice__empty';p.textContent='Sin resultados';list.append(p);}
    };
    function close(){panel.hidden=true;btn.setAttribute('aria-expanded','false');}
    function place(){
      if(panel.hidden)return;
      const rect=btn.getBoundingClientRect();const width=Math.min(Math.max(rect.width,260),innerWidth-22);
      panel.style.width=width+'px';panel.style.left=Math.max(11,Math.min(rect.left,innerWidth-width-11))+'px';
      const panelHeight=Math.min(270,panel.scrollHeight||270);const below=innerHeight-rect.bottom;
      panel.style.top=(below>=panelHeight+12?rect.bottom+6:Math.max(10,rect.top-panelHeight-6))+'px';
    }
    function open(){
      document.querySelectorAll('.pn-choice__panel:not([hidden])').forEach(el=>{el.hidden=true;});
      build();panel.hidden=false;btn.setAttribute('aria-expanded','true');place();
      if(kind!=='simple')filter.focus();
    }
    document.body.appendChild(panel);
    panel.classList.add('pn-choice__panel--portal');
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    btn.addEventListener('click',()=>panel.hidden?open():close());filter.addEventListener('input',build);
    document.addEventListener('peruNature:languageChanged',()=>{
      filter.placeholder=t('search');
      if(!panel.hidden)build();
      const currentChoice=options.find(opt=>opt.value===hidden.value);
      if(currentChoice&&kind!=='simple')label.textContent=(currentChoice.code?flag(currentChoice.code)+'  ':'')+countryName(currentChoice)+(kind==='dial'?' '+currentChoice.dial:'');
    });
    host.addEventListener('keydown',e=>{if(e.key==='Escape'){close();btn.focus();}});
    document.addEventListener('pointerdown',e=>{if(!host.contains(e.target)&&!panel.contains(e.target))close();});
    const selected=options.find(o=>o.value===current||o.name===current||o.label===current);
    if(selected){hidden.value=selected.value;label.textContent=(selected.code&&kind!=='simple'?`${flag(selected.code)}  `:'')+(selected.label||countryName(selected))+(kind==='dial'?' '+selected.dial:'');}
    else label.textContent=current||t('choose');
    host.append(hidden,btn);input.replaceWith(host);
    return {host,hidden,button:btn,set:(v)=>{const o=options.find(x=>x.value===v);if(o){hidden.value=o.value;label.textContent=(o.code?flag(o.code)+' ':'')+(o.label||countryName(o))+(kind==='dial'?' '+o.dial:'');}}};
  }
  const isoToDisplay=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?`${v.slice(8,10)}/${v.slice(5,7)}/${v.slice(0,4)}`:v;
  function dateInput(input){
    const saved=input.value;const hidden=document.createElement('input');hidden.type='hidden';hidden.name=input.name;hidden.value=saved;hidden.dataset.pnBirthdate='';
    const visible=document.createElement('input');visible.type='text';visible.className='pn-birthdate';visible.inputMode='numeric';visible.autocomplete='bday';visible.placeholder=t('dob');visible.maxLength=10;visible.value=isoToDisplay(saved);visible.setAttribute('aria-label',input.closest('label')?.textContent.trim()||'Fecha de nacimiento');
    const update=()=>{const digits=visible.value.replace(/\D/g,'').slice(0,8);visible.value=[digits.slice(0,2),digits.slice(2,4),digits.slice(4,8)].filter(Boolean).join('/');let valid=false;if(digits.length===8){const day=+digits.slice(0,2),month=+digits.slice(2,4),year=+digits.slice(4,8),date=new Date(year,month-1,day);valid=year>=1900&&date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day&&date<=new Date();}hidden.value=valid?`${digits.slice(4,8)}-${digits.slice(2,4)}-${digits.slice(0,2)}`:'';visible.setCustomValidity(digits.length&&!valid?'Fecha de nacimiento no válida':'');hidden.dispatchEvent(new Event('change',{bubbles:true}));};
    visible.addEventListener('input',update);input.replaceWith(hidden,visible);if(saved&&!/^\d{4}-\d{2}-\d{2}$/.test(saved))update();
  }
  async function enhance(root){
    if(!root)return;const all=await countries();if(!root.isConnected)return;
    const opts=all.map(c=>({...c,value:c.code}));
    root.querySelectorAll('select[name$="_doctype"],select[name$="_gender"],select[name$="_language"]').forEach(sel=>{
      const options=Array.from(sel.options).filter(o=>o.value).map(o=>({value:o.value,label:o.textContent.trim()}));setupPicker(sel,options,'simple');
    });
    root.querySelectorAll('input[name$="_nationality"]').forEach(input=>{
      const picker=setupPicker(input,opts,'country');
      const saved=picker.hidden.value;const savedCode=opts.find(x=>countryName(x)===saved||x.name===saved||x.code===saved)?.code;
      if(savedCode)picker.set(savedCode);
    });
    root.querySelectorAll('input[name$="_birthdate"]').forEach(dateInput);
    const phone=root.querySelector('input[name="contact_phone"]');
    if(phone){
      const existing=phone.value||'';const wrap=document.createElement('div');wrap.className='pn-whatsapp-split';
      const prefix=document.createElement('div');prefix.className='pn-whatsapp-prefix';
      const dialOriginal=document.createElement('input');dialOriginal.name='contact_dial';dialOriginal.value='PE';
      const picker=setupPicker(dialOriginal,opts.filter(o=>o.dial).map(o=>({...o,value:o.code})),'dial');prefix.append(picker.host);
      const local=document.createElement('input');local.type='tel';local.name='contact_phone_local';local.className='pn-whatsapp-number';local.inputMode='numeric';local.autocomplete='tel-national';local.placeholder='999999999';local.minLength=6;local.maxLength=15;local.pattern='[0-9]{6,15}';
      const stored=document.createElement('input');stored.type='hidden';stored.name='contact_phone';stored.dataset.pnContactPhone='';
      const sync=()=>{local.value=local.value.replace(/\D/g,'').slice(0,15);const dial=opts.find(o=>o.code===picker.hidden.value)?.dial||'';stored.value=local.value?`${dial}${local.value}`:'';stored.dispatchEvent(new Event('change',{bubbles:true}));};
      let initial=existing.replace(/\D/g,'');let initialCode='PE';
      if(existing.startsWith('+')){const matched=opts.filter(o=>o.dial&&initial.startsWith(o.dial.slice(1))).sort((a,b)=>b.dial.length-a.dial.length)[0];if(matched){initialCode=matched.code;initial=initial.slice(matched.dial.length-1);}}
      picker.set(initialCode);local.value=initial;local.addEventListener('input',sync);picker.hidden.addEventListener('change',sync);wrap.append(prefix,local,stored);phone.replaceWith(wrap);sync();
    }
  }
  window.PNPassengerControls={enhance};
})();
