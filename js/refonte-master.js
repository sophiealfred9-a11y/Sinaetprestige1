(function(){'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const toggle=$('.sp-toggle'),menu=$('#spMenu');
if(toggle&&menu){toggle.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));});}
const data=window.SINA_DATA||{};
const navPath=location.pathname.replace(/\.html$/,'').replace(/\/$/,'');
$$('.sp-menu a[data-nav]').forEach(a=>{const href=(a.getAttribute('href')||'').replace(/\.html$/,'');let active=false;if(a.dataset.nav==='home')active=navPath===''||navPath.endsWith('/index.html')||location.pathname.endsWith('/');if(a.dataset.nav==='formations')active=navPath.includes('formations.html')||navPath.includes('/formations/');if(a.dataset.nav==='calendrier')active=navPath.includes('calendrier-formations.html');if(a.dataset.nav==='entreprises')active=navPath.includes('entreprise.html');if(a.dataset.nav==='about')active=/p1[234]-/.test(navPath);if(a.dataset.nav==='ressources')active=/p1[56789]-/.test(navPath);if(active)a.classList.add('is-active');});
function renderHomeSessions(){const host=$('[data-home-sessions]');if(!host)return;const forms=data.formations||[], sessions=data.sessions||{};const rows=[];forms.forEach(f=>(sessions[f.code]||[]).forEach(pair=>rows.push({code:f.code,title:f.title,date:pair[0],mode:pair[1]})));rows.slice(0,6).forEach(x=>{const card=document.createElement('article');card.className='sp-session-card';const q=new URLSearchParams({formation:x.code,date:x.date,modalite:x.mode});card.innerHTML=`<span class="code">${x.code}</span><div class="date">${x.date}</div><div class="mode">${x.mode}</div><a href="calendrier-formations.html?${q.toString()}">Choisir cette session →</a>`;host.appendChild(card);});}
renderHomeSessions();
function findFormation(id){return (data.formations||[]).find(f=>f.code.toLowerCase()===String(id||'').toLowerCase()||f.title.toLowerCase()===String(id||'').toLowerCase());}
const params=new URLSearchParams(location.search), f=findFormation(params.get('formation'));
const contactForm=$('#contact-form');
if(contactForm && (params.get('type')==='preinscription' || params.get('formation'))){
  contactForm.dataset.kind='PREINSCRIPTION FORMATION';
  const kicker=$('.sp-kicker');
  const title=$('.sp-title');
  const lead=$('.sp-lead');
  if(kicker) kicker.textContent='Préinscription formation';
  if(title) title.textContent='Préinscription à une session';
  if(lead) lead.textContent='Choisissez votre session et transmettez votre demande. Une préinscription ne vaut ni confirmation définitive de session ni accord de financement.';
  const submit=$('button[type="submit"]',contactForm);
  if(submit) submit.textContent='Envoyer ma préinscription';
}
if(params.get('type')==='newsletter'){
  const section=$('#newsletter-section'); const mainForm=$('#contact-form');
  if(section) section.hidden=false;
  if(mainForm) mainForm.closest('.sp-section')?.setAttribute('hidden','hidden');
  const kicker=$('.sp-kicker'),title=$('.sp-title'),lead=$('.sp-lead');
  if(kicker) kicker.textContent='Actualités';
  if(title) title.textContent='Recevez les actualités de Sina & Prestige';
  if(lead) lead.textContent='Inscrivez-vous pour recevoir les nouvelles formations, actualités et ressources.';
}
if(f){$$('input[name="formation"]').forEach(x=>x.value=f.code+' — '+f.title);}
if(params.get('date'))$$('input[name="session_date"]').forEach(x=>x.value=params.get('date'));
if(params.get('modalite'))$$('input[name="modalite"]').forEach(x=>x.value=params.get('modalite'));
$$('[data-calendar-filter]').forEach(btn=>btn.addEventListener('click',()=>{ $$('[data-calendar-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const filter=btn.dataset.calendarFilter;$$('.sp-session').forEach(row=>row.hidden=filter!=='all'&&row.dataset.cat!==filter); }));
const endpoints={
'CONTACT':'https://formspree.io/f/xeewqerw',
'PREINSCRIPTION FORMATION':'https://formspree.io/f/xaewgogy',
'BESOIN RECRUTEMENT':'https://formspree.io/f/mljrybyg',
'PROJET ENTREPRISE':'https://formspree.io/f/myegqwqe',
'PRESCRIPTEUR':'https://formspree.io/f/mzeplrlr',
'ORIENTATION FINANCEMENT':'https://formspree.io/f/mzeplrlr',
'AIDE FINANCEMENT':'https://formspree.io/f/mzeplrlr',
'NEWSLETTER':'https://formspree.io/f/xeewqerw'
};
function subjectFor(kind,fd){const nom=fd.get('nom')||'',formation=fd.get('formation')||'',date=fd.get('session_date')||'',org=fd.get('organisation')||'',profil=fd.get('profil')||'';switch(kind){case'PREINSCRIPTION FORMATION':return `PREINSCRIPTION FORMATION | ${formation} | ${date} | ${nom}`;case'BESOIN RECRUTEMENT':return `BESOIN RECRUTEMENT | ${org} | ${nom}`;case'PROJET ENTREPRISE':return `PROJET ENTREPRISE | ${org} | ${fd.get('objectif')||''}`;case'PRESCRIPTEUR':return `PRESCRIPTEUR | ${org} | ${fd.get('situation')||''}`;case'ORIENTATION FINANCEMENT':return `ORIENTATION FINANCEMENT | ${nom} | ${profil}`;case'AIDE FINANCEMENT':return `AIDE FINANCEMENT | ${nom} | ${profil}`;case'NEWSLETTER':return `INSCRIPTION ACTUALITÉS | ${fd.get('email')||''}`;default:return `CONTACT | ${fd.get('objectif')||''} | ${nom}`;}}
$$('[data-sp-form]').forEach(form=>form.addEventListener('submit',async e=>{
 e.preventDefault();const msg=$('.sp-form-message',form),btn=$('button[type="submit"]',form),kind=form.dataset.kind||'CONTACT';msg.className='sp-form-message';msg.textContent='';
 if(!form.reportValidity())return;if($('input[name="website"]',form)?.value)return;
 const fd=new FormData(form),email=fd.get('email')||'';fd.set('_subject',subjectFor(kind,fd).slice(0,250));fd.set('_replyto',email);fd.set('form_type',kind);fd.set('submitted_from',location.href);fd.set('consentement_rgpd',fd.get('rgpd')==='on'?'oui':'non');
 btn.disabled=true;btn.textContent='Envoi…';
 try{const endpoint=endpoints[kind];if(!endpoint)throw new Error('Formulaire non configuré.');const r=await fetch(endpoint,{method:'POST',body:fd,headers:{Accept:'application/json'}});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.errors||[]).map(x=>x.message).join(' ')||j.error||'Impossible d’envoyer la demande.');msg.className='sp-form-message success';msg.textContent='Votre demande a bien été envoyée. Nous revenons vers vous après traitement. Cette confirmation ne vaut ni inscription définitive ni accord de financement.';form.reset();if(f&&$('input[name="formation"]',form))$('input[name="formation"]',form).value=f.code+' — '+f.title;if(params.get('date')&&$('input[name="session_date"]',form))$('input[name="session_date"]',form).value=params.get('date');if(params.get('modalite')&&$('input[name="modalite"]',form))$('input[name="modalite"]',form).value=params.get('modalite');}
 catch(err){msg.className='sp-form-message error';msg.textContent=err.message||'Une erreur est survenue. Veuillez réessayer.';}
 finally{btn.disabled=false;btn.textContent=(form.dataset.kind==='PREINSCRIPTION FORMATION'?'Envoyer ma préinscription':'Envoyer la demande');}
}));
})();
