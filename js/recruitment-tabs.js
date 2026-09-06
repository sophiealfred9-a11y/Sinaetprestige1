(function(){
  const tabs=Array.from(document.querySelectorAll('.role-tab'));
  const panels={
    company:document.querySelector('#company-panel'),
    candidate:document.querySelector('#candidate-panel')
  };
  if(!tabs.length||!panels.company||!panels.candidate)return;
  const activate=(role,moveFocus=false)=>{
    tabs.forEach(tab=>{
      const active=tab.dataset.role===role;
      tab.classList.toggle('is-active',active);
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    });
    Object.entries(panels).forEach(([key,panel])=>{
      const active=key===role;
      panel.hidden=!active;
      panel.classList.toggle('is-active',active);
    });
    if(moveFocus)tabs.find(tab=>tab.dataset.role===role)?.focus();
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(tab.dataset.role));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:(index-1+tabs.length)%tabs.length;
      activate(tabs[next].dataset.role,true);
    });
  });
})();
