(() => {
  const root=document.getElementById('app'); if(!root)return;
  function enhance(){
    const v7=root.querySelector('.v7-nav');
    if(v7){
      const menu=v7.querySelector('.v7-menu');
      if(menu)menu.innerHTML=`<a href="#why">Why it works</a><a href="#capabilities">Manufacturing</a><a href="#workflow">How it works</a><a href="#order">Order Room</a>`;
      const actions=v7.querySelector('.v7-nav-actions');
      if(actions)actions.innerHTML=`<button class="v7-navbtn ghost" onclick="openAuth('signin')">Sign in</button><button class="v7-navbtn dark" onclick="openRFQ()">Post requirement →</button>`;
    }
    const nav=root.querySelector('.nav');
    if(nav){
      const links=nav.querySelector('.navlinks');
      if(links)links.innerHTML=`<a href="#how">How it works</a><a href="#capabilities">Capabilities</a><a href="#suppliers">Manufacturers</a>`;
      const actions=nav.querySelector('.actions');
      if(actions&&!actions.dataset.v8){actions.dataset.v8='1';}
    }
  }
  new MutationObserver(()=>requestAnimationFrame(enhance)).observe(root,{childList:true,subtree:true}); requestAnimationFrame(enhance);
})();
