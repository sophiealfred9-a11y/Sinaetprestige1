(function(){
  const qs=(s,c=document)=>c.querySelector(s), qsa=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const data=window.SINA_DATA||{};
  const forms=data.formations||[];
  const sessions=data.sessions||{};
  const pdfMap={};
  forms.forEach(f=>pdfMap[f.code]=`pdfs/${f.code.toLowerCase()}.pdf`);

  const imageForFamily=(family)=>{
    if(/emploi|employabil/i.test(family)) return 'images/formation-career.png';
    if(/rh|recrut/i.test(family)) return 'images/formation-rh.png';
    if(/commerce|vente|prospection/i.test(family)) return 'images/formation-vente.png';
    if(/projet|management/i.test(family)) return 'images/formation-gestion.png';
    if(/ia|data|cloud|it/i.test(family)) return 'images/formation-Ia.digi.png';
    return 'images/formation-gestiondeprojet.png';
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
    const more=document.createElement('div'); more.style.textAlign='center'; more.style.padding='6px'; more.innerHTML='<button class="m-btn light small" id="more-sessions" type="button">Voir plus de sessions &nbsp;⌄</button>'; list.appendChild(more);
    // all sessions are already present; button simply reveals a confirmation rather than duplicating rows
    qs('#more-sessions')?.addEventListener('click',()=>{more.remove();});
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
    qsa('.calendar-row').forEach(r=>{
      const txt=r.innerText.toLowerCase();
      const okDomain=!domainThemes.length || domainThemes.includes(r.dataset.category);
      const okContext=!professionalContext || r.dataset.public!=='Tout public';
      r.hidden=!(okDomain && okContext && (!search||txt.includes(search)) && (!theme||r.dataset.category===theme) && (!pub||r.dataset.public===pub) && (!mode||r.dataset.mode===mode) && (!loc||r.dataset.location===loc) && (!month||r.dataset.month===month) && (!funding||r.dataset.funding===funding));
    });
    const label=qs('#active-domain-label');
    if(label){
      label.hidden=!activeDomain||!domainLabels[activeDomain];
      if(domainLabels[activeDomain]) label.textContent='Domaine actif : '+domainLabels[activeDomain];
    }
    renderCalendar();
  };
  ['#filter-search','#filter-theme','#filter-public','#filter-mode','#filter-location','#filter-month','#filter-funding'].forEach(s=>qs(s)?.addEventListener('input',applyFilters));
  qs('#reset-filters')?.addEventListener('click',()=>{['#filter-search','#filter-theme','#filter-public','#filter-mode','#filter-location','#filter-month','#filter-funding'].forEach(s=>{const e=qs(s);if(e)e.value='';});activeDomain=''; const u=new URL(location.href); u.search=''; history.replaceState({},'',u); applyFilters();});

  const quick=qs('#inscription');
  function fillQuick(code,date,mode){
    if(!quick)return;
    const sel=qs('#quick-formation',quick); if(sel){if(!sel.options.length){forms.forEach(f=>{const o=document.createElement('option');o.value=f.code;o.textContent=f.title;sel.appendChild(o);});} sel.value=code;}
    const dateInput=qs('input[name="session_date"]',quick), modeInput=qs('input[name="modalite"]',quick); if(dateInput)dateInput.value=date||''; if(modeInput)modeInput.value=mode||'';
    quick.scrollIntoView({behavior:'smooth',block:'start'});
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
})();
