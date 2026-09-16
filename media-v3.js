(function(){
  const videos={
    hero:'https://www.youtube.com/embed/ytgweXSncD0?autoplay=1&mute=1&loop=1&playlist=ytgweXSncD0&controls=0&rel=0&playsinline=1',
    cnc:'https://www.youtube.com/watch?v=pvrWhtcPdHA',
    robot:'https://www.pexels.com/video/modern-industrial-robotics-in-action-32386522/',
    laser:'https://www.pexels.com/video/cnc-28268186/'
  };
  const posters={
    cnc:'https://images.pexels.com/videos/852341/free-video-852341.jpg?auto=compress&dpr=1&h=800&w=1200',
    robot:'https://images.pexels.com/videos/32386522/industrial-robotics.jpg?auto=compress&dpr=1&h=800&w=1200',
    laser:'https://images.pexels.com/videos/28268186/laser-cutting.jpg?auto=compress&dpr=1&h=800&w=1200'
  };
  function mount(){
    const main=document.querySelector('main');
    const hero=main&&main.querySelector('.hero');
    if(!main||!hero||hero.dataset.cinematic==='1')return;
    hero.dataset.cinematic='1';
    hero.classList.add('cinematicHero');
    const bg=document.createElement('div');bg.className='heroMediaBg';hero.prepend(bg);
    const scan=document.createElement('span');scan.className='scan';hero.appendChild(scan);
    const stat=document.createElement('div');stat.className='cinematicStat';stat.innerHTML='<b>INDUSTRIALCONNECT / LIVE WORKFLOW</b><span>Requirement → matched manufacturer → production → quality → delivery</span>';hero.appendChild(stat);
    const section=document.createElement('section');section.className='cinematicSection';
    section.innerHTML=`<div class="container">
      <div class="cinematicHead"><span class="kicker">THE MANUFACTURING FLOOR</span><h2>Don't just read about manufacturing. See it.</h2><p>Real machining, automation and production footage gives buyers confidence in the process behind every RFQ.</p></div>
      <div class="videoStage"><iframe src="${videos.hero}" title="CNC VMC and industrial manufacturing process" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><div class="stageCopy"><span class="eyebrow">Featured manufacturing film</span><h3>From raw material to precision component.</h3><p>CNC, VMC, tooling, fixtures and inspection — the same physical workflow your IndustrialConnect order room is built to coordinate.</p></div></div>
      <div class="videoRail">
        <a class="videoTile" href="${videos.cnc}" target="_blank" rel="noopener"><img src="${posters.cnc}" alt="CNC milling process" loading="lazy"><span class="tilePlay">▶</span><span class="tileCopy"><small>Precision machining</small><b>How a CNC part is made</b></span></a>
        <a class="videoTile" href="${videos.robot}" target="_blank" rel="noopener"><img src="${posters.robot}" alt="Industrial robotics" loading="lazy"><span class="tilePlay">▶</span><span class="tileCopy"><small>Automation</small><b>Robotics on the factory floor</b></span></a>
        <a class="videoTile" href="${videos.laser}" target="_blank" rel="noopener"><img src="${posters.laser}" alt="Laser cutting metal" loading="lazy"><span class="tilePlay">▶</span><span class="tileCopy"><small>Fabrication</small><b>Laser cutting in motion</b></span></a>
      </div>
    </div>`;
    const old=main.querySelector('.mediaShowcase');
    if(old)old.style.display='none';
    main.insertBefore(section,hero.nextElementSibling||null);
  }
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();