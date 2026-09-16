-- Secure transactional helpers. Run after schema.sql.

create or replace function public.submit_rfq(p_data jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_rfq uuid;
  v_company uuid;
  v_category uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select company_id into v_company from profiles where id=auth.uid();
  if v_company is null then raise exception 'Complete company profile first'; end if;
  select id into v_category from categories where slug=p_data->>'category_slug' and active;
  if v_category is null then raise exception 'Invalid category'; end if;

  insert into rfqs(buyer_company_id,created_by,category_id,title,description,quantity,unit,material,material_grade,tolerance,surface_finish,certification,delivery_location,required_delivery_date,target_price,status)
  values(v_company,auth.uid(),v_category,
    left(coalesce(p_data->>'title','Manufacturing requirement'),180),p_data->>'description',
    (p_data->>'quantity')::numeric,coalesce(p_data->>'unit','pcs'),p_data->>'material',p_data->>'material_grade',p_data->>'tolerance',p_data->>'surface_finish',p_data->>'certification',p_data->>'delivery_location',nullif(p_data->>'required_delivery_date','')::date,nullif(p_data->>'target_price','')::numeric,'matching')
  returning id into v_rfq;

  insert into supplier_matches(rfq_id,supplier_id,match_score,match_reason,invited_at)
  select v_rfq,sc.supplier_id,70,jsonb_build_object('process',true),now()
  from supplier_capabilities sc
  join supplier_profiles sp on sp.id=sc.supplier_id
  where sc.category_id=v_category and sc.active and sp.verification_status='verified'
  on conflict (rfq_id,supplier_id) do nothing;

  return v_rfq;
end; $$;
grant execute on function public.submit_rfq(jsonb) to authenticated;

create or replace function public.create_order_from_quote(p_quote_id uuid,p_commission_percent numeric default 2) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  q quotes%rowtype;
  r rfqs%rowtype;
  v_order uuid;
  v_subtotal numeric;
  v_gst numeric;
  v_total numeric;
  v_fee numeric;
  v_payout numeric;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into q from quotes where id=p_quote_id and status in ('submitted','shortlisted');
  if not found then raise exception 'Quote is not available'; end if;
  select * into r from rfqs where id=q.rfq_id;
  if r.buyer_company_id <> (select company_id from profiles where id=auth.uid()) then raise exception 'Not authorized'; end if;
  if p_commission_percent < 0 or p_commission_percent > 20 then raise exception 'Invalid commission'; end if;

  v_subtotal := (q.unit_price*q.quantity)+q.tooling_cost+q.material_cost+q.setup_cost+q.packaging_cost+q.inspection_cost+q.shipping_cost;
  v_gst := round(v_subtotal*q.gst_percent/100,2);
  v_fee := round((v_subtotal+v_gst)*p_commission_percent/100,2);
  v_total := v_subtotal+v_gst+v_fee;
  v_payout := v_total-v_fee;

  insert into orders(order_number,rfq_id,buyer_company_id,supplier_id,accepted_quote_id,subtotal,gst_amount,platform_fee,total_amount,commission_percent,supplier_payout_amount,expected_delivery_date,status)
  values(next_order_number(),r.id,r.buyer_company_id,q.supplier_id,q.id,v_subtotal,v_gst,v_fee,v_total,p_commission_percent,v_payout,r.required_delivery_date,'payment_pending')
  returning id into v_order;

  insert into order_items(order_id,description,quantity,unit,unit_price) values(v_order,r.title,q.quantity,q.unit,q.unit_price);
  insert into platform_fees(order_id,commission_percent,fee_amount,status) values(v_order,p_commission_percent,v_fee,'pending');
  insert into supplier_payouts(order_id,supplier_id,amount,status) values(v_order,q.supplier_id,v_payout,'pending');
  update quotes set status='accepted' where id=q.id;
  update rfqs set status='order_created' where id=r.id;
  return v_order;
end; $$;
grant execute on function public.create_order_from_quote(uuid,numeric) to authenticated;

-- Admin-only commission setting helper. Keep business rules server-side.
create or replace function public.set_order_commission(p_order_id uuid,p_percent numeric) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin only'; end if;
 if p_percent < 0 or p_percent > 20 then raise exception 'Invalid commission'; end if;
 update orders set commission_percent=p_percent,platform_fee=round((subtotal+gst_amount)*p_percent/100,2),supplier_payout_amount=total_amount-round((subtotal+gst_amount)*p_percent/100,2) where id=p_order_id;
 update platform_fees set commission_percent=p_percent,fee_amount=round((select (subtotal+gst_amount)*p_percent/100 from orders where id=p_order_id),2) where order_id=p_order_id;
end; $$;
grant execute on function public.set_order_commission(uuid,numeric) to authenticated;
