(function(){
  const IMAGES={
    hero:'https://images.pexels.com/videos/852341/free-video-852341.jpg?auto=compress&dpr=1&w=2400',
    cnc:'https://images.pexels.com/videos/30409129/free-video-30409129.jpg?auto=compress&dpr=1&w=1400',
    milling:'https://images.pexels.com/videos/18883365/free-video-18883365.jpg?auto=compress&dpr=1&w=1400',
    robot:'https://images.pexels.com/videos/32386522/free-video-32386522.jpg?auto=compress&dpr=1&w=1400',
    laser:'https://images.pexels.com/videos/28268186/free-video-28268186.jpg?auto=compress&dpr=1&w=1400'
  };
  const steps=[
    ['01','Requirement','Tell us what you need manufactured.','Post an RFQ with drawing, quantity, material and delivery.','cnc'],
    ['02','Matching','The right capability, not a random directory.','Requirements are matched to relevant manufacturing capabilities.','robot'],
    ['03','Compare','See commercial details clearly.','Compare structured quotations, lead time and terms side by side.','milling'],
    ['04','Produce','Know what is happening after you order.','Production milestones and evidence stay connected to the order.','cnc'],
    ['05','Deliver','Finish with proof, not guesswork.','Quality, dispatch, delivery and acceptance complete the transaction record.','laser']
  ];
  let timer=null;
  function esc(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function nav(){
    return `<nav class="nav ic-v4-nav"><div class="container navin"><button class="brand" onclick="go('home')"><span class="mark">IC</span><span>IndustrialConnect</span></button><div class="navlinks"><a href="#workflow">Workflow</a><a href="#platform">Platform</a><a href="#network">Network</a></div><div class="actions">${typeof sessionUser!=='undefined'&&sessionUser?`<button class="btn ghost" onclick="go('dashboard')">Workspace</button><button class="btn" onclick="logout()">Sign out</button>`:`<button class="btn ghost" onclick="openAuth('signin')">Sign in</button><button class="btn primary" onclick="openAuth('signup')">Get started</button>`}</div></div></nav>`;
  }
  function homeV4(){
    return `${nav()}<main class="ic-v4-home">
      <section class="ic-hero"><div class="ic-hero-media"></div><div class="container ic-hero-inner">
        <span class="ic-kicker"><i></i> India-first manufacturing network</span>
        <h1>Build faster.<br>Source smarter.</h1>
        <p class="ic-hero-copy">IndustrialConnect turns a manufacturing requirement into a structured journey — matched manufacturers, comparable quotes, production visibility and delivery evidence.</p>
        <div class="ic-actions"><button class="ic-btn ic-btn-main" onclick="openRFQ()">Post a requirement <span>↗</span></button><button class="ic-btn ic-btn-ghost" onclick="document.getElementById('workflow').scrollIntoView({behavior:'smooth'})">See how it works <span>↓</span></button></div>
        <div class="ic-hero-meta"><span class="ic-meta">✓ Capability matching</span><span class="ic-meta">✓ Structured RFQs</span><span class="ic-meta">✓ Order visibility</span></div>
      </div><div class="ic-float"><small>Live order journey</small><strong>2,000 pcs · CNC shaft</strong><div class="ic-mini-flow"><span class="active"></span><span class="active"></span><span class="active"></span><span></span><span></span></div><small>Production · 62%</small></div></section>

      <section id="workflow" class="ic-section"><div class="container"><div class="ic-section-head"><span class="ic-label">The new procurement layer</span><h2>One requirement.<br>One connected journey.</h2><p>Stop jumping between calls, spreadsheets, quotations and courier updates. Keep the commercial and production story connected from the first RFQ to final delivery.</p></div>
        <div class="ic-flow">${steps.map((s,i)=>`<div class="ic-flow-card"><span class="ic-flow-num">${s[0]}</span><div class="ic-flow-icon">${['↗','⌁','≡','◌','✓'][i]}</div><h3>${s[1]}</h3><p>${s[2]}</p><span class="ic-arrow">→</span></div>`).join('')}</div>
      </div></section>

      <section id="platform" class="ic-section dark"><div class="container"><div class="ic-section-head"><span class="ic-label">See the platform in motion</span><h2>Not a directory.<br>A transaction system.</h2><p>Explore what the buyer actually experiences as an order moves through IndustrialConnect.</p></div>
        <div class="ic-interactive"><div class="ic-demo-grid"><div class="ic-step-buttons">${steps.map((s,i)=>`<button class="ic-step-btn ${i===0?'active':''}" data-step="${i}"><span>${s[0]}</span><b>${s[1]}</b><br><small>${s[2]}</small></button>`).join('')}</div><div class="ic-demo-screen"><div class="ic-demo-image" style="background-image:url('${IMAGES.cnc}')"></div><div class="ic-demo-progress"><i></i></div><div class="ic-demo-copy"><small>01 · Requirement</small><h3>Start with what you need made.</h3><p>Upload the drawing, choose the process, set quantity and delivery. The workflow does the rest.</p></div></div></div></div>
      </div></section>

      <section id="network" class="ic-section"><div class="container"><div class="ic-section-head"><span class="ic-label">Manufacturing, visually organised</span><h2>From machine floor<br>to order room.</h2><p>Real manufacturing context becomes part of the experience — CNC, VMC, robotics, laser, casting, fabrication and more.</p></div>
        <div class="ic-product"><div class="ic-product-card"><div class="ic-product-media" style="background-image:url('${IMAGES.robot}')"></div><div class="ic-product-overlay"></div><div class="ic-product-content"><span class="ic-label">Capability network</span><h3>Find the right process, not just a supplier.</h3><p>CNC turning, VMC, job work, investment casting, fabrication, laser cutting, sheet metal and specialised processes — organised around actual requirements.</p></div></div><div class="ic-product-side"><article class="ic-story"><span class="tiny">01 · Buyer</span><h3>Upload once.</h3><p>Your requirement becomes a structured RFQ instead of a message that gets lost in a chat.</p></article><article class="ic-story"><span class="tiny">02 · Supplier</span><h3>Quote with context.</h3><p>Manufacturers receive relevant work and respond with consistent commercial details.</p></article><article class="ic-story"><span class="tiny">03 · Operations</span><h3>Control exceptions.</h3><p>Late production, missing evidence, disputes and payouts become visible signals instead of surprises.</p></article></div></div>
      </div></section>

      <section class="ic-section"><div class="container"><div class="ic-section-head"><span class="ic-label">The Order Room</span><h2>Everything after<br>“accept quote”.</h2><p>The place where the buyer, manufacturer and operations team stay aligned.</p></div><div class="ic-product"><div class="ic-product-side"><article class="ic-story"><span class="tiny">ORDER</span><h3>Commercials locked.</h3><p>Accepted quote, order value, platform fee, supplier payout and expected delivery remain traceable.</p></article><article class="ic-story"><span class="tiny">PRODUCTION</span><h3>Milestones visible.</h3><p>Material received → production → QC → packed → dispatched.</p></article><article class="ic-story"><span class="tiny">EVIDENCE</span><h3>Proof stays attached.</h3><p>Inspection reports, material certificates, photos and shipment records belong to the order.</p></article></div><div class="ic-product-card"><div class="ic-product-media" style="background-image:url('${IMAGES.cnc}')"></div><div class="ic-product-overlay"></div><div class="ic-product-content"><span class="ic-label">IC-2026-000128</span><h3>2,000 pcs · Production 62%</h3><p>Material received · machining in progress · quality inspection next.</p><button class="ic-btn ic-btn-ghost" onclick="openOrders()">Open Order Room →</button></div></div></div></div></section>

      <section class="ic-cta"><div class="container"><div class="ic-cta-card"><div><span class="ic-label">Start with one real requirement</span><h2>Give your next manufacturing job a better workflow.</h2><p>Post the requirement. Compare manufacturers. Keep the order visible until delivery.</p></div><button class="ic-btn ic-btn-main" onclick="openRFQ()">Post a requirement <span>↗</span></button></div></div></section>
    </main><footer class="footer"><div class="container">© 2026 IndustrialConnect India · Manufacturing procurement, connected.</div></footer>`;
  }
  function bind(){
    const buttons=[...document.querySelectorAll('.ic-step-btn')];
    const image=document.querySelector('.ic-demo-image'); const copy=document.querySelector('.ic-demo-copy'); if(!buttons.length||!image||!copy)return;
    function activate(i){const s=steps[i];buttons.forEach((b,j)=>b.classList.toggle('active',j===i));image.style.backgroundImage=`url('${IMAGES[s[4]]}')`;copy.innerHTML=`<small>${s[0]} · ${esc(s[1])}</small><h3>${esc(s[2])}</h3><p>${esc(s[3])}</p>`;}
    buttons.forEach((b,i)=>b.addEventListener('click',()=>{activate(i);clearInterval(timer);timer=setInterval(()=>activate((i=(i+1)%steps.length)),5000)}));
    clearInterval(timer);let i=0;timer=setInterval(()=>{i=(i+1)%steps.length;activate(i)},5000);
    document.querySelectorAll('.ic-btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.04}px,${(e.clientY-r.top-r.height/2)*.04}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
  }
  function install(){
    if(typeof app==='undefined'||!app)return;
    const isHome=location.hash===''||location.hash==='#home'||document.querySelector('.hero');
    if(isHome){app.innerHTML=homeV4();bind();}
  }
  window.addEventListener('hashchange',()=>setTimeout(install,30));
  const oldGo=window.go; if(oldGo)window.go=function(page){clearInterval(timer);return oldGo(page)};
  setTimeout(install,60);
})();
