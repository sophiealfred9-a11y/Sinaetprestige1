(function(){
  const qs=(s,c=document)=>c.querySelector(s), qsa=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const data=window.SINA_DATA||{}; const forms=data.formations||{};
  const formList=Array.isArray(forms)?forms:[]; const cards=qsa('.session-card');
  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const months=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const dates=cards.map(c=>c.dataset.date).filter(Boolean);
  const monthOf=d=>{const m=(d||'').match(/\d+\s+([^\s]+)\s+\d{4}/);return m?m[1]:''};
  const publics=[...new Set(cards.map(c=>c.dataset.public).filter(Boolean))];
  const families=[...new Set(formList.map(f=>f.family))];
  const themes=qs('#formation-theme'), pubs=qs('#formation-public'), dateSel=qs('#formation-date');
  const addOpts=(el,vals)=>{if(!el)return; vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});};
  addOpts(themes,families); addOpts(pubs,publics); addOpts(dateSel,[...new Set(dates.map(monthOf))]);
  const search=qs('#formation-search'), format=qs('#formation-format'), locationSel=qs('#formation-location'), status=qs('#formation-filter-status');
  const urlParams=new URLSearchParams(location.search);
  const apply=()=>{
    const q=norm(search?.value), theme=themes?.value||'', pub=pubs?.value||'', fmt=format?.value||'', loc=locationSel?.value||'', mon=dateSel?.value||'';
    const professionalContext=['professionnels','entreprise','entreprises'].includes((urlParams.get('public')||'').toLowerCase());
    let visible=0;
    cards.forEach(c=>{
      const hay=norm(c.innerText), ok=(!q||hay.includes(q))&&(!theme||c.dataset.family===theme)&&(!pub||c.dataset.public===pub)&&(!fmt||c.dataset.format===fmt)&&(!loc||c.dataset.location===loc)&&(!mon||monthOf(c.dataset.date)===mon)&&(!professionalContext||c.dataset.public!=='Tout public');
      c.classList.toggle('is-hidden',!ok); if(ok)visible++;
    });
    if(status)status.textContent=(q||theme||pub||fmt||loc||mon)?`${visible} session(s) correspondante(s)`:'';
  };
  ['input','change'].forEach(ev=>qsa('#formation-filters input,#formation-filters select').forEach(el=>el.addEventListener(ev,apply)));
  qs('#formation-search-btn')?.addEventListener('click',()=>{apply();qs('#sessions')?.scrollIntoView({behavior:'smooth',block:'start'});});
  // Domain arrows: route to a relevant page or filter the available sessions without dead links.
  const domainRoutes={
    '#ia':{themes:['IA, emploi & insertion','Entrepreneuriat, IA & commercial']},
    '#rh':{themes:['Ressources humaines & IA','Recrutement & IA','Recrutement & onboarding','RH, conformité & égalité']},
    '#management':{themes:['Management & leadership','Management & coopération']},
    '#commerce':{themes:['Commerce, prospection & IA','Commerce, vente & négociation']},
    '#projet':{themes:['Gestion de projet & changement']},
    '#emploi':{themes:['Employabilité & insertion','IA, emploi & insertion','Employabilité & cadres','Compétences & employabilité']},
    '#entrepreneuriat':{themes:['Entrepreneuriat, IA & commercial']},
    '#education':{url:'ingenierie-pedagogique.html'},
    '#public':{url:'publics.html'},
    '#international':{url:'international.html'}
  };
  qsa('.domain-arrow').forEach(a=>{const route=domainRoutes[a.getAttribute('href')]; if(!route)return; a.addEventListener('click',e=>{if(route.url){return;} e.preventDefault();const wanted=route.themes?.find(t=>formList.some(f=>f.family===t));if(wanted&&themes){themes.value=wanted;apply();qs('#sessions')?.scrollIntoView({behavior:'smooth',block:'start'});}else{qs('#formation-search')?.focus();}});});
  // Signup modal
  const modal=qs('#formation-signup-modal'), form=qs('#formation-signup-form');
  const open=(code,date,mode)=>{if(!modal)return;const f=formList.find(x=>x.code===code);qs('#signup-formation').value=f?`${code} — ${f.title}`:code;qs('#signup-date').value=date||'';qs('#signup-mode').value=mode||'';modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>qs('input[name="nom"]',form)?.focus(),40);};
  const close=()=>{if(!modal)return;modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');};
  qsa('.session-signup').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open(a.dataset.code,a.dataset.date,a.dataset.mode);}));
  qsa('[data-close-signup]').forEach(el=>el.addEventListener('click',close)); document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal?.hidden)close();});
  if(form){form.addEventListener('submit',e=>{ /* handled by formspree.js */ });}
})();