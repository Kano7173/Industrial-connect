-- Run after functions.sql. Replaces the simple category-only match with a capability score.
create or replace function public.submit_rfq(p_data jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_rfq uuid;
  v_company uuid;
  v_category uuid;
  v_material text := lower(coalesce(p_data->>'material',''));
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select company_id into v_company from profiles where id=auth.uid();
  if v_company is null then raise exception 'Complete company profile first'; end if;
  select id into v_category from categories where slug=p_data->>'category_slug' and active;
  if v_category is null then raise exception 'Invalid category'; end if;
  insert into rfqs(buyer_company_id,created_by,category_id,title,description,quantity,unit,material,material_grade,tolerance,surface_finish,certification,delivery_location,required_delivery_date,target_price,status)
  values(v_company,auth.uid(),v_category,left(coalesce(p_data->>'title','Manufacturing requirement'),180),p_data->>'description',(p_data->>'quantity')::numeric,coalesce(p_data->>'unit','pcs'),p_data->>'material',p_data->>'material_grade',p_data->>'tolerance',p_data->>'surface_finish',p_data->>'certification',p_data->>'delivery_location',nullif(p_data->>'required_delivery_date','')::date,nullif(p_data->>'target_price','')::numeric,'matching')
  returning id into v_rfq;

  insert into supplier_matches(rfq_id,supplier_id,match_score,match_reason,invited_at)
  select v_rfq,sp.id,
    70 + case when exists(select 1 from unnest(coalesce(sc.materials,'{}')) m where lower(m) = v_material) then 20 else 0 end + case when sp.verification_status='verified' then 10 else 0 end,
    jsonb_build_object('process_match',true,'material_match',exists(select 1 from unnest(coalesce(sc.materials,'{}')) m where lower(m)=v_material),'verification',sp.verification_status),now()
  from supplier_capabilities sc
  join supplier_profiles sp on sp.id=sc.supplier_id
  where sc.category_id=v_category and sc.active and sp.verification_status in ('verified','pending')
  order by 3 desc
  limit 5
  on conflict (rfq_id,supplier_id) do update set match_score=excluded.match_score,match_reason=excluded.match_reason,invited_at=excluded.invited_at;
  return v_rfq;
end; $$;
grant execute on function public.submit_rfq(jsonb) to authenticated;
