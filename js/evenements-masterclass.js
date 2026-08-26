(function(){
  'use strict';
  function init(){
    var modal=document.getElementById('newsletter-modal');
    if(!modal)return;
    var openers=document.querySelectorAll('[data-open-newsletter]');
    var closers=modal.querySelectorAll('[data-close-newsletter]');
    function open(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('mc-modal-open');var first=modal.querySelector('input:not([type="hidden"])');if(first)first.focus();}
    function close(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('mc-modal-open');}
    openers.forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();open();});});
    closers.forEach(function(el){el.addEventListener('click',close);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('is-open'))close();});
    var form=modal.querySelector('form');
    if(form){form.addEventListener('submit',function(){setTimeout(function(){if(!form.querySelector('[data-form-message]')||!form.querySelector('[data-form-message]').hidden){return;}},0);});}
  }
  document.addEventListener('DOMContentLoaded',init);
})();
