(function(){
  const qs=(s,c=document)=>c && c.querySelector ? c.querySelector(s) : null, qsa=(s,c=document)=>c && c.querySelectorAll ? Array.from(c.querySelectorAll(s)) : [];
  const data=window.SINA_DATA||{};
  const forms=data.formations||[];
  const sessions=data.sessions||{};
  const pdfMap={};
  forms.forEach(f=>pdfMap[f.code]=`pdfs/${f.code.toLowerCase()}.pdf`);

  const imageForFamily=(family)=>{
    if(/emploi|employabil/i.test(family)) return 'images/formation-career.webp';
    if(/rh|recrut/i.test(family)) return 'images/formation-rh.webp';
    if(/commerce|vente|prospection/i.test(family)) return 'images/formation-vente.webp';
    if(/projet|management/i.test(family)) return 'images/formation-gestion.webp';
    if(/ia|data|cloud|it/i.test(family)) return 'images/formation-Ia.digi.webp';
    return 'images/formation-gestiondeprojet.webp';
  };
  const publicFor=(f)=>{
    if(/management|manager/i.test(f.family)) return 'Managers';
    if(/commerce|vente|prospection/i.test(f.family)) return 'Commerciaux';
    if(/rh|recrut|cse|qvct|prévention/i.test(f.family)) return 'Professionnels RH';
    return 'Tout public';
  };
  const monthNumber=(date)=>{
    const m={'janvier':0,'février':1,'mars':2,'avril':3,'mai':4,'juin':5,'juillet':6,'août':7,'septembre':8,'octobre':9,'novembre':10,'décembre':11};
    const name=(date.match(/\d+\s+([^\s]+)\s+20\d{2}/)||[])[1]||''; return m[name.toLowerCase()] ?? -1;
  };
  const monthName=(date)=>{const a=date.match(/\d+\s+([^\s]+)\s+(20\d{2})/);return a?`${a[1]} ${a[2]}`:''};
  const parseDate=(date)=>{const m=date.match(/(\d+)\s+([^\s]+)\s+(20\d{2})/); if(!m)return null; const months=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']; return new Date(Number(m[3]),months.indexOf(m[2].toLowerCase()),Number(m[1]));};
  const events=[];
  forms.forEach(f => (sessions[f.code] || []).forEach(pair => events.push({code:f.code,title:f.title,family:f.family,date:pair[0],mode:pair[1],public:publicFor(f),location:pair[1].includes('Distanciel')?'France entière':'Normandie',month:monthName(pair[0]),monthNum:monthNumber(pair[0])})));

  const list=qs('#session-list');
  let visibleLimit=5;
  let loadMoreButton=null;
  const makeRow=(x)=>{
    const d=parseDate(x.date); const day=d?String(d.getDate()).padStart(2,'0'):''; const mon=d?d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','').toUpperCase():''; const yr=d?d.getFullYear():'';
    const row=document.createElement('article'); row.className='calendar-row';
    row.dataset.category=x.family; row.dataset.public=x.public; row.dataset.mode=x.mode.includes('Distanciel')?'Distanciel':'Présentiel'; row.dataset.location=x.location; row.dataset.month=x.month; row.dataset.funding='À préciser'; row.dataset.code=x.code;
    const q=new URLSearchParams({formation:x.code,date:x.date,modalite:x.mode});
    row.innerHTML=`<div class="datebox"><strong>${day}</strong><span>${mon}</span><small>${yr}</small><span class="status gold-status">INSCRIPTIONS<br>OUVERTES</span></div><img class="cal-thumb" src="${imageForFamily(x.family)}" alt="${x.title}"><div class="cal-info"><h3>${x.title}</h3><div class="family">${x.family}</div><p>Prochaine session officielle.</p><div class="meta"><span>◷ 7 h - 1 jour</span><span>◉ ${x.mode.includes('Distanciel')?'Distanciel':'Présentiel'}</span><span>♙ ${x.public}</span></div></div><div class="cal-meta">⌖ ${x.mode}<br>◷ 09h00 – 17h30<br>♙ Places disponibles</div><div class="cal-actions"><a class="m-btn light small" href="${pdfMap[x.code]}" target="_blank" rel="noopener">Voir le programme</a><a class="m-btn gold small cal-signup" href="#inscription" data-code="${x.code}" data-date="${x.date}" data-mode="${x.mode}">S’inscrire</a></div>`;
    return row;
  };
  if(list){
    list.innerHTML='';
    events.forEach(e=>list.appendChild(makeRow(e)));
    loadMoreButton=document.createElement('button');
    loadMoreButton.type='button';
    loadMoreButton.className='load-more-sessions';
    loadMoreButton.textContent='Charger plus de dates';
    list.insertAdjacentElement('afterend',loadMoreButton);
    loadMoreButton.addEventListener('click',()=>{visibleLimit+=5;applyFilters();});
  }

  const selectOptions={
    '#filter-theme':['',...Array.from(new Set(forms.map(f=>f.family)))],
    '#filter-public':['',...Array.from(new Set(events.map(e=>e.public)))],
    '#filter-mode':['','Présentiel','Distanciel'],
    '#filter-location':['','France entière','Normandie'],
    '#filter-month':['',...Array.from(new Set(events.map(e=>e.month)))],
    '#filter-funding':['','À préciser','OPCO','France Travail','Entreprise','Financement personnel']
  };
  Object.entries(selectOptions).forEach(([sel,opts])=>{const el=qs(sel);if(!el)return; const first=el.options[0]; el.innerHTML=''; const ph=first?.textContent||'Filtrer'; const o0=document.createElement('option');o0.value='';o0.textContent=ph;el.appendChild(o0); opts.slice(1).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});});

  const domainGroups={
    ia:['IA, emploi & insertion','Entrepreneuriat, IA & commercial'],
    rh:['Ressources humaines & IA','Recrutement & IA','Recrutement & onboarding','RH, conformité & égalité'],
    management:['Management & leadership','Management & coopération'],
    commerce:['Commerce, prospection & IA','Commerce, vente & négociation'],
    projet:['Gestion de projet & changement'],
    emploi:['Employabilité & insertion','IA, emploi & insertion','Employabilité & cadres','Compétences & employabilité'],
    entrepreneuriat:['Entrepreneuriat, IA & commercial'],
    education:['Éducation & pédagogie'],
    public:['Administrations & secteur public'],
    international:['International']
  };
  const domainLabels={
    ia:'Intelligence Artificielle', rh:'Ressources Humaines', management:'Management & Leadership',
    commerce:'Commerce & Expérience Client', projet:'Gestion de Projet',
    emploi:'Employabilité & Recrutement', entrepreneuriat:'Entrepreneuriat & Business',
    education:'Éducation & Pédagogie', public:'Administrations & Secteur Public',
    international:'International'
  };
  const urlParams=new URLSearchParams(location.search);
  let activeDomain=(urlParams.get('domaine')||'').toLowerCase();
  const applyFilters=()=>{
    const search=(qs('#filter-search')?.value||'').trim().toLowerCase();
    const theme=qs('#filter-theme')?.value||'', pub=qs('#filter-public')?.value||'', mode=qs('#filter-mode')?.value||'', loc=qs('#filter-location')?.value||'', month=qs('#filter-month')?.value||'', funding=qs('#filter-funding')?.value||'';
    const professionalContext=['professionnels','entreprise','entreprises'].includes((urlParams.get('public')||'').toLowerCase());
    const domainThemes=domainGroups[activeDomain]||[];
    const matchingRows=[];
    qsa('.calendar-row').forEach(r=>{
      const txt=r.innerText.toLowerCase();
      const okDomain=!domainThemes.length || domainThemes.includes(r.dataset.category);
      const okContext=!professionalContext || r.dataset.public!=='Tout public';
      const matches=okDomain && okContext && (!search||txt.includes(search)) && (!theme||r.dataset.category===theme) && (!pub||r.dataset.public===pub) && (!mode||r.dataset.mode===mode) && (!loc||r.dataset.location===loc) && (!month||r.dataset.month===month) && (!funding||r.dataset.funding===funding);
      r.dataset.filterMatch=matches?'true':'false';
      if(matches)matchingRows.push(r);
    });
    qsa('.calendar-row').forEach(r=>{r.hidden=r.dataset.filterMatch!=='true'||matchingRows.indexOf(r)>=visibleLimit;});
    if(loadMoreButton){loadMoreButton.hidden=matchingRows.length<=visibleLimit;loadMoreButton.textContent=`Charger plus de dates (${Math.min(5,matchingRows.length-visibleLimit)})`;}
    const label=qs('#active-domain-label');
    if(label){
      label.hidden=!activeDomain||!domainLabels[activeDomain];
      if(domainLabels[activeDomain]) label.textContent='Domaine actif : '+domainLabels[activeDomain];
    }
    renderCalendar();
  };
  ['#filter-search','#filter-theme','#filter-public','#filter-mode','#filter-location','#filter-month','#filter-funding'].forEach(s=>qs(s)?.addEventListener('input',()=>{visibleLimit=5;applyFilters();}));
  qs('#reset-filters')?.addEventListener('click',()=>{['#filter-search','#filter-theme','#filter-public','#filter-mode','#filter-location','#filter-month','#filter-funding'].forEach(s=>{const e=qs(s);if(e)e.value='';});activeDomain=''; const u=new URL(location.href); u.search=''; history.replaceState({},'',u); applyFilters();});

  const quick=qs('#inscription');
  const quickCard=quick?.closest('.quick-card');
  let signupModal=null, selectedSession=null;
  if(quick&&quickCard){
    const quickTitle=qs('h2',quickCard); if(quickTitle)quickTitle.textContent='Inscription rapide';
    const quickSubmit=qs('button[type="submit"]',quick); if(quickSubmit)quickSubmit.textContent='Envoyer ma demande';
    signupModal=document.createElement('div'); signupModal.className='formation-signup-modal'; signupModal.hidden=true;
    signupModal.innerHTML='<div class="formation-signup-backdrop" data-signup-close></div><div class="formation-signup-dialog" role="dialog" aria-modal="true" aria-labelledby="formation-signup-title"><button class="formation-signup-close" type="button" aria-label="Fermer" data-signup-close>&times;</button><div class="formation-signup-heading"><span class="kicker">Inscription à une session</span><h2 id="formation-signup-title">Votre demande d’inscription</h2><div class="formation-selected-session" aria-live="polite"></div></div></div>';
    document.body.appendChild(signupModal);
    const signupDialog=qs('.formation-signup-dialog',signupModal);
    if(signupDialog) signupDialog.appendChild(quickCard);
    signupModal.querySelectorAll('[data-signup-close]').forEach(control=>control.addEventListener('click',()=>{signupModal.hidden=true;document.body.classList.remove('signup-modal-open');}));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&signupModal&&!signupModal.hidden){signupModal.hidden=true;document.body.classList.remove('signup-modal-open');}});
  }
  const openSignup=()=>{if(!signupModal)return;signupModal.hidden=false;document.body.classList.add('signup-modal-open');signupModal.querySelector('input:not([type=hidden])')?.focus();};
  function fillQuick(code,date,mode){
    if(!quick)return;
    const formation=forms.find(f=>f.code===code);
    selectedSession={code,date,mode,title:formation?.title||code};
    const sel=qs('#quick-formation',quick); if(sel){if(!sel.options.length){forms.forEach(f=>{const o=document.createElement('option');o.value=f.code;o.textContent=f.title;sel.appendChild(o);});} sel.value=code;}
    const dateInput=qs('input[name="session_date"]',quick), modeInput=qs('input[name="modalite"]',quick); if(dateInput)dateInput.value=date||''; if(modeInput)modeInput.value=mode||'';
    const summary=qs('.formation-selected-session',signupModal); if(summary)summary.innerHTML=`<strong>${selectedSession.title}</strong><span>${date||'Date à confirmer'}</span><span>${mode||'Modalité à confirmer'}</span>`;
    openSignup();
  }
  qsa('.cal-signup').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();fillQuick(a.dataset.code,a.dataset.date,a.dataset.mode);}));
  if(quick){
    const sel=qs('#quick-formation',quick); if(sel&&!sel.options.length)forms.forEach(f=>{const o=document.createElement('option');o.value=f.code;o.textContent=f.title;sel.appendChild(o);});
  }
  const params=new URLSearchParams(location.search); if(params.get('formation')&&quick)setTimeout(()=>fillQuick(params.get('formation').toUpperCase(),params.get('date')||'',params.get('modalite')||''),30);
  setTimeout(()=>applyFilters(),40);

  // List / calendar view
  const listView=qs('#session-list'), calView=qs('#calendar-view');
  const showView=(which)=>{const listBtn=qs('#view-list'), calBtn=qs('#view-calendar'); const isCal=which==='calendar'; if(listView)listView.hidden=isCal; if(calView)calView.hidden=!isCal; listBtn?.classList.toggle('active',!isCal);calBtn?.classList.toggle('active',isCal); if(isCal)renderCalendar();};
  qs('#view-list')?.addEventListener('click',()=>showView('list')); qs('#view-calendar')?.addEventListener('click',()=>showView('calendar'));
  function renderCalendar(){
    const grid=qs('#calendar-grid'), label=qs('#calendar-month-label'); if(!grid)return;
    const visible=events.filter((x)=>{const row=qsa('.calendar-row').find(r=>r.dataset.code===x.code && r.querySelector('.cal-signup')?.dataset.date===x.date); return row&&!row.hidden;});
    const groups={}; visible.forEach(x=>(groups[x.month]??=[]).push(x)); grid.innerHTML='';
    Object.keys(groups).sort((a,b)=>{const da=parseDate(groups[a][0].date),db=parseDate(groups[b][0].date);return da-db;}).forEach(month=>{const box=document.createElement('div');box.className='calendar-month';box.innerHTML=`<h4>${month}</h4>`;groups[month].forEach(x=>{const e=document.createElement('button');e.type='button';e.className='calendar-event';e.innerHTML=`<strong>${parseDate(x.date)?.getDate()||''}</strong><span>${x.code} · ${x.title}</span><small>${x.mode}</small>`;e.addEventListener('click',()=>fillQuick(x.code,x.date,x.mode));box.appendChild(e);});grid.appendChild(box);});
    if(label)label.textContent=`${visible.length} session(s) affichée(s)`;
  }

  // Force all published sessions to the open/yellow state: no registration counts are represented in source data.
  qsa('.status').forEach(s=>{s.className='status gold-status';s.innerHTML='INSCRIPTIONS<br>OUVERTES';});

  const revealItems=qsa('.rh-hero-copy > *, .calendar-filters, .calendar-toolbar, .calendar-row, .load-more-sessions, .below-three > *, .docs-box, .question-box');
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
    revealItems.forEach((item,index)=>{item.classList.add('formation-reveal');item.style.setProperty('--reveal-delay',`${Math.min(index%6,5)*70}ms`);});
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -40px'});
    revealItems.forEach(item=>revealObserver.observe(item));
  }

  const partnerCarousel=qs('.partner-ecosystem-carousel');
  const partnerTrack=qs('.partner-ecosystem-grid',partnerCarousel);
  if(partnerTrack){
    Array.from(partnerTrack.children).forEach(card=>{
      const clone=card.cloneNode(true);
      clone.setAttribute('aria-hidden','true');
      clone.querySelectorAll('a,button').forEach(control=>{control.tabIndex=-1;});
      partnerTrack.appendChild(clone);
    });
  }

  const catalogueCarousel=qs('.catalogue-carousel');
  const catalogueTrack=qs('.cat-grid',catalogueCarousel);
  if(catalogueTrack){
    const catalogueCards=Array.from(catalogueTrack.children);
    catalogueCards.forEach(card=>{
      const clone=card.cloneNode(true);
      clone.classList.add('catalogue-carousel-clone');
      clone.setAttribute('aria-hidden','true');
      clone.querySelectorAll('a,button').forEach(control=>{control.tabIndex=-1;});
      catalogueTrack.appendChild(clone);
    });
    const mobileCatalogue=window.matchMedia('(max-width: 600px)');
    let catalogueIndex=0;
    let catalogueTimer;
    const catalogueDots=document.createElement('div');
    catalogueDots.className='catalogue-dots';
    catalogueDots.setAttribute('aria-label','Navigation des catalogues');
    catalogueCards.forEach((card,index)=>{
      const dot=document.createElement('button');
      dot.type='button';
      dot.className='catalogue-dot';
      dot.setAttribute('aria-label',`Afficher le catalogue ${index+1}`);
      dot.addEventListener('click',()=>{catalogueIndex=index;showMobileCatalogue();startMobileCatalogue();});
      catalogueDots.appendChild(dot);
    });
    catalogueCarousel.appendChild(catalogueDots);
    const catalogueToggle=document.createElement('button');
    catalogueToggle.type='button';
    catalogueToggle.className='catalogue-toggle';
    catalogueToggle.setAttribute('aria-label','Mettre en pause le défilement');
    catalogueToggle.textContent='||';
    catalogueCarousel.appendChild(catalogueToggle);
    let cataloguePaused=false;
    const showMobileCatalogue=()=>{
      if(!mobileCatalogue.matches)return;
      catalogueCards.forEach((card,index)=>card.classList.toggle('is-mobile-active',index===catalogueIndex));
      catalogueDots.querySelectorAll('.catalogue-dot').forEach((dot,index)=>{
        dot.classList.toggle('is-active',index===catalogueIndex);
        dot.setAttribute('aria-current',index===catalogueIndex?'true':'false');
      });
    };
    const startMobileCatalogue=()=>{
      clearInterval(catalogueTimer);
      showMobileCatalogue();
      if(cataloguePaused||!mobileCatalogue.matches||catalogueCards.length<2)return;
      catalogueTimer=setInterval(()=>{catalogueIndex=(catalogueIndex+1)%catalogueCards.length;showMobileCatalogue();},3000);
    };
    catalogueToggle.addEventListener('click',()=>{
      cataloguePaused=!cataloguePaused;
      catalogueToggle.textContent=cataloguePaused?'>':'||';
      catalogueToggle.setAttribute('aria-label',cataloguePaused?'Relancer le défilement':'Mettre en pause le défilement');
      startMobileCatalogue();
    });
    let catalogueTouchStartX=0;
    catalogueCarousel.addEventListener('touchstart',event=>{
      catalogueTouchStartX=event.changedTouches[0].clientX;
    },{passive:true});
    catalogueCarousel.addEventListener('touchend',event=>{
      const touchDelta=event.changedTouches[0].clientX-catalogueTouchStartX;
      if(Math.abs(touchDelta)<40)return;
      catalogueIndex=(catalogueIndex+(touchDelta<0?1:-1)+catalogueCards.length)%catalogueCards.length;
      showMobileCatalogue();
      startMobileCatalogue();
    },{passive:true});
    mobileCatalogue.addEventListener('change',startMobileCatalogue);
    startMobileCatalogue();
  }
  const filterGroup=qs('.calendar-filters'), searchInput=qs('#filter-search');
  const filterLabels={
    'filter-theme':'Thématique',
    'filter-public':'Public',
    'filter-mode':'Présentiel ou distanciel',
    'filter-location':'Lieu',
    'filter-month':'Mois',
    'filter-funding':'Financement ou dispositif'
  };
  qsa('.calendar-filters select').forEach(select=>{
    if(filterLabels[select.id])select.setAttribute('aria-label',filterLabels[select.id]);
  });
  qsa('a[href*="%3F"]').forEach(link=>{
    let href=link.getAttribute('href');
    try{href=decodeURIComponent(href);}catch(_){return;}
    href=href.replace(/^contact\?/,'contact.html?').replace(/\.html(?=([&#]|$))/g,'');
    link.setAttribute('href',href);
  });
  if(filterGroup&&searchInput&&!qs('.search-toolbar')){
    filterGroup.id='formation-filters';
    const toolbar=document.createElement('div'); toolbar.className='search-toolbar';
    const label=document.createElement('label'); label.className='search-field'; label.htmlFor='filter-search';
    const icon=document.createElement('span'); icon.className='search-icon'; icon.setAttribute('aria-hidden','true');
    const toggle=document.createElement('button'); toggle.className='filters-toggle'; toggle.type='button'; toggle.textContent='Afficher les filtres'; toggle.setAttribute('aria-expanded','true'); toggle.setAttribute('aria-controls','formation-filters');
    label.append(icon,searchInput); toolbar.append(label,toggle); filterGroup.parentNode.insertBefore(toolbar,filterGroup);
  }
  const filterToggle=qs('.filters-toggle'), filters=qs('#formation-filters');
  if(filterToggle&&filters){
    filterToggle.addEventListener('click',()=>{
      const collapsed=filters.classList.toggle('is-collapsed');
      filterToggle.setAttribute('aria-expanded',String(!collapsed));
      filterToggle.textContent=collapsed?'Afficher les filtres':'Masquer les filtres';
    });
  }
})();
