(function(){
  const media=[
    {kicker:'01 / REQUIREMENT',title:'Post the exact job you need made.',text:'Upload your drawing, choose the manufacturing process, set quantity and delivery date. IndustrialConnect turns it into a structured RFQ.',image:'https://images.pexels.com/photos/3862618/pexels-photo-3862618.jpeg?auto=compress&cs=tinysrgb&w=1800',tag:'BUYER',accent:'01'},
    {kicker:'02 / MATCHING',title:'We match the requirement to capable manufacturers.',text:'Process, material, capability and capacity signals narrow the supplier pool to relevant manufacturers instead of a random directory.',image:'https://images.pexels.com/photos/3846550/pexels-photo-3846550.jpeg?auto=compress&cs=tinysrgb&w=1800',tag:'MATCH',accent:'02'},
    {kicker:'03 / QUOTES',title:'Compare structured quotes in one place.',text:'See price, lead time, tooling, inspection, shipping and commercial terms side by side before selecting a supplier.',image:'https://images.pexels.com/photos/162568/oil-pump-jack-silhouette-sunset-sky-162568.jpeg?auto=compress&cs=tinysrgb&w=1800',tag:'COMPARE',accent:'03'},
    {kicker:'04 / PRODUCTION',title:'Track the order while it is being made.',text:'Material received. Production started. Quality check. Every milestone is visible inside the Order Room.',image:'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1800',tag:'ORDER ROOM',accent:'04'},
    {kicker:'05 / DELIVERY',title:'Quality evidence, dispatch and delivery — together.',text:'Documents, inspection evidence, shipment updates and buyer acceptance close the loop from RFQ to completed order.',image:'https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=1800',tag:'DELIVERED',accent:'05'}
  ];

  function mount(){
    const main=document.querySelector('main');
    const hero=main&&main.querySelector('.hero');
    if(!main||!hero||hero.dataset.cinematicV4==='1')return;
    hero.dataset.cinematicV4='1';
    hero.classList.add('cinematicHero');

    const bg=document.createElement('div');
    bg.className='heroMediaBg';
    bg.innerHTML=media.map((m,i)=>'<img src="'+m.image+'" alt="Industrial manufacturing background '+(i+1)+'" '+(i?'loading="lazy"':'')+' class="heroSlide '+(i===0?'is-active':'')+'">').join('');
    hero.prepend(bg);
    const scan=document.createElement('span');scan.className='scan';hero.appendChild(scan);

    const stat=document.createElement('div');
    stat.className='cinematicStat';
    stat.innerHTML='<b>INDUSTRIALCONNECT / ORDER FLOW</b><span>Requirement → matching → quotes → production → delivery</span><i><em></em></i>';
    hero.appendChild(stat);

    const old=main.querySelector('.mediaShowcase');if(old)old.remove();
    const oldCinema=main.querySelector('.cinematicSection');if(oldCinema)oldCinema.remove();

    const section=document.createElement('section');
    section.className='cinematicSection workflowFilm';
    section.innerHTML='<div class="container">'+
      '<div class="cinematicHead"><span class="kicker">HOW YOUR ORDER MOVES</span><h2>From requirement to delivery.<br><span>One clear workflow.</span></h2><p>No YouTube. No generic product tour. This is an interactive visual explanation of how a real IndustrialConnect order moves.</p></div>'+ 
      '<div class="workflowFilmGrid">'+
        '<div class="workflowVisual"><div class="visualFrame"><div class="visualImages">'+media.map((m,i)=>'<img src="'+m.image+'" alt="'+m.title+'" class="workflowImage '+(i===0?'is-active':'')+'" data-step="'+i+'">').join('')+'</div><div class="visualShade"></div><div class="visualBadge"><span>LIVE ORDER JOURNEY</span><b id="workflowCounter">01 / 05</b></div><div class="visualLabel"><small id="workflowTag">BUYER</small><strong id="workflowTitle">Post your requirement</strong></div></div></div>'+ 
        '<div class="workflowInfo"><div class="workflowSteps">'+media.map((m,i)=>'<button class="workflowStep '+(i===0?'is-active':'')+'" data-step="'+i+'"><span class="stepNo">'+m.accent+'</span><span><b>'+m.kicker.split(' / ')[1]+'</b><small>'+m.title+'</small></span></button>').join('')+'</div><div class="workflowDetail"><span class="detailKicker" id="workflowKicker">01 / REQUIREMENT</span><h3 id="workflowDetailTitle">Post the exact job you need made.</h3><p id="workflowDetailText">Upload your drawing, choose the manufacturing process, set quantity and delivery date. IndustrialConnect turns it into a structured RFQ.</p><div class="detailProgress"><span></span></div><div class="autoNote"><i></i> Auto-playing demonstration <button id="workflowPause" type="button">Pause</button></div></div></div>'+ 
      '</div>'+ 
      '<div class="workflowBottom"><div><span class="kicker">DESIGNED FOR PROCUREMENT TEAMS</span><b>Less searching. More controlled execution.</b></div><div class="miniFlow"><span>RFQ</span><i>→</i><span>QUOTE</span><i>→</i><span>PO</span><i>→</i><span>QC</span><i>→</i><span>DELIVERY</span></div></div>'+ 
    '</div>';
    main.insertBefore(section,hero.nextElementSibling||null);

    let active=0,paused=false,timer=null;
    const images=[...section.querySelectorAll('.workflowImage')],steps=[...section.querySelectorAll('.workflowStep')];
    const title=document.getElementById('workflowDetailTitle'),text=document.getElementById('workflowDetailText'),kicker=document.getElementById('workflowKicker'),counter=document.getElementById('workflowCounter'),tag=document.getElementById('workflowTag'),visualTitle=document.getElementById('workflowTitle');
    function render(i){
      active=i;const m=media[i];
      images.forEach((el,n)=>el.classList.toggle('is-active',n===i));steps.forEach((el,n)=>el.classList.toggle('is-active',n===i));
      kicker.textContent=m.kicker;title.textContent=m.title;text.textContent=m.text;counter.textContent=m.accent+' / 05';tag.textContent=m.tag;visualTitle.textContent=m.title;
      section.style.setProperty('--step-progress',((i+1)/media.length*100)+'%');
    }
    function start(){clearInterval(timer);if(!paused)timer=setInterval(()=>render((active+1)%media.length),4800)}
    steps.forEach((btn)=>btn.addEventListener('click',()=>{render(Number(btn.dataset.step));start()}));
    const pause=document.getElementById('workflowPause');
    pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';if(paused)clearInterval(timer);else start()});
    section.addEventListener('mouseenter',()=>{if(!paused)clearInterval(timer)});section.addEventListener('mouseleave',()=>{if(!paused)start()});
    render(0);start();
  }
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();