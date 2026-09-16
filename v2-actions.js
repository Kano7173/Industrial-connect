(() => {
  const cfg=window.INDUSTRIALCONNECT_SUPABASE||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey)return;
  const db=window.supabase.createClient(cfg.url,cfg.anonKey);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>'₹'+Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2});
  window.openRFQDetail=async id=>{
    const {data,error}=await db.from('rfqs').select('*,categories(name),supplier_matches(id,match_score,supplier_profiles(id,companies(name),verification_status)),quotes(id,supplier_id,unit_price,quantity,tooling_cost,material_cost,setup_cost,packaging_cost,inspection_cost,shipping_cost,gst_percent,lead_time_days,payment_terms,valid_until,status,supplier_profiles(id,companies(name),verification_status))').eq('id',id).single();
    if(error){toast(error.message);return;}
    const quotes=data.quotes||[];
    const m=document.createElement('div');m.className='modalWrap';m.innerHTML=`<div class="modal wide"><div class="modalHead"><div><span class="badge">${esc(data.status)}</span><b>${esc(data.title)}</b><small>${esc(data.categories?.name||'')} · ${esc(data.quantity)} ${esc(data.unit)} · ${esc(data.material)}</small></div><button class="close" onclick="this.closest('.modalWrap').remove()">×</button></div><div class="modalBody"><div class="matchBanner">${data.supplier_matches?.length||0} manufacturers matched · ${quotes.length} structured quote(s)</div><div style="margin-top:14px">${quotes.map(q=>{const base=Number(q.unit_price)*Number(q.quantity)+['tooling_cost','material_cost','setup_cost','packaging_cost','inspection_cost','shipping_cost'].reduce((s,k)=>s+Number(q[k]||0),0);const gst=base*Number(q.gst_percent||0)/100;const total=base+gst;return `<div class="quoteCard"><div><b>${esc(q.supplier_profiles?.companies?.name||'Verified manufacturer')}</b><span>${esc(q.supplier_profiles?.verification_status||'verified')} · ${q.lead_time_days} days · ${esc(q.payment_terms||'Terms not specified')}</span><span>Base ${money(base)} + GST ${money(gst)}</span></div><strong>${money(total)}</strong><button class="btn primary" onclick="acceptQuoteLive('${q.id}')">${q.status==='accepted'?'Accepted':'Accept quote'} →</button></div>`}).join('')||'<div class="empty compact">No quotes yet. Matching is active; suppliers will submit structured quotes here.</div>'}</div></div></div>`;document.body.appendChild(m);
  };
  window.acceptQuoteLive=async quoteId=>{try{const {data,error}=await db.rpc('create_order_from_quote',{p_quote_id:quoteId,p_commission_percent:2});if(error)throw error;document.querySelector('.modalWrap')?.remove();toast('Order created. Payment is pending.');go('dashboard');}catch(e){toast(e.message||'Could not accept quote');}};
})();
