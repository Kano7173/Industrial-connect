(() => {
  const root=document.getElementById('app'); if(!root)return;
  function cleanNav(){
    const nav=root.querySelector('.v7-nav'); if(!nav)return;
    const menu=nav.querySelector('.v7-menu');
    if(menu){menu.innerHTML=`<a href="#why">For buyers</a><a href="#capabilities">For manufacturers</a><a href="#workflow">How it works</a>`;}
    const actions=nav.querySelector('.v7-nav-actions');
    if(actions){actions.innerHTML=`<button class="v7-navbtn ghost" onclick="openAuth('signin')">Sign in</button><button class="v7-navbtn dark" onclick="openRFQ()">Post requirement →</button>`;}
    const brand=nav.querySelector('.v7-logo');
    if(brand){brand.setAttribute('aria-label','IndustrialConnect home');}
  }
  const mo=new MutationObserver(()=>requestAnimationFrame(cleanNav)); mo.observe(root,{childList:true,subtree:true}); requestAnimationFrame(cleanNav);
})();
