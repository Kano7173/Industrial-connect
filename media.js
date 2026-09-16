(function(){
  const videos={
    cnc:'https://www.youtube.com/embed/ytgweXSncD0?autoplay=1&mute=1&loop=1&playlist=ytgweXSncD0&controls=0&rel=0',
    machining:'https://www.youtube.com/embed/vTBFVDwiH_8?autoplay=1&mute=1&loop=1&playlist=vTBFVDwiH_8&controls=0&rel=0'
  };
  const images=[
    ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85','Precision manufacturing','CNC & engineering'],
    ['https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1000&q=85','Factory floor','Production'],
    ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=85','Machine tools','Machining'],
    ['https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1000&q=85','Industrial systems','Automation'],
    ['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=85','Engineering team','Quality & planning']
  ];
  function mount(){
    const main=document.querySelector('main');
    if(!main||document.querySelector('.mediaShowcase'))return;
    const hero=main.querySelector('.hero');
    if(!hero)return;
    const section=document.createElement('section');
    section.className='mediaShowcase';
    section.innerHTML=`<div class="container">
      <div class="mediaHead"><div><span class="mediaKicker">Manufacturing in motion</span><h2>See the work behind the workflow.</h2><p>From CNC machining to factory production, IndustrialConnect is designed around the real manufacturing floor — not a static supplier directory.</p></div></div>
      <div class="mediaGrid">
        <article class="mediaCard large mediaVideo" data-video="cnc"><img src="${images[0][0]}" alt="Precision CNC manufacturing" loading="lazy"><span class="motionLine"></span><span class="play" aria-label="Play manufacturing video"></span><span class="mediaShade"></span><span class="mediaLabel"><small>Watch manufacturing</small><strong>CNC → VMC → finished component</strong></span></article>
        <article class="mediaCard"><img src="${images[1][0]}" alt="Industrial factory floor" loading="lazy"><span class="mediaShade"></span><span class="mediaLabel"><small>Production</small><strong>Factory floor</strong></span></article>
        <article class="mediaCard"><img src="${images[2][0]}" alt="Industrial machine tools" loading="lazy"><span class="mediaShade"></span><span class="mediaLabel"><small>Capability</small><strong>Machine tools</strong></span></article>
        <article class="mediaCard"><img src="${images[3][0]}" alt="Industrial automation" loading="lazy"><span class="mediaShade"></span><span class="mediaLabel"><small>Technology</small><strong>Automation</strong></span></article>
        <article class="mediaCard mediaVideo" data-video="machining"><img src="${images[4][0]}" alt="Engineering and quality planning" loading="lazy"><span class="play" aria-label="Play machining video"></span><span class="mediaShade"></span><span class="mediaLabel"><small>Watch machining</small><strong>Inside the manufacturing process</strong></span></article>
      </div>
      <div class="mediaStrip"><span class="mediaPill">CNC Turning</span><span class="mediaPill">VMC / Milling</span><span class="mediaPill">Investment Casting</span><span class="mediaPill">Fabrication</span><span class="mediaPill">Laser Cutting</span><span class="mediaPill">Quality Inspection</span><span class="mediaPill">Dispatch</span></div>
    </div>`;
    main.insertBefore(section,main.children[1]||null);
    section.querySelectorAll('.mediaVideo').forEach(card=>card.addEventListener('click',()=>openVideo(card.dataset.video)));
  }
  function openVideo(key){
    const wrap=document.createElement('div');wrap.className='mediaModal';
    wrap.innerHTML=`<div class="mediaModalInner"><button class="mediaClose" aria-label="Close">×</button><iframe src="${videos[key]}" title="Industrial manufacturing video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    document.body.appendChild(wrap);
    const close=()=>wrap.remove();wrap.querySelector('.mediaClose').onclick=close;wrap.addEventListener('click',e=>{if(e.target===wrap)close()});document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}});
  }
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();