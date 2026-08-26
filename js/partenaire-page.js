(function(){
  'use strict';
  const modal=document.getElementById('newsletter');
  if(!modal) return;
  const open=()=>{modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');const input=modal.querySelector('input[type=email]');setTimeout(()=>input&&input.focus(),50)};
  const close=()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')};
  document.querySelectorAll('[data-open-newsletter],a[href="#newsletter"]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();open()}));
  modal.querySelectorAll('[data-close-newsletter]').forEach(el=>el.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))close()});
})();
