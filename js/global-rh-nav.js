(function(){
  document.addEventListener('DOMContentLoaded',function(){
    var btn=document.querySelector('.sp-toggle-global');
    var menu=document.getElementById('globalMenu');
    if(btn&&menu){
      btn.addEventListener('click',function(){
        var open=menu.classList.toggle('is-open');
        btn.setAttribute('aria-expanded',open?'true':'false');
      });
    }

    document.querySelectorAll('.resources-menu').forEach(function(item){
      var dropdown=item.querySelector('.resources-dropdown');
      if(dropdown && !dropdown.querySelector('a[href="international.html"]')){
        var link=document.createElement('a');
        link.href='international.html';
        link.setAttribute('role','menuitem');
        link.textContent='International';
        dropdown.appendChild(link);
      }
      var trigger=item.querySelector('.resources-link');
      if(!trigger)return;
      trigger.addEventListener('click',function(e){
        /* Keep the first click as a real navigation on desktop, but allow the
           dropdown to open on touch/mobile where hover is unavailable. */
        if(window.matchMedia('(max-width: 850px)').matches){
          if(!item.classList.contains('is-open')){
            e.preventDefault();
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded','true');
          }
        }
      });
    });

    document.addEventListener('click',function(e){
      document.querySelectorAll('.resources-menu.is-open').forEach(function(item){
        if(!item.contains(e.target)){
          item.classList.remove('is-open');
          var trigger=item.querySelector('.resources-link');
          if(trigger)trigger.setAttribute('aria-expanded','false');
        }
      });
    });
  });
})();
