
(function(){'use strict';
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduce && 'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));}
 document.querySelectorAll('[data-session-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-session-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.sessionFilter;document.querySelectorAll('.sp-session').forEach(c=>c.hidden=!(f==='all'||c.dataset.cat===f));}));
})();
