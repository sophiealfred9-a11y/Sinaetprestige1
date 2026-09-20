(function(){
  const qs=(s,c=document)=>c && c.querySelector ? c.querySelector(s) : null, qsa=(s,c=document)=>c && c.querySelectorAll ? Array.from(c.querySelectorAll(s)) : [];
  const data=window.SINA_DATA||{};
  const forms=data.formations||[];
  const sessions=data.sessions||{};
  const pdfMap={};
  forms.forEach(f=>pdfMap[f.code]=`pdfs/${f.code.toLowerCase()}.pdf`);

  const imageForFamily=(family, title='')=>{
    const combined = `${family} ${title}`.toLowerCase();
    if(/data|analyses/i.test(combined)) return 'images/formation-data.webp';
    if(/développement|codage|génie logiciel|assistant de code/i.test(combined)) return 'images/formation-it.png';
    if(/bureautique|productivité|collaboratif/i.test(combined)) return 'images/formation-gestion.webp';
    if(/emploi|employabil|insertion|cadre|cv|ats|linkedin/i.test(combined)) return 'images/formation-career.webp';
    if(/commerce|vente|prospection/i.test(combined)) return 'images/formation-vente.webp';
    if(/recrut|rh|harcèlement|cse|qvct|prévention|égalité/i.test(combined)) return 'images/formation-rh.webp';
    if(/projet|management|leadership|agile|transition/i.test(combined)) return 'images/formation-gestiondeprojet.webp';
    if(/ia/i.test(combined)) return 'images/formation-Ia.digi.webp';
    return 'images/formation-gestiondeprojet.webp';
  };

  const publicFor=(f)=>{
    if(/management|manager/i.test(f.family)) return 'Managers';
    if(/commerce|vente|prospection/i.test(f.family)) return 'Commerciaux';
    if(/rh|recrut|cse|qvct|prévention/i.test(f.family)) return 'Professionnels RH';
    return 'Tout public';
  };

  const months=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const mIndex={'janvier':0,'février':1,'mars':2,'avril':3,'mai':4,'juin':5,'juillet':6,'août':7,'septembre':8,'octobre':9,'novembre':10,'décembre':11};
  const shortMonths=['JAN','FÉV','MAR','AVR','MAI','JUIN','JUIL','AOÛT','SEP','OCT','NOV','DÉC'];

  const parseDateInfo=(str)=>{
    if(!str) return null;
    const clean = str.trim();
    const mRange = clean.match(/(?:du\s+)?(\d+)\s+au\s+(\d+)\s+([^\s]+)\s+(20\d{2})/i);
    if(mRange){
      const sDay = Number(mRange[1]), eDay = Number(mRange[2]);
      const mStr = mRange[3].toLowerCase();
      const yr = Number(mRange[4]);
      const mi = mIndex[mStr] ?? -1;
      return {
        startDay: sDay,
        endDay: eDay,
        displayDay: `${sDay}–${eDay}`,
        shortMonth: mi >= 0 ? shortMonths[mi] : '',
        monthName: mi >= 0 ? `${months[mi]} ${yr}` : '',
        monthNum: mi,
        year: yr,
        dateObj: mi >= 0 ? new Date(yr, mi, sDay) : null
      };
    }
    const mSingle = clean.match(/(\d+)\s+([^\s]+)\s+(20\d{2})/i);
    if(mSingle){
      const sDay = Number(mSingle[1]);
      const mStr = mSingle[2].toLowerCase();
      const yr = Number(mSingle[3]);
      const mi = mIndex[mStr] ?? -1;
      return {
        startDay: sDay,
        endDay: null,
        displayDay: String(sDay).padStart(2, '0'),
        shortMonth: mi >= 0 ? shortMonths[mi] : '',
        monthName: mi >= 0 ? `${months[mi]} ${yr}` : '',
        monthNum: mi,
        year: yr,
        dateObj: mi >= 0 ? new Date(yr, mi, sDay) : null
      };
    }
    return null;
  };

  const monthNumber=(date)=>{
    const info = parseDateInfo(date);
    return info ? info.monthNum : -1;
  };
  const monthName=(date)=>{
    const info = parseDateInfo(date);
    return info ? info.monthName : '';
  };
  const parseDate=(date)=>{
    const info = parseDateInfo(date);
    return info ? info.dateObj : null;
  };

  const events=[];
  forms.forEach(f => (sessions[f.code] || []).forEach(pair => {
    const dInfo = parseDateInfo(pair[0]);
    events.push({
      code: f.code,
      title: f.title,
      family: f.family,
      duration: f.duration || '35 h - 5 jours',
      price: f.price || '700 € HT / participant',
      conventionne: !!f.conventionne,
      date: pair[0],
      displayDay: dInfo ? dInfo.displayDay : '',
      startDay: dInfo ? dInfo.startDay : 1,
      endDay: dInfo ? dInfo.endDay : null,
      shortMonth: dInfo ? dInfo.shortMonth : '',
      year: dInfo ? dInfo.year : 2026,
      dateObj: dInfo ? dInfo.dateObj : null,
      mode: pair[1],
      public: publicFor(f),
      location: pair[1].includes('Distanciel') ? 'France entière' : 'Normandie',
      month: dInfo ? dInfo.monthName : monthName(pair[0]),
      monthNum: dInfo ? dInfo.monthNum : monthNumber(pair[0])
    });
  }));

  // Tri chronologique strict de toutes les sessions
  events.sort((a, b) => {
    const tA = a.dateObj ? a.dateObj.getTime() : 0;
    const tB = b.dateObj ? b.dateObj.getTime() : 0;
    return tA - tB;
  });

  const list=qs('#session-list');
  let visibleLimit=15;
  let loadMoreContainer=null, loadMoreButton=null;
  let loaderEl=null, endMsgEl=null, isLoadingMore=false;
  const BATCH_SIZE=15;
  const makeRow=(x)=>{
    const dInfo = parseDateInfo(x.date);
    const day = dInfo ? dInfo.displayDay : (x.displayDay || '');
    const mon = dInfo ? dInfo.shortMonth : (x.shortMonth || '');
    const yr = dInfo ? dInfo.year : '';
    const row = document.createElement('article');
    row.className = 'calendar-row';
    row.dataset.category = x.family;
    row.dataset.public = x.public;
    row.dataset.mode = x.mode.includes('Distanciel') ? 'Distanciel' : 'Présentiel';
    row.dataset.location = x.location;
    row.dataset.month = x.month;
    row.dataset.funding = x.conventionne ? 'Conventionné' : 'À préciser';
    row.dataset.code = x.code;

    const isLong = /35\s*h|5\s*jours/i.test(x.duration);
    const timeMeta = isLong ? '5 jours (35 h) · 09h00 – 17h00' : '1 jour (7 h) · 09h00 – 17h30';
    const convBadge = x.conventionne ? '<span class="badge-dokelio-row" style="background:#071b46;color:#ffffff;font-size:9px;font-weight:800;padding:3px 4px;border-radius:4px;margin-top:4px;display:block;text-align:center;line-height:1.2;"></span>' : '';
    const placesMeta = x.conventionne 
      ? '<strong style="color:#0a45a2;font-size:8px">Conventionné Dokelio IDF</strong>' 
      : 'Places disponibles';

    row.innerHTML = `<div class="datebox"><strong>${day}</strong><span>${mon}</span><small>${yr}</small><span class="status gold-status">INSCRIPTIONS<br>OUVERTES</span>${convBadge}</div><img class="cal-thumb" src="${imageForFamily(x.family, x.title)}" alt="" aria-hidden="true"><div class="cal-info"><h3>${x.title}</h3><div class="family">${x.family}</div><p>Session officielle Sina &amp; Prestige · ${x.price}.</p><div class="meta"><span>Durée : ${x.duration}</span><span>${x.mode.includes('Distanciel') ? 'Distanciel' : 'Présentiel'}</span><span>Public : ${x.public}</span>${x.conventionne ? '<span style="color:#0a45a2;font-weight:700">Dokelio IDF</span>' : ''}</div></div><div class="cal-meta">Lieu : ${x.mode}<br>Horaires : ${timeMeta}<br>${placesMeta}</div><div class="cal-actions"><a class="m-btn light small" href="${pdfMap[x.code]}" target="_blank" rel="noopener">Programme (PDF)</a><a class="m-btn gold small cal-signup" href="#inscription" data-code="${x.code}" data-date="${x.date}" data-mode="${x.mode}">S’inscrire</a></div>`;
    return row;
  };
  if(list){
    list.innerHTML='';
    events.forEach(e=>list.appendChild(makeRow(e)));

    // ── Load-more container under list ──
    loadMoreContainer=document.createElement('div');
    loadMoreContainer.className='load-more-container';

    // ── Loader / Spinner during load ──
    loaderEl=document.createElement('div');
    loaderEl.className='formations-loader';
    loaderEl.setAttribute('aria-live','polite');
    loaderEl.hidden=true;
    loaderEl.innerHTML='<div class="formations-spinner" aria-hidden="true"></div><span class="formations-loader-text">Chargement des sessions…</span>';
    loadMoreContainer.appendChild(loaderEl);

    // ── Action Button ──
    loadMoreButton=document.createElement('button');
    loadMoreButton.type='button';
    loadMoreButton.className='load-more-sessions';
    loadMoreButton.innerHTML='<span>Afficher 15 sessions supplémentaires</span>';
    loadMoreContainer.appendChild(loadMoreButton);

    // ── End-of-list message ──
    endMsgEl=document.createElement('div');
    endMsgEl.className='formations-end-msg';
    endMsgEl.hidden=true;
    endMsgEl.innerHTML='<span class="end-check" aria-hidden="true">✓</span> Toutes les sessions sont affichées';
    loadMoreContainer.appendChild(endMsgEl);

    list.insertAdjacentElement('afterend',loadMoreContainer);

    // Click handler with feedback
    loadMoreButton.addEventListener('click',()=>{
      if(isLoadingMore) return;
      isLoadingMore=true;
      loadMoreButton.classList.add('is-loading');
      loaderEl.hidden=false;
      setTimeout(()=>{
        visibleLimit+=BATCH_SIZE;
        applyFilters();
        loaderEl.hidden=true;
        loadMoreButton.classList.remove('is-loading');
        isLoadingMore=false;
      },300);
    });
  }

  const selectOptions={
    '#filter-theme':['',...Array.from(new Set(forms.map(f=>f.family)))],
    '#filter-public':['',...Array.from(new Set(events.map(e=>e.public)))],
    '#filter-mode':['','Présentiel','Distanciel'],
    '#filter-location':['','France entière','Normandie'],
    '#filter-month':['',...Array.from(new Set(events.map(e=>e.month)))],
    '#filter-funding':['','À préciser','Conventionné','OPCO','France Travail','Entreprise','Financement personnel']
  };
  Object.entries(selectOptions).forEach(([sel,opts])=>{const el=qs(sel);if(!el)return; const first=el.options[0]; el.innerHTML=''; const ph=first?.textContent||'Filtrer'; const o0=document.createElement('option');o0.value='';o0.textContent=ph;el.appendChild(o0); opts.slice(1).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});});

  const domainGroups={
    ia:[
      'IA, emploi & insertion',
      'Entrepreneuriat, IA & commercial',
      'IA, développement & codage',
      'Data, IA & analyses métiers',
      'IA, productivité & bureautique',
      'Commerce, prospection & IA',
      'Ressources humaines & IA',
      'Recrutement & IA'
    ],
    rh:[
      'Ressources humaines & IA',
      'Recrutement & IA',
      'Recrutement & onboarding',
      'RH, conformité & égalité',
      'QVCT, santé & prévention',
      'QVCT & transformation du travail',
      'CSE, prévention & conformité',
      'Prévention, harcèlement & conformité',
      'CSE, santé & prévention',
      'Prévention des risques professionnels'
    ],
    management:[
      'Management & leadership',
      'Management & coopération',
      'Transition numérique, méthodes Agiles et pilotage de projet'
    ],
    commerce:[
      'Commerce, prospection & IA',
      'Commerce, vente & négociation',
      'Entrepreneuriat, IA & commercial'
    ],
    projet:[
      'Gestion de projet & changement',
      'Management & leadership',
      'Transition numérique, méthodes Agiles et pilotage de projet'
    ],
    emploi:[
      'Employabilité & insertion',
      'IA, emploi & insertion',
      'Employabilité & cadres',
      'Compétences & employabilité'
    ],
    entrepreneuriat:[
      'Entrepreneuriat, IA & commercial'
    ],
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
    qsa('.calendar-row').forEach(r=>{
      const idx=matchingRows.indexOf(r);
      const wasHidden=r.hidden;
      r.hidden=r.dataset.filterMatch!=='true'||idx>=visibleLimit;
      // Fade-in animation for newly revealed cards
      if(wasHidden && !r.hidden && idx>=BATCH_SIZE){
        r.classList.remove('fade-in-up');
        void r.offsetWidth; // force reflow
        r.classList.add('fade-in-up');
      }
    });
    const remaining = matchingRows.length - visibleLimit;
    const allShown = remaining <= 0;
    const isCalMode = calView && !calView.hidden;

    // ── Button & Feedback management ──
    if(loadMoreContainer){
      loadMoreContainer.hidden = isCalMode || matchingRows.length === 0;
    }
    if(loadMoreButton){
      loadMoreButton.hidden = allShown || isCalMode;
      const nextBatch = Math.min(BATCH_SIZE, remaining);
      loadMoreButton.innerHTML = `<span>Afficher les ${nextBatch} sessions suivantes</span> <small style="opacity:0.8;font-size:11px;">(${remaining} restante${remaining>1?'s':''})</small>`;
    }
    if(endMsgEl){
      endMsgEl.hidden = !allShown || isCalMode || matchingRows.length === 0;
      endMsgEl.innerHTML = `<span class="end-check" aria-hidden="true">✓</span> Toutes les sessions sont affichées (${matchingRows.length} au planning)`;
    }
    const label=qs('#active-domain-label');
    if(label){
      label.hidden=!activeDomain||!domainLabels[activeDomain];
      if(domainLabels[activeDomain]) label.textContent='Domaine actif : '+domainLabels[activeDomain];
    }
    if(isCalMode){ renderRealCalendar(); }
  };
  ['#filter-search','#filter-theme','#filter-public','#filter-mode','#filter-location','#filter-month','#filter-funding'].forEach(s=>qs(s)?.addEventListener('input',()=>{visibleLimit=BATCH_SIZE;applyFilters();}));
  qs('#reset-filters')?.addEventListener('click',()=>{['#filter-search','#filter-theme','#filter-public','#filter-mode','#filter-location','#filter-month','#filter-funding'].forEach(s=>{const e=qs(s);if(e)e.value='';});activeDomain='';visibleLimit=BATCH_SIZE; const u=new URL(location.href); u.search=''; history.replaceState({},'',u); applyFilters();});

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
    selectedSession={code,date,mode,title:formation?.title||code,price:formation?.price||'',duration:formation?.duration||''};
    const sel=qs('#quick-formation',quick);
    if(sel){
      if(!sel.options.length){
        forms.forEach(f=>{
          const o=document.createElement('option');
          o.value=f.code;
          o.textContent=`${f.code} · ${f.title}`;
          sel.appendChild(o);
        });
      }
      sel.value=code;
    }
    const dateInput=qs('input[name="session_date"]',quick), modeInput=qs('input[name="modalite"]',quick);
    if(dateInput)dateInput.value=date||'';
    if(modeInput)modeInput.value=mode||'';
    const summary=qs('.formation-selected-session',signupModal);
    if(summary){
      summary.innerHTML=`<strong>${selectedSession.title}</strong><span>Date : ${date||'À confirmer'}</span><span>Format : ${mode||'À confirmer'}</span>`;
    }
    openSignup();
  }
  qsa('.cal-signup').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();fillQuick(a.dataset.code,a.dataset.date,a.dataset.mode);}));
  if(quick){
    const sel=qs('#quick-formation',quick);
    if(sel&&!sel.options.length){
      forms.forEach(f=>{
        const o=document.createElement('option');
        o.value=f.code;
        o.textContent=`${f.code} · ${f.title}`;
        sel.appendChild(o);
      });
    }
  }
  const params=new URLSearchParams(location.search); if(params.get('formation')&&quick)setTimeout(()=>fillQuick(params.get('formation').toUpperCase(),params.get('date')||'',params.get('modalite')||''),30);
  setTimeout(()=>applyFilters(),40);

    // =========================================================
  // VRAI CALENDRIER MENSUEL INTERACTIF & STYLISÉ
  // =========================================================
  const listView = qs('#session-list'), calView = qs('#calendar-view');

  const CAL_MONTHS = [
    { year: 2026, monthIdx: 8, label: 'Septembre 2026' },
    { year: 2026, monthIdx: 9, label: 'Octobre 2026' },
    { year: 2026, monthIdx: 10, label: 'Novembre 2026' },
    { year: 2026, monthIdx: 11, label: 'Décembre 2026' },
    { year: 2027, monthIdx: 0, label: 'Janvier 2027' }
  ];

  let currentCalMonthIndex = 1; // Octobre 2026 par défaut
  let selectedCalDay = null; // Aucun jour filtré par défaut (vue mensuelle)

  const getPillClass = (family) => {
    if(/ia|data|codage|bureautique/i.test(family)) return 'cal-pill-ia';
    if(/commerce|vente|prospection/i.test(family)) return 'cal-pill-commerce';
    if(/rh|recrut|harcèlement|cse|qvct|égalité/i.test(family)) return 'cal-pill-rh';
    if(/projet|management|leadership|agile/i.test(family)) return 'cal-pill-management';
    if(/emploi|insertion|cadre/i.test(family)) return 'cal-pill-emploi';
    return '';
  };

  const getMonthMatrix = (year, monthIdx) => {
    const firstDate = new Date(year, monthIdx, 1);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const startDayOfWeek = (firstDate.getDay() + 6) % 7; // 0=Lun, 6=Dim
    const prevMonthDays = new Date(year, monthIdx, 0).getDate();
    const cells = [];

    // Jours du mois précédent
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isWeekend: false
      });
    }

    // Jours du mois courant
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = (startDayOfWeek + d - 1) % 7;
      cells.push({
        day: d,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6
      });
    }

    // Jours du mois suivant pour compléter la grille (35 ou 42 cellules)
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        isWeekend: false
      });
    }

    return cells;
  };

  function renderRealCalendar() {
    if(!calView) return;

    // Synchroniser avec le filtre mois si l'utilisateur l'a sélectionné dans la barre d'outils
    const filterMonthVal = qs('#filter-month')?.value || '';
    if (filterMonthVal) {
      const foundIdx = CAL_MONTHS.findIndex(m => m.label.toLowerCase() === filterMonthVal.toLowerCase());
      if (foundIdx >= 0 && foundIdx !== currentCalMonthIndex) {
        currentCalMonthIndex = foundIdx;
        selectedCalDay = null;
      }
    }

    const curMonth = CAL_MONTHS[currentCalMonthIndex];

    // Sessions correspondant aux filtres actifs
    const activeSessions = events.filter(x => {
      const row = qsa('.calendar-row').find(r => r.dataset.code === x.code && r.querySelector('.cal-signup')?.dataset.date === x.date);
      return !row || row.dataset.filterMatch !== 'false';
    });

    // Sessions du mois en cours d'affichage
    const monthSessions = activeSessions.filter(x => x.year === curMonth.year && x.monthNum === curMonth.monthIdx);

    // Déterminer les sessions à afficher dans la barre latérale
    let displayedSessions = monthSessions;
    if (selectedCalDay !== null) {
      displayedSessions = monthSessions.filter(x => {
        const end = x.endDay ? Number(x.endDay) : Number(x.startDay);
        const start = Number(x.startDay);
        return selectedCalDay >= start && selectedCalDay <= end;
      });
    }

    // Construire le HTML complet du vrai calendrier
    const cells = getMonthMatrix(curMonth.year, curMonth.monthIdx);

    let html = `
      <div class="cal-nav-bar">
        <div class="cal-nav-controls">
          <button type="button" class="cal-nav-btn" id="cal-prev-btn" aria-label="Mois précédent" ${currentCalMonthIndex === 0 ? 'disabled' : ''}>&lsaquo;</button>
          <div class="cal-month-title-wrap">
            <select class="cal-month-select" id="cal-month-picker" aria-label="Sélectionner le mois">
              ${CAL_MONTHS.map((m, idx) => `<option value="${idx}" ${idx === currentCalMonthIndex ? 'selected' : ''}>${m.label}</option>`).join('')}
            </select>
          </div>
          <button type="button" class="cal-nav-btn" id="cal-next-btn" aria-label="Mois suivant" ${currentCalMonthIndex === CAL_MONTHS.length - 1 ? 'disabled' : ''}>&rsaquo;</button>
        </div>
        <div class="cal-nav-badge">
          <span class="cal-nav-badge-dot"></span>
          <span>${monthSessions.length} session${monthSessions.length > 1 ? 's' : ''} au planning</span>
        </div>
      </div>

      <div class="cal-layout">
        <!-- Grille calendaire 7 jours -->
        <div class="cal-grid-wrapper">
          <div class="cal-weekdays">
            <div class="cal-weekday">Lun</div>
            <div class="cal-weekday">Mar</div>
            <div class="cal-weekday">Mer</div>
            <div class="cal-weekday">Jeu</div>
            <div class="cal-weekday">Ven</div>
            <div class="cal-weekday is-weekend">Sam</div>
            <div class="cal-weekday is-weekend">Dim</div>
          </div>
          <div class="cal-days-matrix">
    `;

    cells.forEach(cell => {
      if (!cell.isCurrentMonth) {
        html += `
          <div class="cal-cell is-other-month">
            <div class="cal-cell-header"><span class="cal-cell-num">${cell.day}</span></div>
          </div>
        `;
        return;
      }

      // Sessions couvrant ce jour
      const daySessions = monthSessions.filter(x => {
        const start = Number(x.startDay);
        const end = x.endDay ? Number(x.endDay) : start;
        return cell.day >= start && cell.day <= end;
      });

      const hasSess = daySessions.length > 0;
      const isSel = selectedCalDay === cell.day;
      const cellClasses = [
        'cal-cell',
        cell.isWeekend ? 'is-weekend' : '',
        hasSess ? 'has-session' : '',
        isSel ? 'is-selected' : ''
      ].filter(Boolean).join(' ');

      html += `
        <div class="${cellClasses}" data-day="${cell.day}" role="${hasSess ? 'button' : 'gridcell'}" tabindex="${hasSess ? '0' : '-1'}" title="${hasSess ? daySessions.map(s => s.title).join(' | ') : ''}">
          <div class="cal-cell-header">
            <span class="cal-cell-num">${cell.day}</span>
            ${daySessions.length > 1 ? `<span class="cal-session-dot-count">${daySessions.length}</span>` : ''}
          </div>
          <div class="cal-cell-events">
            ${daySessions.slice(0, 3).map(s => `
              <div class="cal-pill ${getPillClass(s.family)}" data-code="${s.code}" data-date="${s.date}" data-mode="${s.mode}" title="${s.code} · ${s.title} (${s.date})">
                <span style="font-weight:900;flex-shrink:0;">${s.code}</span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.title}</span>
              </div>
            `).join('')}
            ${daySessions.length > 3 ? `<div class="cal-pill-more">+${daySessions.length - 3} autre${daySessions.length - 3 > 1 ? 's' : ''}</div>` : ''}
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <!-- Panneau latéral : Détails et inscription -->
        <aside class="cal-sidebar" aria-label="Sessions disponibles">
          <div class="cal-sidebar-head">
            <h4 class="cal-sidebar-title">
              ${selectedCalDay !== null 
                ? `Sessions du ${selectedCalDay} ${curMonth.label}` 
                : `Sessions de ${curMonth.label} (${monthSessions.length})`}
            </h4>
            ${selectedCalDay !== null ? `<button type="button" class="cal-reset-day-btn" id="cal-view-all-month">Voir tout le mois</button>` : ''}
          </div>

          <div class="cal-sidebar-cards">
            ${displayedSessions.length === 0 ? `
              <div class="cal-empty-state">
                <p><strong>Aucune session programmée à cette date</strong></p>
                <p style="margin-top: 6px; color: #64748b;">Sélectionnez une date numérotée dans le calendrier ou cliquez sur « Voir tout le mois » pour consulter les sessions disponibles.</p>
              </div>
            ` : displayedSessions.map(s => {
              const isLong = /35\s*h|5\s*jours/i.test(s.duration);
              const durText = isLong ? '5 jours (35 h)' : '1 jour (7 h)';
              const convBadge = s.conventionne ? '<span class="cal-detail-badge-conv">Conventionné Dokelio IDF</span>' : '';
              return `
                <article class="cal-detail-card">
                  <div class="cal-detail-date-badge">
                    ${s.date}
                  </div>
                  <h5 class="cal-detail-title">${s.title}</h5>
                  <div class="cal-detail-family">${s.code} · ${s.family}</div>
                  <div class="cal-detail-meta">
                    <span>Durée : ${durText}</span>
                    <span>·</span>
                    <span>Format : ${s.mode.includes('Distanciel') ? 'Distanciel' : 'Présentiel'}</span>
                    ${convBadge}
                  </div>
                  <div class="cal-detail-price">
                    ${s.price}
                  </div>
                  <div class="cal-detail-actions">
                    <a class="m-btn gold small cal-signup" href="#inscription" data-code="${s.code}" data-date="${s.date}" data-mode="${s.mode}">S’inscrire</a>
                    <a class="m-btn light small" href="${pdfMap[s.code]}" target="_blank" rel="noopener">PDF</a>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </aside>
      </div>
    `;

    calView.innerHTML = html;

    // Attacher les événements du calendrier
    qs('#cal-prev-btn', calView)?.addEventListener('click', () => {
      if (currentCalMonthIndex > 0) {
        currentCalMonthIndex--;
        selectedCalDay = null;
        renderRealCalendar();
      }
    });

    qs('#cal-next-btn', calView)?.addEventListener('click', () => {
      if (currentCalMonthIndex < CAL_MONTHS.length - 1) {
        currentCalMonthIndex++;
        selectedCalDay = null;
        renderRealCalendar();
      }
    });

    qs('#cal-month-picker', calView)?.addEventListener('change', (e) => {
      currentCalMonthIndex = Number(e.target.value);
      selectedCalDay = null;
      renderRealCalendar();
    });

    qs('#cal-view-all-month', calView)?.addEventListener('click', () => {
      selectedCalDay = null;
      renderRealCalendar();
    });

    // Clic sur les jours ayant des sessions
    qsa('.cal-cell.has-session', calView).forEach(cell => {
      cell.addEventListener('click', () => {
        const day = Number(cell.dataset.day);
        selectedCalDay = (selectedCalDay === day) ? null : day;
        renderRealCalendar();
      });
    });

    // Clic direct sur une pastille de session
    qsa('.cal-pill[data-code]', calView).forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        fillQuick(pill.dataset.code, pill.dataset.date, pill.dataset.mode);
      });
    });

    // Clic sur les boutons S'inscrire du calendrier
    qsa('.cal-signup', calView).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        fillQuick(btn.dataset.code, btn.dataset.date, btn.dataset.mode);
      });
    });
  }

  // Bascule garantie entre Vue Liste et Vrai Calendrier
  const showView = (which) => {
    const listBtn = qs('#view-list'), calBtn = qs('#view-calendar');
    const isCal = which === 'calendar';

    if (listView) {
      listView.hidden = isCal;
      listView.style.display = isCal ? 'none' : 'flex';
    }
    if (calView) {
      calView.hidden = !isCal;
      calView.style.display = isCal ? 'block' : 'none';
    }
    if (loadMoreContainer) {
      loadMoreContainer.hidden = isCal || (qsa('.calendar-row[data-filter-match="true"]').length === 0);
      loadMoreContainer.style.display = isCal ? 'none' : '';
    }

    listBtn?.classList.toggle('active', !isCal);
    calBtn?.classList.toggle('active', isCal);

    if (isCal) {
      renderRealCalendar();
    } else {
      // Re-apply filters to update loader/end-msg state when switching back to list
      applyFilters();
    }
  };

  qs('#view-list')?.addEventListener('click', () => showView('list'));
  qs('#view-calendar')?.addEventListener('click', () => showView('calendar'));


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
