(() => {
  const root = document.getElementById('app');
  if (!root) return;

  const pageType = () => {
    const text = (root.innerText || '').toLowerCase();
    if (text.includes('control tower')) return 'admin';
    if (text.includes('matched manufacturing jobs')) return 'supplier';
    if (text.includes('source smarter')) return 'buyer';
    return 'home';
  };

  const copy = {
    home: {
      title: 'Trust is part of the workflow — not a badge on a profile.',
      sub: 'Both sides should know what is verified, what is protected, and what happens next before money or production moves.',
      cards: [
        ['✓', 'Identity & company checks', 'Verification can cover company details, GST information, capabilities and supporting documents before a supplier is presented as verified.'],
        ['↗', 'Protected transaction flow', 'Requirements, quotations, purchase orders, production updates and documents stay connected to the same order record.'],
        ['◎', 'Evidence at every milestone', 'Production, quality and dispatch updates create a visible trail so buyers and suppliers are not relying only on chat promises.']
      ]
    },
    buyer: {
      title: 'Buy with visibility, not guesswork.',
      sub: 'The buyer journey is designed to show the evidence behind a supplier, the commercial terms of a quote and the progress of an order.',
      cards: [
        ['✓', 'Know who you are dealing with', 'Supplier verification status and capability information are shown before you decide which quotation to accept.'],
        ['₹', 'See the full quote', 'Price, quantity, tooling, material, setup, inspection, shipping, GST, lead time and validity can be compared in one place.'],
        ['◷', 'Track after the PO', 'Production milestones, QC documents, shipment information and issue reporting stay inside the Order Room.']
      ]
    },
    supplier: {
      title: 'Win work without giving up control.',
      sub: 'Suppliers need trust too: clear requirements, structured commercial terms, an auditable order trail and transparent payout status.',
      cards: [
        ['✓', 'Qualified buyer requirements', 'Matched RFQs are structured around process, material, quantity, delivery and technical requirements instead of vague lead messages.'],
        ['▣', 'Clear commercial record', 'Your submitted quotation, accepted terms, purchase order and order milestones are tied to one transaction record.'],
        ['₹', 'Payout visibility', 'See the platform fee and supplier payout status associated with completed transaction milestones.']
      ]
    },
    admin: {
      title: 'Trust is operational control.',
      sub: 'The Control Tower surfaces verification gaps, missing documents, late milestones, disputes and payout exceptions instead of hiding them.',
      cards: [
        ['✓', 'Verification queue', 'Review supplier/company evidence before verification status is granted.'],
        ['!', 'Exception-first operations', 'Prioritize disputes, missing QC, delivery exceptions and failed payouts while normal orders continue automatically.'],
        ['⌁', 'Audit trail', 'Keep important transaction actions and state changes traceable for internal review.']
      ]
    }
  };

  const steps = [
    ['01','Verify','Company & capability evidence'],
    ['02','Match','Relevant buyer ↔ supplier'],
    ['03','Compare','Structured quotations'],
    ['04','Execute','PO, payment & production'],
    ['05','Prove','QC, dispatch & delivery']
  ];

  function openTrustCenter() {
    if (document.querySelector('.trust-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'trust-modal';
    modal.innerHTML = `<div class="trust-modal-box" role="dialog" aria-modal="true" aria-label="IndustrialConnect trust center">
      <button class="trust-close" aria-label="Close">×</button>
      <span class="trust-kicker">IndustrialConnect Trust Center</span>
      <h2>What creates trust on the platform?</h2>
      <p>Trust should come from visible evidence and process controls, not from a marketing claim. Verification labels should only be used when the corresponding checks have actually been completed.</p>
      ${[
        ['01','Company verification','Business identity and submitted company evidence can be reviewed before a supplier receives a verified status.'],
        ['02','Capability verification','Machines, processes, materials, tolerances and certifications can be recorded against supplier capabilities.'],
        ['03','Commercial transparency','Quotes use structured cost components and server-side order totals rather than relying on a buyer or supplier calculating the final amount manually.'],
        ['04','Transaction protection','The order record connects accepted quotation, PO, payment status, production, quality, shipment and acceptance.'],
        ['05','Exception handling','Disputes, missing documents, late milestones and payout failures can be routed to the operations team.'],
        ['06','Privacy & access control','Users should only see the RFQs, orders, files and messages they are authorized to access.']
      ].map(x => `<div class="trust-detail"><div class="n">${x[0]}</div><div><b>${x[1]}</b><span>${x[2]}</span></div></div>`).join('')}
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.trust-close').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  function renderTrust() {
    if (!root.querySelector('main') || root.querySelector('.trust-system')) return;
    const type = pageType();
    const c = copy[type];
    const isHome = type === 'home';
    const strip = `<div class="trust-strip"><span class="pulse"></span><span><b>Trust built into the transaction</b> · verification · evidence · controlled access · traceable milestones</span></div>`;
    const stepMarkup = steps.map((s,i) => `<div class="trust-step trust-reveal ${i===0?'is-live':''}" data-step="${i}"><span class="trust-num">${s[0]}</span><b>${s[1]}</b><span>${s[2]}</span></div>`).join('');
    const cardMarkup = c.cards.map(x => `<div class="trust-card trust-reveal"><div class="trust-icon">${x[0]}</div><b>${x[1]}</b><p>${x[2]}</p></div>`).join('');
    const panel = `<section class="trust-panel" aria-label="Trust workflow">
      <div class="trust-head"><div><span class="trust-kicker">Trust layer</span><h3>${c.title}</h3><p>${c.sub}</p><div class="trust-inline"><span class="chip">Evidence-led</span><span class="chip">Role-based access</span><span class="chip">Order traceability</span></div></div><div class="trust-meter"><strong>Workflow controls</strong><i aria-hidden="true"></i><small class="trust-note">Designed to make important actions visible.</small></div></div>
      <div class="trust-steps">${stepMarkup}</div>
      <div class="trust-cards">${cardMarkup}</div>
      <div class="trust-footer"><span>Trust is earned through completed checks and transaction evidence.</span><button class="trust-link" type="button">Explore the Trust Center →</button></div>
    </section>`;
    const host = document.createElement('div');
    host.className = 'trust-system';
    host.innerHTML = strip + panel;
    const main = root.querySelector('main');
    if (main) {
      if (isHome) {
        const hero = main.querySelector('.hero');
        if (hero) hero.insertAdjacentElement('afterend', host);
        else main.prepend(host);
      } else {
        main.prepend(host);
      }
    }
    host.querySelector('.trust-link').onclick = openTrustCenter;
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.12});
    host.querySelectorAll('.trust-reveal').forEach(el => observer.observe(el));

    let current = 0;
    setInterval(() => {
      if (!document.body.contains(host)) return;
      const nodes = host.querySelectorAll('.trust-step');
      nodes.forEach((n,i) => n.classList.toggle('is-live', i === current));
      current = (current + 1) % nodes.length;
    }, 1800);
  }

  const mo = new MutationObserver(() => requestAnimationFrame(renderTrust));
  mo.observe(root, {childList:true, subtree:true});
  requestAnimationFrame(renderTrust);
})();
